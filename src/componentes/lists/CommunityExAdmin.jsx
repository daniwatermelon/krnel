import React, { useState, useEffect, useContext } from 'react';
import './CommunityEx.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../firebasestuff/authContext';
import { collection, doc, getDocs, addDoc, query, where, updateDoc, increment, getDoc} from 'firebase/firestore';
import { db } from '../../firebaseConfig.js';
import './CommunityExAdmin.css'
const CommunityExAdmin = (props) => {
  const [selectedRating, setSelectedRating] = useState(""); // Estado para la calificación
  const { onButtonClick } = props; // Asegurarte de que onButtonClick esté en las props
  const navigate = useNavigate();


  const renderExerciseContent = () => {
    switch (props.type) {
      case 'vocabulary':
        return (
        <>
         <p>Tipo: Vocabulario</p>
        <p>Pregunta: {props.question}</p>;
        </>
        )
       
      case 'reading':
        return (
          <>            
            <p>Tipo: Lectura</p>
            <p className='readingtext'>Texto de Lectura: {props.text}</p>
            <p>Pregunta: {props.question}</p>
          </>
        );
      case 'openQ':
        return (
          <>
            <p>Tipo: Pregunta cerrada</p>
            <p>Pregunta: {props.question}</p>
            <ul>
              {props.answers.map((answer, index) => (
                <li
                  key={index}
                  
                >
                  {answer}
                </li>
              ))}
            </ul>
          </>
        );
      case 'completeS':
        return (
          <>
            <p>Tipo: Completar Oraciones</p>
            <p>Texto 1: {props.text1}</p>
            <p>Texto 2: {props.text2}</p>
          </>
        );
      default:
        return <p>Tipo de ejercicio no soportado.</p>;
    }
  };

  return (
  <div className="own-exercise">
    <p>Autor: {props.author}</p>

    {renderExerciseContent()}

    {props.image !== "../icons/default_image.png" && (
      <img src={props.image} alt="Exercise" />
    )}

    <div className="interaction-div-dashboard">
    <img className="star-admin" src='.././icons/star_icon2.png'alt="Star icon" />
    <p>{props.stars}</p>
    <img className='like-admin' src='.././icons/like_icon2.png' alt="Like" />
    <p>{props.likes}</p>
    <img className='dislike-admin' src='.././icons/dislike_icon2.png' alt="Dislike" />
     <p>{props.dislikes}</p>
     {props.rated == true && (
      <button className='enter-exercise-b'>Confirmar</button>
    )}

    {props.delete == true &&(
      <button className='enter-exercise-b'>Eliminar</button>

    )}
    </div>
  </div>
);

};

export default CommunityExAdmin;
