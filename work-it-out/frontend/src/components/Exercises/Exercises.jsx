import React, { useEffect, useState } from "react";
import axios from "axios";
import ExerciseList from "../ExerciseList/ExerciseList";
import Pagination from "../Pagination/Pagination";
import "./Exercises.css";

const apiKey = import.meta.env.VITE_API_KEY;
const apiHost = import.meta.env.VITE_API_HOST;

const PAGE_SIZE = 4;

const Exercises = () => {
  const [selectedBodyPart, setSelectedBodyPart] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [bodyParts, setBodyParts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchBodyParts = async () => {
    const options = {
      method: "GET",
      url: "https://exercisedb.p.rapidapi.com/exercises/bodyPartList",
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": apiHost,
      },
    };

    try {
      const response = await axios.request(options);
      setBodyParts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchExercises = async (bodyPart = "back") => {
    const options = {
      method: "GET",
      url: `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}`,
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": apiHost,
      },
    };

    try {
      const response = await axios.request(options);
      setExercises(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleBodyPartChange = (event) => {
    const selectedPart = event.target.value;
    setSelectedBodyPart(selectedPart);
    fetchExercises(selectedPart);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    fetchBodyParts();
  }, []);

  const slicedExercises = exercises.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="exercises-container">
      <h1>Exercises</h1>
      <div className="search-container">
        <label id="select-text" htmlFor="bodyPartSelect">
          Select Body Part:
        </label>
        <select
          id="bodyPartSelect"
          value={selectedBodyPart || ""}
          onChange={handleBodyPartChange}
        >
          <option value="" disabled>
            Choose a Body Part
          </option>
          {bodyParts.map((part) => (
            <option key={part} value={part}>
              {part}
            </option>
          ))}
        </select>
      </div>
      {selectedBodyPart && (
        <>
          <ExerciseList exercises={slicedExercises} />
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(exercises.length / PAGE_SIZE)}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default Exercises;
