import React, { useState } from 'react';
import './CommunityEx.css';
import { useNavigate } from 'react-router-dom';

const CommunityEx = (props) => {
  const [selectedRating, setSelectedRating] = useState(""); // Estado para la calificación
  const { onButtonClick } = props; // Asegurarte de que onButtonClick esté en las props
  const navigate = useNavigate();
  const handleChange = (e) => {
    setSelectedRating(e.target.value); // Actualizar calificación seleccionada
  };

  const handleNavigate = () => {
    navigate('/answer-community', {
      state: {
        IDEjercicio: props.IDEjercicio,
        type: props.type,
        author: props.author,
        image: props.image,
        question: props.question,
        text: props.text,
        answers: props.answers,
        correctAnswerIndex: props.correctAnswerIndex,
        text1: props.text1,text2: props.text2
      }
    });
  };

  // Función para obtener el ícono según la calificación seleccionada
  const getStarIcon = () => {
    if (selectedRating === "") {
      return ".././icons/star_icon.png"; // Ícono de estrella vacía (sin color)
    }
    return ".././icons/star_icon2.png"; // Ícono de estrella amarilla
  };

  const renderExerciseContent = () => {
    switch (props.type) {
      case 'vocabulary':
        return (<>
         <p>Tipo: Lectura</p>
        <p>Pregunta: {props.question}</p>;
        </>)
       
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
            <p>Tipo: Pregunta abierta</p>
            <p>Pregunta: {props.question}</p>
            <ul>
              {props.answers.map((answer, index) => (
                <li
                  key={index}
                  style={{
                    color: index === props.correctAnswerIndex ? 'green' : 'black'
                  }}
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

      <div className='interaction-div-dashboard'>
        <div className="difficulty-select">
          <select className="star-select" value={selectedRating} onChange={handleChange}>
            <option value="" disabled>Calificar</option>
            <option value="1">1 Estrella</option>
            <option value="2">2 Estrellas</option> {/* Seleccionará star_icon2.png */}
            <option value="3">3 Estrellas</option>
            <option value="4">4 Estrellas</option>
            <option value="5">5 Estrellas</option>
          </select>
          <img className="star-icon" src={getStarIcon()} alt="Star icon" /> {/* Ícono dinámico */}
        </div>
        <p>{props.stars}</p>
        <button className='likebutton'>
          <img className='like-icon' src='.././icons/like_icon.png' alt="Like button" />
        </button>
        <p>{props.likes}</p>

        <button className='dislikebutton'>
        <img className='dislike-icon' src='.././icons/dislike_icon.png' alt="Dislike button" />
        </button>
        <p>{props.dislikes}</p>

        <button onClick={handleNavigate} className='enter-exercise-b'>Contestar</button>
      </div>

      <div className='feedbacks-container'>
        <div className='scroll-feedbacks'> 

        </div>
        <input placeholder='Escribe aquí tu retroalimentación' className='feedback-input'type='text'></input>
      </div>
    </div>
  );
};

export default CommunityEx;
