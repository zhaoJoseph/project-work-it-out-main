import React from "react";
import ExerciseItem from "../ExerciseItem/ExerciseItem";
import "./ExerciseList.css";

const ExerciseList = ({ exercises }) => {
  return (
    <div className="exercise-list-container">
      {exercises.map((exercise) => (
        <ExerciseItem key={exercise.id} exercise={exercise} />
      ))}
    </div>
  );
};

export default ExerciseList;
