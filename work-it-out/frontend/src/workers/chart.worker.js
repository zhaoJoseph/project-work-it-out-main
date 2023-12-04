// import {Chart} from 'chart.js/auto';
// import 'chartjs-adapter-moment';
// import axios from 'axios';
// import moment from 'moment';
importScripts("https://cdn.jsdelivr.net/npm/axios@1.6.2/dist/axios.min.js");  
importScripts("https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js");   

async function getPeriod(id, startDate, endDate) {
        return axios.get(`http://localhost:3001/session/${id}/period/?startDate=${startDate}&endDate=${endDate}`, {withCredentials : true})
        .then(res => {
                if(res.status === 200) {
                    return res.data;
                }
        }).catch(err => {
                return [];
        });
}

async function getAvgWeight(data) {

        let dataSets = [];

        let workouts = {};

        for(let index in data.sets) {
           let set = data.sets[index];
           const setData = set._doc;
           if(setData.bodyPart === 'cardio') {
                continue;
           }
           if(workouts.hasOwnProperty(setData.workout)) {
                if(workouts[setData.workout].dates.hasOwnProperty(set.date)) {
                        workouts[setData.workout]['dates'][set.date].total += setData.weight;
                        workouts[setData.workout]['dates'][set.date].count += 1;
                }else {
                        let newItem = {total : setData.weight, count : 1};
                        workouts[setData.workout]['dates'][set.date] = newItem;
                }
                workouts[setData.workout].count += 1
           }else {
                let newExercise = {};
                let newItem = {};
                newItem.total = setData.weight;
                newItem.count = 1;

                if(!newExercise.dates) {
                        newExercise.dates = {};
                }
                newExercise['dates'][set.date] = newItem;
                newExercise.count = 1;
                workouts[setData.workout] = newExercise;
           }
        }

        let workoutArray = Object.entries(workouts);

        function compareWorkouts (a, b) {
                return a[1].total - b[1].total;
        }

        if(workoutArray.length > 5) {
                workoutArray.sort(compareWorkouts);
                workoutArray.splice(6, workoutArray.length )
                
        }
        const newArr = Object.fromEntries(workoutArray);
        workouts = newArr;

        for(const workout in workouts) {
                let workoutChart = {};
                workoutChart.label = workout;
                let workoutData = [];
                for(let day in workouts[workout].dates) {
                        const dateAvg = {};
                        let avg = workouts[workout]['dates'][day].total / workouts[workout]['dates'][day].count;
                        dateAvg.x = moment(day);
                        dateAvg.y = avg;
                        workoutData.push(dateAvg);
                }
                workoutChart.data = workoutData;
                workoutChart.showLine = true;
                workoutChart.fill = false;
                workoutChart.pointStyle = 'circle';
                workoutChart.pointRadius = 8;
                const color = `${getColor()}`;
                workoutChart.backgroundColor = color;
                workoutChart.borderColor = color;
                workoutChart.hoverBackgroundColor = "rgba(255,99,132,0.4)",
                workoutChart.hoverBorderColor = "rgba(255,99,132,1)",
                dataSets.push(workoutChart);
        }
        return dataSets;

}

async function getAvgReps(data) {
        let dataSets = [];

        let workouts = {};

        for(let index in data.sets) {
           let set = data.sets[index];
           const setData = set._doc;
           console.log(setData);
           if(setData.bodyPart === 'cardio') {
                continue;
           }
           if(workouts.hasOwnProperty(setData.workout)) {
                if(workouts[setData.workout].dates.hasOwnProperty(set.date)) {
                        workouts[setData.workout]['dates'][set.date].total += setData.reps;
                        workouts[setData.workout]['dates'][set.date].count += 1;
                }else {
                        let newItem = {total : setData.reps, count : 1};
                        workouts[setData.workout]['dates'][set.date] = newItem;
                }
                workouts[setData.workout].count += 1
           }else {
                let newExercise = {};
                let newItem = {};
                newItem.total = setData.reps;
                newItem.count = 1;

                if(!newExercise.dates) {
                        newExercise.dates = {};
                }
                newExercise['dates'][set.date] = newItem;
                newExercise.count = 1;
                workouts[setData.workout] = newExercise;
           }
        }

        let workoutArray = Object.entries(workouts);

        function compareWorkouts (a, b) {
                return a[1].total - b[1].total;
        }

        if(workoutArray.length > 5) {
                workoutArray.sort(compareWorkouts);
                workoutArray.splice(6, workoutArray.length )
                
        }
        const newArr = Object.fromEntries(workoutArray);
        workouts = newArr;

        for(const workout in workouts) {
                let workoutChart = {};
                workoutChart.label = workout;
                let workoutData = [];
                for(let day in workouts[workout].dates) {
                        const dateAvg = {};
                        let avg = workouts[workout]['dates'][day].total / workouts[workout]['dates'][day].count;
                        dateAvg.x = moment(day);
                        dateAvg.y = avg;
                        workoutData.push(dateAvg);
                }
                workoutChart.data = workoutData;
                workoutChart.showLine = true;
                workoutChart.fill = false;
                workoutChart.pointStyle = 'circle';
                workoutChart.pointRadius = 8;
                const color = `${getColor()}`;
                workoutChart.backgroundColor = color;
                workoutChart.borderColor = color;
                workoutChart.hoverBackgroundColor = "rgba(255,99,132,0.4)",
                workoutChart.hoverBorderColor = "rgba(255,99,132,1)",
                dataSets.push(workoutChart);
        }
        return dataSets;       
}

function getColor(){ 
        return `hsla(${~~(360 * Math.random())}, 70%,  72%, 0.8)`
}

async function maxReps(data) {
        let dataSets = [];

        let workouts = {};

        for(let index in data.sets) {
           let set = data.sets[index];
           const setData = set._doc;
           if(setData.bodyPart === 'cardio') {
                continue;
           }
           if(workouts.hasOwnProperty(setData.workout)) {

                if(workouts[setData.workout].weight < setData.weight) {
                        workouts[setData.workout].weight = setData.weight;
                        workouts[setData.workout].reps = setData.reps;
                }

           }else {
                workouts[setData.workout] = {weight : setData.weight, reps : setData.reps, total : 0};
           }
           workouts[setData.workout].total += 1;
        }

        let workoutArray = Object.entries(workouts);

        function compareWorkouts (a, b) {
                return a[1].total - b[1].total;
        }

        if(workoutArray.length > 5) {
                workoutArray.sort(compareWorkouts);
                workoutArray.splice(6, workoutArray.length )
                
        }
        const newArr = Object.fromEntries(workoutArray);
        workouts = newArr;

        for(const workout in workouts) {
                let workoutChart = {};
                workoutChart.label = workout;
                let workoutData = [];
                const maxRep = {};
                maxRep.x = workout;
                maxRep.y = workouts[workout].weight * (1 + (0.025 * workouts[workout].reps));
                workoutData.push(maxRep);
                workoutChart.data = workoutData;
                const color = `${getColor()}`;
                workoutChart.backgroundColor = color;
                workoutChart.borderColor = color;
                workoutChart.hoverBackgroundColor = "rgba(255,99,132,0.4)",
                workoutChart.hoverBorderColor = "rgba(255,99,132,1)",
                dataSets.push(workoutChart);
        }
        return dataSets;  
}

async function workoutFrequency(data) {
        let bodyparts = {};

        for(let index in data.sets) {
           let set = data.sets[index];
           const setData = set._doc;
           if(bodyparts.hasOwnProperty(setData.bodyPart)){
                bodyparts[setData.bodyPart].total += 1;
           }else {
                bodyparts[setData.bodyPart] = {total : 1};
           }
        }

        let pieLabels = [];
        let pieData = [];
        for(let body in bodyparts){
                pieLabels.push(body);
                pieData.push(bodyparts[body].total);
        }
        return {labels: pieLabels, dataSets : pieData};  
}

async function progressFrequency(config, id) {
        const today = new Date();

        const thirtyAgo = new Date(new Date().setDate(today.getDate() - 60));
        let data = await getPeriod(id, thirtyAgo.toDateString(), today.toDateString());

        console.log(data);

        const dataSets = await workoutFrequency(data);

        const background = Array.from({length : dataSets.dataSets.length}, () => getColor());

        const chartConfig = {
                type:  config.type,
                data : {
                        datasets: [{
                                data: dataSets.dataSets,
                                backgroundColor: background
                              }],
                        labels : dataSets.labels,       
                },
                options: {
                        plugins: {
                                legend: {
                                display : true,
                                  labels: {
                                    usePointStyle: true,
                                  },
                                },
                                title: {
                                        display: true,
                                        text: 'Frequency of body parts exercises over last two months'
                                }
                    },
                }
              }



        const chartConfigs = JSON.stringify(chartConfig);

        return chartConfigs;
}

async function progressWeights(config, id) {

        const today = new Date();

        const thirtyAgo = new Date(new Date().setDate(today.getDate() - 60));

        const data = await getPeriod(id, thirtyAgo.toDateString(), today.toDateString());

        let dataSets = await getAvgWeight(data);

        const chartConfig = {
                type:  config.type,
                data: {
                  datasets: dataSets
                },
                options: {
                        animation: {
                                y: {from: 500}
                        },
                        responsive: true,
                        scales: {
                            x: {
                                type: 'time',
                                min: moment(thirtyAgo),
                                scaleLabel: {
                                        labelString: 'Time'
                                }
                            },
                            y : {
                                display: true,
                                title: {
                                        display: true,
                                        text: 'Avg. Weight (lbs)'
                                }
                            }
                        },
                        plugins: {
                                legend: {
                                display : true,
                                  labels: {
                                    usePointStyle: true,
                                  },
                                },
                                title: {
                                        display: true,
                                        text: 'Your progress over the last two months'
                                }
                    },
                }
              }

        const conf = JSON.stringify(chartConfig);
        return conf;
}

async function progressReps(config, id) {
        const today = new Date();

        const thirtyAgo = new Date(new Date().setDate(today.getDate() - 60));
        let data = await getPeriod(id, thirtyAgo.toDateString(), today.toDateString());
        let dataSets = await getAvgReps(data);
        const chartConfig = {
                type:  config.type,
                data: {
                  datasets: dataSets
                },
                options: {
                        animation: {
                                y: {from: 500}
                        },
                        responsive: true,
                        scales: {
                            x: {
                                type: 'time',
                                min: moment(thirtyAgo),
                                scaleLabel: {
                                        labelString: 'Time'
                                }
                            },
                            y : {
                                display: true,
                                title: {
                                        display: true,
                                        text: 'Avg. Rep'
                                }
                            }
                        },
                        plugins: {
                                legend: {
                                display : true,
                                  labels: {
                                    usePointStyle: true,
                                  },
                                },
                                title: {
                                        display: true,
                                        text: 'Your progress over the last two months'
                                }
                    },
                }
              }

        const chartConfigs = JSON.stringify(chartConfig);

        return chartConfigs;
}

async function maxRepProgress(config, id) {
        const today = new Date();

        const thirtyAgo = new Date(new Date().setDate(today.getDate() - 60));

        let  data = await getPeriod(id, thirtyAgo.toDateString(), today.toDateString());
        let dataSets = await maxReps(data);
        const chartConfig = {
                type:  config.type,
                data: {
                  datasets: dataSets
                },
                options: {
                        animation: {
                                y: {from: 500}
                        },
                        responsive: true,
                        scales: {
                                y : {
                                        display: true,
                                        title: {
                                                display: true,
                                                text: 'Max One Rep Estimate'
                                        }
                                    }
                        },
                        plugins: {
                                legend: {
                                display : true,
                                  labels: {
                                    usePointStyle: true,
                                  },
                                },
                                title: {
                                        display: true,
                                        text: 'Your one max rep estimate over the last two months for top exericises over two months'
                                }
                    },
                }
              }

        const chartConfigs = JSON.stringify(chartConfig);

        return chartConfigs;
}

onmessage = async function(event) {
        const {config, id, purpose} = event.data;
        let conf;
        if(purpose === 'progressWeights') {
                conf = await progressWeights(config, id);    
        }else if(purpose === 'progressReps') {
                conf = await progressReps(config, id);
        }else if(purpose === 'maxReps') {
                conf = await maxRepProgress(config, id);
        }else if(purpose === 'frequency') {
                conf = await progressFrequency(config, id);
        }

        this.setTimeout(() => {
                postMessage({ type: 'chartRendered', data : conf });
                this.close();
        },500)
}


