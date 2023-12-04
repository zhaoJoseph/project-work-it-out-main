import React from "react"

export default function BodyPartList({ name, setListBodyPart, imgUrl }) {
   return (
      <li
         className="part-container"
         onClick={() => {
            setListBodyPart({ name })
         }}
         role="button"
      >
         <img src={imgUrl} className="part-btn"></img>
         <h3 className="part-name">{name}</h3>
      </li>
   )
}