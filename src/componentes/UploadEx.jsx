import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './UploadEx.css'
const UploadEx = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { newExercise } = location.state || {};

    if (!newExercise) {
        navigate(-1);
        return null;
    }

    const goBack = () => {
        navigate(-1);
    };

    const cancelCreate = () => 
    {
        navigate(-3);
    };


    const showExercise = () => {
        switch(newExercise.type)
        {
            case 'openQ':
            return(
                <div className='details-container'>
                <h3>Ejercicio de preguntas abiertas</h3>
                <p>Autor: {newExercise.author}</p>
                <p>Respuesta correcta: {newExercise.correctanswer} </p>
                <p>Respuesta 2: {newExercise.answer2}</p>
                <p>Respuesta 3: {newExercise.answer3}</p>
                <p>Respuesta 4: {newExercise.answer4}</p>
                </div>


            );
    
            
    
            case 'completeS':
                return(
                    <div className='details-container'>
                    <h3>Ejercicio de completar oraciones</h3>
                    <p>Autor: {newExercise.author}</p>
                    <p>Texto 1: {newExercise.text1}</p>
                    <p>Respuesta correcta: {newExercise.correctanswer}</p>
                    <p>Texto 2: {newExercise.text2}</p>
                    </div>
    
    
                );
    
            case 'reading':

            return(
                <div className='details-container'>
                <h2>Ejercicio de comprensión lectora</h2>
                <p>Autor: {newExercise.author}</p>
                <p>Lectura: {newExercise.text}</p>
                <p>Pregunta: {newExercise.question}</p>
                <p>Respuesta: {newExercise.correctanswer}</p>
                </div>


            );
    
            case 'vocabulary':
    
            return(
                <div className='details-container'>
                <h2>Ejercicio de vocabulario</h2>
                <p>Autor: {newExercise.author}</p>
                <p>Pregunta: {newExercise.question}</p>
                <p>Respuesta: {newExercise.correctanswer}</p>
                </div>


            );
    
            default:
                navigate(-3);
                break;
        }


    };
    

    return (
        <div className="profile-page">
            <header className="header">
                <nav className="navbarcreate">
                    <ul>
                        <li>
                            <img src="../icons/image.png" style={{ height: 30, marginTop: 10 }} alt="Logo" />
                        </li>
                    </ul>
                    <h1 className="username-pass">{newExercise.author}</h1>
                </nav>
            </header>
            <div className="main-content">
                <div className="toolbarcreate">
                    <img className="tab-buttons" src='../icons/return_icon.png' onClick={goBack} alt="Return" />
                    <div className="logout-button">
                        <img className="tab-buttons" src="../icons/logout_icon.png" alt="Logout" />
                    </div>
                </div>
                <div className='upload-div'>
                    <h2>Detalles del Ejercicio</h2>
                    <div className='upload-details-div'>
                    {showExercise()}

                    </div>
                    
                </div>
            </div>
            <button type='submit' className='check-upload-b'>Subir</button>
            <button className='upload-cancel' onClick={cancelCreate}>Cancelar</button>
        </div>
    );
};

export default UploadEx;
