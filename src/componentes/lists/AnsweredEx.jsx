import React from 'react';
import './AnsweredEx.css';


const AnsweredEx = (props) => {


    const renderAnsweredEx = () => {
        switch (props.type) {
          case 'vocabulary':
            return (
              <><div className='p-hordiv'>
                <p>Pregunta: {props.question}</p>
                <p>Respuesta del usuario: {props.userAnswer}</p>
                <p>Respuesta correcta: {props.correctAnswer}</p>
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
                <p>Pregunta: {props.question}</p>
                <p>Respuesta del usuario: {props.userAnswer}</p>
                <p>Respuesta Correcta: {props.correctAnswer}</p>
              </div>
               
              </>
            );
          case 'openQ':
            return (
              <>
              <div className='p-hordiv'>
              <p>Pregunta: {props.question}</p>
              <p>
                Respuesta correcta: {
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
              <p>Texto 1: {props.text1}</p>          
                <p>Respuesta del usuario: {props.userAnswer}</p>
                <p>Respuesta correcta: {props.correctAnswer}</p>
                <p>Texto 2:{props.text2}</p>
              </div>
                
              </>
            );
          default:
            return <p>Tipo de ejercicio no soportado.</p>;
        }
      };

      return (
        <div className='answered-exercises-div'>
            {props.image !== "../icons/default_image.png" && (
            <img className='answerdiv-image' src={props.image} alt="Ejercicio" />
            )}
            <div>
                <p>Autor: {props.author}</p>
                {renderAnsweredEx()}
            </div>
        </div>
    )
}

export default AnsweredEx