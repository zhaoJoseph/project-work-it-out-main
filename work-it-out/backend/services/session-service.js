const { google } = require("googleapis");
const { User, Set, Session } = require("../models");
const Response = require("../utils/Response");

const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);

function totalTime(session) {
    let total = 0;
    for(let index in session.exercises) {
        let exercise = session.exercises[index];
        for (let setIndex in exercise.sets) {
            const set = exercise.sets[setIndex];
            total += convertSeconds(set.totalTime);
        }
    }
    return total;
}

function convertToPoints(session, start, end) {
    let points = [];
    for(let index in session.exercises) {
        let exercise = session.exercises[index];
        if((exercise.type === 'cardio') || (exercise.type === 'cardioStationary')) {
            continue;
        }
        for (let setIndex in exercise.sets) {
            const set = exercise.sets[setIndex];
            const point = {dataTypeName : 'com.google.activity.exercise', startTimeNanos: start * 1000000, endTimeNanos: end * 1000000,};
            point.value = [
                {
                    stringVal: 'good_morning'
                },
                {
                    intVal : set.reps
                },
                {
                    intVal : convertSeconds(set.totalTime) * 1000
                },
                {
                    intVal : 5,
                },
                {
                    fpVal: set.weight * 0.45 
                }
            ]
            points.push(point);
        }
    }
    return points;
}

async function updateGFit(token, refresh, data) {
    oAuth2Client.setCredentials({ access_token : token, refresh_token: refresh});
    const fitnessStore = google.fitness({version : 'v1', auth : oAuth2Client});
    await createDataSource(fitnessStore);

    const datasources = await fitnessStore.users.dataSources.list({userId : 'me'});
    let dataSource;

    for(let index in datasources.data.dataSource) {
        const source = datasources.data.dataSource[index];
        if(source.dataStreamName === 'MyDataSourceExerciseUser') {
            dataSource = source;   
        }
    }

    const totalSeconds = totalTime(data);

    const start = new Date(data.date).valueOf();
    const end = new Date(data.date).valueOf() + totalSeconds;

    const points = convertToPoints(data, start, end);

    if(points.length < 1) {
        return;
    }

    await addDatapoints(fitnessStore, dataSource, points, start, end);

    await createSession(fitnessStore, data, start, end);
}

async function createSession(store, data, start, end) {

    const sessionId =  `${crypto.randomUUID()}Session`;

    store.users.sessions.update({
        userId : "me",
        sessionId: sessionId,
    }, {body : JSON.stringify(
        {
            id : sessionId,
            name : `Session on ${data.date}`,
            description: `Session on ${data.date}`,
            startTimeMillis: start ,
            endTimeMillis: end,
            modifiedTimeMillis: 0,
            application : {
                name: "Fitness App",
                version: "1"
              },
            activityType: 97,
            activeTimeMillis: end - start
        }
    )})
}

function convertSeconds(time) {
    const numbers = time.split(':');
    return parseInt(numbers[0])*60*60 + parseInt(numbers[1]) * 60 + parseInt(numbers[2]);
}

async function addDatapoints(store, dataSource, data, start, end) {
    store.users.dataSources.datasets.patch({
        dataSourceId: dataSource.dataStreamId,
        datasetId : 'randomdata',
        userId: 'me',
        resource: {
            dataSourceId: dataSource.dataStreamId,
            minStartTimeNs: start * 1000000,
            maxEndTimeNs : end * 1000000,
            point: [...data]
        }
    }).then(function(response) {
    }, function(err) {
        console.log(err);
    })
}

async function createDataSource(store) {

    return store.users.dataSources.create(
        {
            "userId" : "me"
        },
        {body : 
        
        JSON.stringify({
            "dataStreamName": "MyDataSourceExerciseUser",
            "userId" : "me",
            "type": "derived",
            "application": {
              "name": "Fitness App",
              "version": "1"
            },
            "dataType": {
              "name": "com.google.activity.exercise"
            },
            "device": {
              "manufacturer": "Example Manufacturer",
              "model": "ExampleTablet",
              "type": "tablet",
              "uid": "1000001",
              "version": "1"
            }
          })
        }
    ).then(function(response) {
    }, function(err) {
        console.log(err, 'error');
    })
}

module.exports = {

    async createSession(id, session) {
        const user = await User.findById(id).select('+gfitToken +refreshToken');
        let tries = 1;
        if(!user) {
            return new Response("Error", 404, "User not found.",  null);
        }

        if(!session.date || !session.exercises || (session.exercises.length < 1)) {
            return new Response("Error", 400, "Invalid session.",  null);
        } 

        if(user.syncActive) {
            let token = user.gfitToken;
            try{
                await updateGFit(token, user.refreshToken, session);
            }catch(err) {
                console.log(err);
            }
        }

        let setInserts = [];
        for(let index in session.exercises) {
            let exercise = session.exercises[index];
            if(!exercise.name || !exercise.sets || (exercise.sets.length < 1)) {
                return new Response("Error", 400, "Invalid session.",  null);
            }
            for (let setIndex in exercise.sets) {
                const set = exercise.sets[setIndex];
                if(!set.totalTime || !set.restTime) {
                    return new Response("Error", 400, "Invalid session.",  null);
                }
                let addSet = {workout : exercise.name, setNumber : setIndex, duration : set.totalTime, rest : set.restTime, bodyPart: exercise.type, ...set};
                delete addSet['totalTime'];
                delete addSet['restTime'];
                setInserts.push(addSet);
            }
        }
        const sess = new Session({
            date: new Date(session.date),
            user : id,
            Sets: []
        });

        await sess.save();
        setInserts.forEach((set, index) => {
            setInserts[index] = {...set, session : sess.id};
        });
        try{
            const insertedSets = await Set.insertMany(setInserts);
            const ids = insertedSets.map(e => e.id);
            await sess.updateOne({$set : {Sets : ids}});
            return new Response("Success", 200, "Session created!",  null);
        }catch(err) {
            console.log(err);
            return new Response("Error", 500, "Internal server error.",  null);
        }
    } ,

    async getSessionPeriod(startDate, endDate, id) {

        if(!startDate || !endDate || !id) {
            return new Response("Error", 400, "Params missing.",  {sets : []});
        }

        const user = User.findById(id);
        if(!user) {
            return new Response("Error", 404, "User not found.",  {sets : []});
        }
        const sessions = await Session.find({"user" : id, "date" : {$gte : startDate, $lte : endDate }});        
        if(!sessions || (sessions.length < 1)) {
            return new Response("Error", 404, "No sets found.",  {sets : []});
        }
        let setsToReturn = [];
        for(let index in sessions) {
            const session = sessions[index];
            let sets = await Set.find({_id : {$in : session.Sets}});
            if(!sets || (sets.length < 1)) {
                return new Response("Error", 404, "Session has no sets.",  {sets : []});
            }
            const foundSets = sets.map(x => ({
                ...x,
                date: session.date
            }));
            setsToReturn = [...setsToReturn, ...foundSets];
        }
        return new Response("Success", 200, "Sets Found!.",  {sets : setsToReturn});
    }
}