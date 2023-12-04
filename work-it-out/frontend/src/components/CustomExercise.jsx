import Select from 'react-select';
import './ExerciseModal.css';
import { useEffect, useState } from 'react';

export default function CustomExercise(props) {

    const [type, setType] = useState();
    const [muscle, setMuscle] = useState();
    const [equip, setEquipment] = useState();
    const [name, setName] = useState('');
    const [error, setError] = useState();

    const equipment = [
        {value : 'None', label : 'None'},
        {value : 'Barbell', label : 'Barbell'},
        {value : 'Dumbbell', label : 'Dumbbell'},
        {value : 'Kettlebell', label : 'Kettlebell'},
        {value : 'Machine', label : 'Machine'},
        {value : 'Plate', label : 'Plate'},
        {value : 'Resistance Band', label : 'Resistance Band'},
        {value : 'Suspension Band', label : 'Suspension Band'},
        {value : 'Other', label : 'Other'}

    ]

    const muscles = [
        {value : 'Abdominals', label : 'Abdominals'},
        {value : 'Abductors', label : 'Abductors'},
        {value : 'Adductors', label : 'Adductors'},
        {value : 'Biceps', label : 'Biceps'},
        {value : 'Calves', label : 'Calves'},        
        {value : 'Cardio', label : 'Cardio'},
        {value : 'Chest', label : 'Chest'},
        {value : 'Forearms', label : 'Forearms'},
        {value : 'Full Body', label : 'Full Body'},
        {value : 'Glutes', label : 'Glutes'},
        {value : 'Hamstrings', label : 'Hamstrings'},
        {value : 'Lats', label : 'Lats'},
        {value : 'Lower Back', label : 'Lower Back'},
        {value : 'Neck', label : 'Neck'},
        {value : 'Quadriceps', label : 'Quadriceps'},
        {value : 'Shoulders', label : 'Shoulders'},
        {value : 'Traps', label : 'Traps'},
        {value : 'Triceps', label : 'Triceps'},
        {value : 'Upper Back', label : 'Upper Back'},
        {value : 'Other', label : 'Other'},
    ]

    const exerciseType = [
        {value : 'weight', label : 'Weight Lifting'},
        {value : 'cardio', label : 'Cardio'},
        {value : 'cardioStationary', label: 'Stationary Cardio'}
    ]

    function saveExercise(name, type, muscle, equip) {

        if(!name) {
            setError('Name required');
            return;
        }

        if(!type) {
            setError('Type required');
            return;
        }

        if(!muscle) {
            setError('Muscles required');
            return;
        }

        if(!equip) {
            setError('Equipment required');
            return;
        }
        props.addExercise(name, type, muscle, equip)
    }

    useEffect(() => {
        setTimeout(() => {
            setError('');
        },5000)
    },[error])

    return (
        <div onClick={props.closeModal} className="outer-modal">
            <div className='modal' onClick={e => e.stopPropagation()}>
            <h1>Exercise Name</h1>
            <input type="text" value={name} onInput={e => setName(e.target.value)}></input>
            <h1>Equipment</h1>
            <Select 
            className='select'
            options={equipment}
            onChange={(equipment) => setEquipment(equipment.value)}
            />
            <h1>Primary Muscle Group</h1>
            <Select 
            className='select'
            options={muscles}
            onChange={(muscle) => setMuscle(muscle.value)}
            />
            <h1>Exercise Type</h1>
            <Select 
            className='select'
            options={exerciseType} 
            onChange={(type) => setType(type.value)}/>
            <button onClick={() => saveExercise(name, type, muscle, equip)}>Save</button>
            {error && <p className='error'>{error}</p>}
            </div>
        </div>
    )
}