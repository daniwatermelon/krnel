import React from 'react';
import './OwnExercises.css';

const OwnExercises = (props) => {
  // Renderizado condicional dependiendo del tipo de ejercicio
  const renderExerciseContent = () => {
    switch (props.type) {
      case 'vocabulary':
        return (
          <>
            <p>Pregunta: {props.question}</p>
            <p>Respuesta Correcta: {props.correctAnswer}</p>
          </>
        );
      case 'reading':
        return (
          <>
            <p className='readingtext'>Texto de Lectura: {props.text}</p>
            <p>Pregunta: {props.question}</p>
            <p>Respuesta Correcta: {props.correctAnswer}</p>
          </>
        );
      case 'openQ':
        return (
          <>
            <p>Pregunta: {props.question}</p>
            <ul>
              {props.answers.map((answer, index) => (
                <li key={index} style={{ color: index === props.correctAnswerIndex ? 'green' : 'black' }}>
                  {answer}
                </li>
              ))}
            </ul>
          </>
        );
      case 'completeS':
        return (
          <>
            <p>Texto 1: {props.text1}</p>          
            <p>Respuesta Correcta: {props.correctAnswer}</p>
            <p>Texto 2:{props.text2}</p>
          </>
        );
      default:
        return <p>Tipo de ejercicio no soportado.</p>;
    }
  };

  return (
    <div className="own-exercise">
      <p>ID: {props.IDEjercicio}</p>
      <p>Autor: {props.author}</p>
      {renderExerciseContent()}
      {props.image !== "../icons/default_image.png" && (
      <img src={props.image} />
    )}
      <div className='interaction-div'>
        <img className='staricon' src='.././icons/star_icon.png' alt="Star icon" />
        <p>{props.stars}</p>
        <img className='staricon' src='.././icons/like_icon.png' alt="Like icon" />
        <p>{props.likes}</p>
      </div>
    </div>
  );
};

export default OwnExercises;
