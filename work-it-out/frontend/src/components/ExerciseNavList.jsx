import React, { useState } from "react"

export default function ExercisesList({ name, target, type, equipment, gifUrl, selectItem, id }) {
   const [isVisible, setVisible] = useState(false)
   const visibleStyle = {
      display: isVisible ? "" : "none",
   }
   function toggleVisible() {
      setVisible(prevIsVisible => !prevIsVisible)
   }
   return (
      <li className="exercise">
         <p className="exercise-name">{name}</p>
         <div className="chip-container">
            <p className="chip">{target}</p>
            <p className="chip">{equipment}</p>
         </div>
         <button onClick={() => selectItem(name, target, equipment, gifUrl, type, id)}>Select</button>
         <button
            className="exercise-button"
            onClick={() => {
               toggleVisible()
            }}
         >
            &gt;
         </button>
         <img className="exercise-gif" style={visibleStyle} src={gifUrl}></img>
      </li>
   )
}