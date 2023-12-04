import React from "react";
import { Link } from "react-router-dom";
import "./ExerciseItem.css";

const ExerciseItem = ({ exercise }) => {
  const exerciseLink = `/exercise/${exercise.id}`;

  return (
    <div className="exercise-item">
      <Link to={exerciseLink}>
        <h2 className="exercise-name">{exercise.name}</h2>
        <p className="equipment">Equipment: {exercise.equipment}</p>
        <div className="image-container">
          <img
            className="exercise-image"
            src={exercise.gifUrl}
            alt={exercise.name}
          />
        </div>
      </Link>
    </div>
  );
};

export default ExerciseItem;
