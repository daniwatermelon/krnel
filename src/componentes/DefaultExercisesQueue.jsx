// Dashboard.jsx
import React, { useRef,useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './DefaultExercisesQueue.css'
import { AuthContext } from '../firebasestuff/authContext';


const DefaultExercisesQueue = () => {
    const { state } = useLocation();
    const { usernamePass } = useContext(AuthContext); //Se usa el contexto de Auth para pasar el nombre de usuario
    const navigate = useNavigate(); //Se incluye todo de navegación
    const [title,setTitle] = useState('TITULO') 
    const [instructions,setInstructions] = useState('Estas son las instrucciones');
    const goBack = () => {
        navigate(-1);
    }

    return (
       <div className='fondo'>
           

            <div className="queue-container">
                <div className='hori-div'>
                    <button onClick={goBack} className='button-returnqueue'/>
                    <h2 className='titlequeue'>{title}</h2>
                </div>
                
                <h3 className='instructionqueue'>{instructions}</h3>
                <div className='exercises-content'>

                </div>
                <div className='button-queue-container'>
                <button>Saltar</button>

                <button>Enviar Respuesta</button>

                </div>
             
            </div>
             
       </div>
            
    );
};

export default DefaultExercisesQueue;
