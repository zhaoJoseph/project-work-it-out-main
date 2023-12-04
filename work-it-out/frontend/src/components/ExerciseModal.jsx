import { useEffect, useState } from "react"
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import BodyPartList from "./BodyPartList";
import ExercisesNav from "./ExercisesNav";
import ExercisesList from "./ExerciseNavList";
import './ExerciseModal.css';
const apiKey = import.meta.env.VITE_API_KEY;
const apiHost = import.meta.env.VITE_API_HOST;

export default function ExerciseModal(props) {

 const bodyParts = [
    { name: "back", id: uuidv4(), imgUrl: "https://i.imgur.com/vQFklTd.png" },
    {
       name: "cardio",
       id: uuidv4(),
       imgUrl: "https://i.imgur.com/BYPyKQb.png",
    },
    {
       name: "chest",
       id: uuidv4(),
       imgUrl: "https://i.imgur.com/b468huJ.png",
    },
    {
       name: "lower arms",
       id: uuidv4(),
       imgUrl: "https://i.imgur.com/5MJ32JH.png",
    },
    {
       name: "lower legs",
       id: uuidv4(),
       imgUrl: "https://i.imgur.com/h4qPQ0i.png",
    },
    { name: "neck", id: uuidv4(), imgUrl: "https://i.imgur.com/1AqcY58.png" },
    {
       name: "shoulders",
       id: uuidv4(),
       imgUrl: "https://i.imgur.com/AjtPy3m.png",
    },
    {
       name: "upper arms",
       id: uuidv4(),
       imgUrl: "https://i.imgur.com/EdG3IQB.png",
    },
    {
       name: "upper legs",
       id: uuidv4(),
       imgUrl: "https://i.imgur.com/FLYeWBA.png",
    },
    {
       name: "waist",
       id: uuidv4(),
       imgUrl: "https://i.imgur.com/XsbCiCG.png",
    },
 ]
 const SESSION_STORAGE_KEY = "exerciseApp.exercises"
 const exerciseFetch = loadExerciseData()
 const url = "https://exercisedb.p.rapidapi.com/exercises?limit=1500"
 const options = {
    method: "GET",
    headers: {
       "X-RapidAPI-Key": apiKey,
       "X-RapidAPI-Host": apiHost,
    },
 }
 //If no local storage data, fetch from api.
 //Save API data to localStorage.
 //Set API data to the state.
 async function fetchApi() {
    const data = await axios.get(url, options);
    if (data.status === 200) {
       const jsonData = data.data;
       console.log(jsonData)

       saveExerciseData(jsonData)
       setFetchedExerciseData(jsonData)
    } else {
       console.log("Error")
    }
 }
 function saveExerciseData(exercises) {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(exercises))
 }
 function loadExerciseData() {
    const dataJSON = sessionStorage.getItem(SESSION_STORAGE_KEY)
    return JSON.parse(dataJSON)
 }
 const [fetchedExerciseData, setFetchedExerciseData] = useState(exerciseFetch)
 const [filteredData, setFilteredData] = useState()
 const [listBodyPart, setListBodyPart] = useState()

 useEffect(() => {
    if (listBodyPart) {
       bodyPartFilter()
    }
 }, [listBodyPart])

 useEffect(() => {
    if (!fetchedExerciseData) {
       console.log("No data")
       fetchApi()
    }
 }, [])
 function bodyPartFilter() {
    const filteredDataArray = fetchedExerciseData.filter(
       i => i.bodyPart === listBodyPart.name
    )
    setFilteredData(filteredDataArray)
 }
 
 return (
    <div onClick={props.closeModal} className="outer-modal">
        <main className="modal" onClick={e => e.stopPropagation()}>
       {fetchedExerciseData && !listBodyPart && (
          <>
             <div className="header">
                <h1>exercise list</h1>
                <h2>select a body part to view a list of exercises</h2>
             </div>
             <ul role="list" className="bodyPartList-container">
                {bodyParts.map(bodyPart => (
                   <BodyPartList
                      key={bodyPart.id}
                      name={bodyPart.name}
                      imgUrl={bodyPart.imgUrl}
                      setListBodyPart={setListBodyPart}
                   ></BodyPartList>
                ))}
             </ul>
          </>
       )}
       {fetchedExerciseData && listBodyPart && filteredData && (
          <>
             <ExercisesNav
                listBodyPart={listBodyPart}
                setListBodyPart={setListBodyPart}
                filteredData={filteredData}
                setFilteredData={setFilteredData}
                bodyPartFilter={bodyPartFilter}
             />
             <ul role="list" className="exercisesList-container">
                {filteredData &&
                   filteredData.map(exercise => (
                      <ExercisesList
                         key={exercise.id}
                         name={exercise.name}
                         type={exercise.bodyPart}
                         target={exercise.target}
                         equipment={exercise.equipment}
                         gifUrl={exercise.gifUrl}
                         id={exercise.id}
                         selectItem={props.selectExercise}
                      ></ExercisesList>
                   ))}
             </ul>
          </>
       )}
    </main>
    </div>
 )
}