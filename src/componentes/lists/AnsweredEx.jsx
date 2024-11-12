import React from 'react';
import './AnsweredEx.css';


const AnsweredEx = (props) => {


    const renderAnsweredEx = () => {
        switch (props.type) {
          case 'vocabulary':
            return (
              <><div className='p-hordiv'>
                <p>Question: {props.question}</p>
                <p>Your answer: {props.userAnswer}</p>
                <p>Correct answer: {props.correctAnswer}</p>
              </div>
              </>
            );
          case 'reading':
            return (
              <>
              <div className='p-hordiv'>
              {/* <p className='readingtext'>
                Texto de Lectura: {props.text}
                </p> */}
                <p>Question: {props.question}</p>
                <p>Your answer: {props.userAnswer}</p>
                <p>Correct answer: {props.correctAnswer}</p>
              </div>
               
              </>
            );
          case 'openQ':
            return (
              <>
              <div className='p-hordiv'>
              <p>Question: {props.question}</p>
              <p>
                Correct answer: {
                    Array.isArray(props.answers) && !isNaN(Number(props.userAnswer)) 
                    ? props.answers[parseInt(props.userAnswer, 10)] 
                    : 'No hay respuesta correcta disponible'
                }
</p>
              </div>
              </>
            );
          case 'completeS':
            return (
              <>
              <div className='p-hordiv'>
              <p>Text 1: {props.text1}</p>          
                <p>Your answer: {props.userAnswer}</p>
                <p>Correct answer: {props.correctAnswer}</p>
                <p>Text 2: {props.text2}</p>
              </div>
                
              </>
            );
          default:
            return <p>Exercise type not supported.</p>;
        }
      };

      return (
        <div className='answered-exercises-div'>
            {props.image !== "../icons/default_image.png" && (
            <img className='answerdiv-image' src={props.image} alt="Ejercicio" />
            )}
            <div>
                <p>Author: {props.author}</p>
                {renderAnsweredEx()}
            </div>
        </div>
    )
}

export default AnsweredEx