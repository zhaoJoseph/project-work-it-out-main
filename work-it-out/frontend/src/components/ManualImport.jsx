import { useEffect, useState } from "react"
import Select from 'react-select';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ExerciseModal from "./ExerciseModal";
import CustomExercise from "./CustomExercise";
import './ManualImport.css';
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from 'react-bootstrap-button-loader';

export default function ManualImport() {

    const [startDate, setStartDate] = useState(new Date());
    const [addExercise, setAddExercise] = useState(false);
    const [addCustom, setAddCustom] = useState(false);
    const [exercises, setExercises] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const user = useSelector(state => state.user);
    const navigate = useNavigate();

    useEffect(() => {
        if(error){
            setTimeout(() => {
                setError('');
            },2000);
        }
    },[error])

    const StationarySet = ({setNum, type, deleteItem, setItem, defaults}) => {
        const totalTimes = defaults.totalTime.split(':');

        return (
                <div className="set-container">
                <div className="first-set">
                <h2 style={{color : "white"}}>{setNum}</h2>
                <input className="input" type="number" name="reps" min="0" onChange={(e) => setItem(setNum, e)} defaultValue={defaults.reps}/>
                </div>
                <div className="time-container">
                <input type="number" name="totalTimeH" min="0"  onChange={(e) => setItem(setNum, e)} defaultValue={totalTimes[0]}/>
                <input type="number" name="totalTimeM" min="0" max='60' onChange={(e) => setItem(setNum, e)} defaultValue={totalTimes[1]}/>
                <input type="number" name="totalTimeS" min="0" max='60' onChange={(e) => setItem(setNum, e)} defaultValue={totalTimes[2]}/>
                </div>
                <div className="last-set">
                <input className="input" type="number" name="restTime" min="0" onChange={(e) => setItem(setNum, e)} defaultValue={defaults.restTime}/>
                <input className="input" type="number" name="hr" min="0"  onChange={(e) => setItem(setNum, e)} defaultValue={defaults.hr}/>
                <input className="input" type="number" name="calories" min="0"  onChange={(e) => setItem(setNum, e)} defaultValue={defaults.calories}/>
                </div>
                <button className="delete" onClick={() => deleteItem(setNum)}>DELETE</button>
                </div>
        )
    }

    const Set = ({setNum, type, deleteItem, setItem, defaults}) => {


        const totalTimes = defaults.totalTime.split(':');

        return (
                (type === 'cardio') ? 
                <div className="set-container">
                <div className="first-set-cardio">
                <h2 style={{color : "white"}}>{setNum}</h2>
                <input className="input" type="number" name="distance" step="0.1" min="0.0" onChange={(e) => setItem(setNum, e)} defaultValue={defaults.distance.replace( /[^\d.]/g, '' )}/>
                </div>
                <div className="time-container-cardio">
                <input type="number" name="totalTimeH" min="0"  onChange={(e) => setItem(setNum, e)} defaultValue={totalTimes[0]}/>
                <input type="number" name="totalTimeM" min="0" max='60'  onChange={(e) => setItem(setNum, e)} defaultValue={totalTimes[1]}/>
                <input type="number" name="totalTimeS" min="0" max='60' onChange={(e) => setItem(setNum, e)} defaultValue={totalTimes[2]}/>
                </div>
                <div className="last-set-cardio">
                <input className="input" type="number" name="elevation" min="0"  onChange={(e) => setItem(setNum, e)} defaultValue={defaults.elevation.replace( /[^\d.]/g, '' )}/>
                <input className="input" type="number" name="hr" min="0"  onChange={(e) => setItem(setNum, e)} defaultValue={defaults.hr}/>
                <input className="input" type="number" name="calories" min="0"  onChange={(e) => setItem(setNum, e)} defaultValue={defaults.calories}/>
                </div>
                <button className="delete" onClick={() => deleteItem(setNum)}>DELETE</button>
                </div>
                : 
                <div className="set-container">
                <div className="first-set">
                <h2>{setNum}</h2>
                <input className="input" type="number" name="weight" step="0.1" min="0.0" onChange={(e) => setItem(setNum, e)} defaultValue={defaults.weight}/>
                <input className="input" type="number" name="reps" min="0" onChange={(e) => setItem(setNum, e)} defaultValue={defaults.reps}/>
                </div>
                <div className="time-container">
                <input type="number" name="totalTimeH" min="0"  onChange={(e) => setItem(setNum, e)} defaultValue={totalTimes[0]}/>
                <input type="number" name="totalTimeM" min="0" max='60' onChange={(e) => setItem(setNum, e)} defaultValue={totalTimes[1]}/>
                <input type="number" name="totalTimeS" min="0" max='60' onChange={(e) => setItem(setNum, e)} defaultValue={totalTimes[2]}/>
                </div>
                <div className="last-set">
                <input className="input" type="number" name="restTime" min="0" onChange={(e) => setItem(setNum, e)} defaultValue={defaults.restTime}/>
                <input className="input" type="number" name="hr" min="0"  onChange={(e) => setItem(setNum, e)} defaultValue={defaults.hr}/>
                <input className="input" type="number" name="calories" min="0"  onChange={(e) => setItem(setNum, e)} defaultValue={defaults.calories}/>
                </div>
                <button className="delete" onClick={() => deleteItem(setNum)}>DELETE</button>
                </div>
        )
    }

    const WeightExercise = ({ exercise, removeExercise }) => {
        const [sets, setSets] = useState([]);

        useEffect(() => {
            const exerciseSets = sessionStorage.getItem(`${exercise.name}`);
            if(exerciseSets && (sets.length < 1)) {
                setSets(JSON.parse(exerciseSets));
            }
        })

        function setItem(key, data){
            let exerciseVal = sets[key];
            if(data.target.name === 'totalTimeH') {
                const time = exerciseVal['totalTime'].split(':');
                exerciseVal['totalTime'] = `${data.target.value}:${time[1]}:${time[2]}`;
            }else if(data.target.name === 'totalTimeM') {
                const time = exerciseVal['totalTime'].split(':');
                exerciseVal['totalTime'] = ((data.target.value !== '') &&  (parseInt(data.target.value) <= 60)) ?  `${time[0]}:${data.target.value}:${time[2]}` : `${time[0]}:0:${time[2]}`;                 
            }else if(data.target.name === 'totalTimeS') {
                const time = exerciseVal['totalTime'].split(':');
                exerciseVal['totalTime'] = ((data.target.value !== '') &&  (parseInt(data.target.value) <= 60)) ? `${time[0]}:${time[1]}:${data.target.value}` : `${time[0]}:${time[1]}:0`;                      
            }else {
                exerciseVal[data.target.name] = data.target.value;
            }
            let newSet = sets;
            newSet[key] = exerciseVal;
            sessionStorage.setItem(`${exercise.name}`, JSON.stringify(newSet));
            setSets([...newSet]);
        }

        const deleteItem = (key) => {
            let newSet = sets;
            newSet.splice(key, 1);
            sessionStorage.setItem(`${exercise.name}`, JSON.stringify(newSet));
            setSets([...newSet]);
        }

        function addPrevious() {
            const newSet = [...sets, {weight : sets[sets.length -1]['weight'], 
            reps : sets[sets.length -1]['reps'], totalTime: sets[sets.length -1]['totalTime'], 
            restTime : sets[sets.length -1]['restTime'], hr : sets[sets.length -1]['hr'], calories: sets[sets.length -1]['calories']}];
            sessionStorage.setItem(`${exercise.name}`, JSON.stringify(newSet));
            setSets(newSet);   
        }

        function saveSet() {
            const newSet = [...sets, {weight : 0, reps : 0, totalTime: '0:0:0', restTime : 0, hr : 0, calories: 0}];
            sessionStorage.setItem(`${exercise.name}`, JSON.stringify(newSet));
            setSets([...sets, {weight : 0, reps : 0, totalTime: '0:0:0', restTime : 0, hr : 0, calories: 0}]);
        }

        return (
            <div className="exercise-container">
            <h2 style={{color : 'white'}} className="exercise-name">Exercise {exercise.name}</h2>
            <div className="image-container">
            <img
                className="exercise-image"
                src={exercise.gifUrl}
                alt={exercise.name}
            />
            <button onClick={() => removeExercise(exercise.name)}>Remove</button>
            </div>
            <div className="exercise-titles">
            <h3>Set</h3>
            <h3>Weight (lbs)</h3>
            <h3>Reps</h3>
            <h3>Total Time</h3>
            <h3>Rest Time (Seconds)</h3>
            <h3>Heart rate (Optional)</h3>
            <h3>Calories (Optional)</h3>
            </div>
            {sets && sets.map((obj, index) => {
                return <Set key={index} setNum={index} type={"weight"} deleteItem={deleteItem} setItem={setItem} defaults={obj}/>
            })}
            {(sets.length > 0) && <button onClick={addPrevious}>Copy previous</button>}
            <button onClick={() => saveSet()}>Add Set</button>
            </div>
        )
    }

    const CardioStationaryExercise = ({exercise, removeExercise}) => {

        const [sets, setSets] = useState([]);

        useEffect(() => {
            const exerciseSets = sessionStorage.getItem(`${exercise.name}`);
            if(exerciseSets && (sets.length < 1)) {
                setSets(JSON.parse(exerciseSets));
            }
        })

        function setItem(key, data){
            let exerciseVal = sets[key];
            if(data.target.name === 'totalTimeH') {
                const time = exerciseVal['totalTime'].split(':');
                exerciseVal['totalTime'] = `${data.target.value}:${time[1]}:${time[2]}`;
            }else if(data.target.name === 'totalTimeM') {
                const time = exerciseVal['totalTime'].split(':');
                exerciseVal['totalTime'] = ((data.target.value !== '') &&  (parseInt(data.target.value) <= 60)) ?  `${time[0]}:${data.target.value}:${time[2]}` : `${time[0]}:0:${time[2]}`;                 
            }else if(data.target.name === 'totalTimeS') {
                const time = exerciseVal['totalTime'].split(':');
                exerciseVal['totalTime'] = ((data.target.value !== '') &&  (parseInt(data.target.value) <= 60)) ? `${time[0]}:${time[1]}:${data.target.value}` : `${time[0]}:${time[1]}:0`;                      
            }else {
                exerciseVal[data.target.name] = data.target.value;
            }
            let newSet = sets;
            newSet[key] = exerciseVal;
            sessionStorage.setItem(`${exercise.name}`, JSON.stringify(newSet));
            setSets([...newSet]);
        }

        const deleteItem = (key) => {
            let newSet = sets;
            newSet.splice(key, 1);
            sessionStorage.setItem(`${exercise.name}`, JSON.stringify(newSet));
            setSets([...newSet]);
        }

        function addPrevious() {
            const newSet = [...sets, {reps : sets[sets.length -1]['reps'], 
            totalTime: sets[sets.length -1]['totalTime'], 
            restTime : sets[sets.length -1]['restTime'], 
            hr : sets[sets.length -1]['hr'], 
            calories: sets[sets.length -1]['calories']}];
            sessionStorage.setItem(`${exercise.name}`, JSON.stringify(newSet));
            setSets(newSet);   
        }

        function saveSet() {
            const newSet = [...sets, {reps : 0, totalTime: '0:0:0', restTime : 0, hr : 0, calories: 0}];
            sessionStorage.setItem(`${exercise.name}`, JSON.stringify(newSet));
            setSets([...sets, {reps : 0, totalTime: '0:0:0', restTime : 0, hr : 0, calories: 0}]);
        }

        return (
            <div className="exercise-container">
            <h2 style={{color : 'white'}} className="exercise-name">Exercise {exercise.name}</h2>
            <div className="image-container">
            <img
                className="exercise-image"
                src={exercise.gifUrl}
                alt={exercise.name}
            />
            <button onClick={() => removeExercise(exercise.name)}>Remove</button>
            </div>
            <div className="exercise-titles">
            <h3>Set</h3>
            <h3>Reps</h3>
            <h3>Total Time</h3>
            <h3>Rest Time (Seconds)</h3>
            <h3>Heart rate (Optional)</h3>
            <h3>Calories (Optional)</h3>
            </div>
            {sets && sets.map((obj, index) => {
                return <StationarySet key={index} setNum={index} type={"weight"} deleteItem={deleteItem} setItem={setItem} defaults={obj}/>
            })}
            {(sets.length > 0) && <button onClick={addPrevious}>Copy previous</button>}
            <button onClick={() => saveSet()}>Add Set</button>
            </div>
        )
    }

    const CardioExercise = ({exercise, removeExercise}) => {

        const [sets, setSets] = useState([]);

        const [distanceMetric, setDistanceMetric] = useState('m');
        const [elevationMetric, setElevationMetric] = useState('m');

        useEffect(() => {
            const exerciseSets = sessionStorage.getItem(`${exercise.name}`);
            if(exerciseSets && (sets.length < 1)) {
                setSets(JSON.parse(exerciseSets));
            }
        })

        function setItem(key, data){
            let exerciseVal = sets[key];
            if(data.target.name === 'distance') {
                exerciseVal['distance'] = `${data.target.value}${distanceMetric}`;
            }else if(data.target.name === 'totalTimeH') {
                const time = exerciseVal['totalTime'].split(':');
                exerciseVal['totalTime'] = `${data.target.value}:${time[1]}:${time[2]}`;
            }else if(data.target.name === 'totalTimeM') {
                const time = exerciseVal['totalTime'].split(':');
                exerciseVal['totalTime'] = ((data.target.value !== '') &&  (parseInt(data.target.value) <= 60)) ?  `${time[0]}:${data.target.value}:${time[2]}` : `${time[0]}:0:${time[2]}`;                 
            }else if(data.target.name === 'totalTimeS') {
                const time = exerciseVal['totalTime'].split(':');
                exerciseVal['totalTime'] = ((data.target.value !== '') &&  (parseInt(data.target.value) <= 60)) ? `${time[0]}:${time[1]}:${data.target.value}` : `${time[0]}:${time[1]}:0`;                    
            }else if(data.target.name === 'elevation') {
                exerciseVal['elevation'] = `${data.target.value}${elevationMetric}`;
            }else {
                exerciseVal[data.target.name] = data.target.value;
            }
            let newSet = sets;
            newSet[key] = exerciseVal;
            sessionStorage.setItem(`${exercise.name}`, JSON.stringify(newSet));
            setSets([...newSet]);
        }


        const deleteItem = (key) => {
            let newSet = sets;
            newSet.splice(key, 1);
            sessionStorage.setItem(`${exercise.name}`, JSON.stringify(newSet));
            setSets([...newSet]);
        }

        function addPrevious() {
            const newSet = [...sets, {distance : sets[sets.length -1]['distance'], 
            totalTime: sets[sets.length -1]['totalTime'], 
            elevation : sets[sets.length -1]['elevation'], hr : sets[sets.length -1]['hr'], calories: sets[sets.length -1]['calories']}];
            sessionStorage.setItem(`${exercise.name}`, JSON.stringify(newSet));
            setSets(newSet);   
        }

        function saveSet() {
            const newSet = [...sets, {distance : '', totalTime : '0:0:0', elevation: '', hr : 0, calories: 0}];
            sessionStorage.setItem(`${exercise.name}`, JSON.stringify(newSet));
            setSets([...sets, {distance : '', totalTime : '0:0:0', elevation: '', hr : 0, calories: 0}]);
        }

        const metrics = [
            {value: 'km', label : 'km'},
            {value : 'm', label : 'metres'},
            {value : 'mi', label : 'miles'},
            {value : 'yd', label : 'yards'},
            {value : 'ft', label: 'feet'}
        ]

        const elevations = [
            {value : 'm', label : 'metres'},
            {value : 'ft', label: 'feet'}
        ]

        return (
            <div>
            <h2 style={{color : 'white'}} className="exercise-name">Exercise {exercise.name}</h2>
            <div className="image-container">
            <img
                className="exercise-image"
                src={exercise.gifUrl}
                alt={exercise.name}
            />
            <button onClick={() => removeExercise(exercise.name)}>Remove</button>
            </div>
            <div className="exercise-titles">
            <h3>Set</h3>
            <h3>Distance</h3>
            <Select options={metrics} className="select" defaultValue={{label : 'metres', value : 'm'}} onChange={e => setDistanceMetric(e.value)}/>
            <h3>Total Time</h3>
            <h3>Elevation (Optional)</h3>
            <Select options={elevations} className="select" defaultValue={{label : 'metres', value : 'm'}} onChange={e => setElevationMetric(e.value)}/>
            <h3>Heart rate (Optional)</h3>
            <h3>Calories (Optional)</h3>
            </div>
            {sets && sets.map((obj, index) => {
                return <Set key={index} setNum={index} type={"cardio"} deleteItem={deleteItem} setItem={setItem} defaults={obj}/>
            })}
            {(sets.length > 0) && <button onClick={addPrevious}>Copy previous</button>}
            <button onClick={() => saveSet()}>Add Set</button>
            </div>
        )
    }

    function selectExercise(name, target, equipment, gifUrl, type, id) {

        const stationaryCardio = ['3220', '3672', '3360', '1160', '1201', 
                                '3221', '3636', '0501', '3224', '2612', 
                                '0630', '3638', '3219', '3222', 
                                '3361', '3671', '3223', '3318', '3655', ];

        if(stationaryCardio.includes(id)) {
            setExercises([...exercises, {name : name, target : target, equipment: equipment, gifUrl : gifUrl, type : 'cardioStationary'}])
        }else if(!exercises.some(e => e.name === name)){
            setExercises([...exercises, {name : name, target: target, equipment: equipment, gifUrl : gifUrl, type : type}]);
        }
        setAddExercise(!addExercise);
    }

    function addCustomExercise(name, type, muscle, equipment ) {

        if(!exercises.some(e => e.name === name)) {
            setExercises([...exercises, {name : name, target: muscle, equipment: equipment, gifUrl : '', type : type}]);
        }

        setAddCustom(!addCustom);
    }

    function removeExercise(exercise) {
        const newSet = exercises;
        const ind = exercises.findIndex(e => e.name === exercise);
        newSet.splice(ind, 1);
        sessionStorage.removeItem(exercise);
        setExercises([...newSet]);
    }

    function handleSubmit() {

        if(loading) return;
        setLoading(true);

        if(exercises.length < 1) {
            setLoading(false);
            setError("Add some exercises first");
            return;
        }
        let session = [];
        for(let index in exercises) {
            let exercise = exercises[index];
            let sets = sessionStorage.getItem(exercise.name);
            if( !sets || (sets.length < 1)) {
                setLoading(false);
                setError('Exercise is missing sets');
                return;
            }
            let exerc = {...exercise, sets : []};
            sets = JSON.parse(sets);
            for(let setIndex in sets) {
                let set = sets[setIndex];
                if(exercise.type === 'cardio') {
                    if(!set.distance || (set.totalTime === '0:0:0')) {
                        setLoading(false);
                        setError('Remove or fill in empty sets.');
                        return;
                    }
                }else if(exercise.type === 'cardioStationary') {
                    if(!set.reps || (set.totalTime === '0:0:0') || !set.restTime) {
                        setLoading(false);
                        setError('Remove or fill in empty sets.');
                        return;
                    }
                }else {
                    if(!set.reps || !set.weight || (set.totalTime === '0:0:0') || !set.restTime) {
                        setLoading(false);
                        setError('Remove or fill in empty sets.');
                        return;
                    }
                }
                const setPush = {...set, repetitions : set.reps};
                exerc['sets'].push(setPush);
            }
            session.push(exerc);
            sessionStorage.removeItem(exercise.name);
        }
        let updateSession = {exercises : session, date : startDate};
        axios.post(`http://localhost:3001/session/`, {id :  user._id, session : updateSession }, {withCredentials: true}).then(res => {
            setLoading(false);
            if(res.status === 200) {
                setLoading(false);
                navigate('/');
            }
          }).catch(err => {
            console.log(err.message);
            setLoading(false);
            setError('Error updating session. Please try again in 1 minute.');
          });

    }

    return (
        <div>
            <div>
                <h1>Add your session</h1>
                <DatePicker selected={startDate} onChange={(date) => setStartDate(date)}/>
            </div>
            {
                addExercise && <ExerciseModal selectExercise={selectExercise} closeModal={() => setAddExercise(!addExercise)}/>
            }
            {
                addCustom && <CustomExercise closeModal={() => setAddCustom(!addCustom)} addExercise={addCustomExercise}/>
            }
            {
                exercises.map((obj, index) => {
                    if(obj.type === 'cardio') {
                        return <CardioExercise key={index} exercise={obj} removeExercise={removeExercise} />
                    }else if(obj.type === 'cardioStationary') {
                        return <CardioStationaryExercise key={index} exercise={obj} removeExercise={removeExercise}/>
                    }else{
                        return <WeightExercise key={index} exercise={obj} removeExercise={removeExercise} />
                    }
                })
            }
            <button onClick={() => setAddExercise(!addExercise)}>Add Exercise</button>
            <button onClick={() => setAddCustom(!addCustom)}>Create Exercise</button>
            {error && <p>{error}</p>}
            <Button style={{backgroundColor : 'green'}} onClick={handleSubmit} loading={loading}>Submit</Button>
        </div>
    )
}