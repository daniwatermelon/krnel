import React from 'react';
import './OwnExercises.css';

const OwnExercises = (props) => {
  // Renderizado condicional dependiendo del tipo de ejercicio
  const renderExerciseContent = () => {
    switch (props.type) {
      case 'vocabulary':
        return (
          <>
            <p>Question: {props.question}</p>
            <p>Correct answer: {props.correctAnswer}</p>
          </>
        );
      case 'reading':
        return (
          <>
            <p className='readingtext'>Reading text: {props.text}</p>
            <p>Question: {props.question}</p>
            <p>Correct answer: {props.correctAnswer}</p>
          </>
        );
      case 'openQ':
        return (
          <>
            <p>Question: {props.question}</p>
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
            <p>Text 1: {props.text1}</p>          
            <p>Correct answer: {props.correctAnswer}</p>
            <p>Text 2:{props.text2}</p>
          </>
        );
      default:
        return <p>Exercise type not supported.</p>;
    }
  };

  return (
    <div className="own-exercise">
      <p>ID: {String(props.IDEjercicio)}</p>
      <p>Author: {props.author}</p>
      {renderExerciseContent()}
      {props.image !== "../icons/default_image.png" && (
      <img src={props.image} />
    )}
      <div className='interaction-div'>
        <img className='staricon' src='.././icons/star_icon2.png' alt="Star icon" />
        <p>{props.stars}</p>
        <img className='staricon' src='.././icons/like_icon2.png' alt="Like icon" />
        <p>{props.likes}</p>
        <img className='staricon' src='.././icons/dislike_icon2.png' alt="Like icon" />
        <p>{props.dislikes}</p>
      </div>
    </div>
  );
};

export default OwnExercises;
