import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const apiKey = import.meta.env.VITE_API_KEY;
const apiHost = import.meta.env.VITE_API_HOST;

const ExercisePage = () => {
  const { id } = useParams();
  const [exercise, setExercise] = useState(null);

  const fetchExercise = async () => {
    const options = {
      method: "GET",
      url: `https://exercisedb.p.rapidapi.com/exercises/exercise/${id}`,
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": apiHost,
      },
    };

    try {
      const response = await axios.request(options);
      setExercise(response.data);
      console.log("we have found exercise with id: " + response.data.id);
      console.log("we have found exercise with name: " + response.data.name)
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchExercise();
  }, [id]);

  return (
    <div>
      {exercise ? (
        <>
          <h1>{exercise.name}</h1>
          <p>Body Part: {exercise.bodyPart}</p>
          <p>Equipment: {exercise.equipment}</p>
          <p>Target: {exercise.target}</p>
          <p>Secondary Muscles: {exercise.secondaryMuscles.join(", ")}</p>
          <h2>Instructions:</h2>
          <ul>
            {exercise.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ul>
          <img src={exercise.gifUrl} alt={exercise.name} />
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
  
};

export default ExercisePage;
