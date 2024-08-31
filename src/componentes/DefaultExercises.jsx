// Dashboard.jsx
import React, { useRef,useContext, useState } from 'react';
import signOutUser from '../firebasestuff/auth_signout';
import { useNavigate, useLocation } from 'react-router-dom';
import './DefaultExercises.css'
import { AuthContext } from '../firebasestuff/authContext';


const DefaultExercises = () => {
    const [selectedExercise, setSelectedExercise] =  useState('');
    const { state } = useLocation();
    const { users: userData } = state.defaultextdata;
    const { usernamePass } = useContext(AuthContext); //Se usa el contexto de Auth para pasar el nombre de usuario
    const navigate = useNavigate(); //Se incluye todo de navegación

    
    const goBack = () => {
        navigate(-1);
    }

    const handleSignOut = () => {
        signOutUser().then(() => { //Esta función ejecuta SignOutUser
            navigate('/'); //Y lo regresa a la pestaña principal
        }).catch((error) => {
            console.error('An error happened during sign-out:', error); //Si por alguna razón no puede salirse, se ejecuta este error en la consola
        });
    };

    const handleExerciseChange = (e) => {
        setSelectedExercise(e.target.value); //actualizar el estado con el tipo de ejercicio
    };

    const handleStart = () => {
        if (selectedExercise === 'Gramatica') {
            navigate('/gramatica');
        } else if (selectedExercise === 'Vocabulario') {
            navigate('/vocabulario');
        } else if (selectedExercise === 'ComprensionAuditiva') {
            navigate('/comprension-auditiva');
        } else if (selectedExercise === 'ComprensionLectora') {
            navigate('/comprension-lectora');
        } else if (selectedExercise === 'Pronunciacion') {
            navigate('/pronunciacion');
        } else {
            navigate('/random')
        }
    };

    return (
        <body>
            <div className="profile-page">
                <header className="header">
                    <nav className="navbartypeexercises">
                        <ul>
                            <li>
                                <img src="../icons/image.png" style={{ height: 30, marginTop: 10 }} alt="Logo" />
                            </li>
                        </ul>
                        <h1 className="username-pass">{usernamePass}</h1>
                    </nav>
                </header>

                <div className="main-content">
                    <div className="toolbartypeexercises">
                        <img className="tab-buttons" src='../icons/return_icon.png' onClick={goBack} alt="Return" />
                        <div className="logout-button">
                            <img className="tab-buttons" src="../icons/logout_icon.png" onClick={handleSignOut} alt="Logout" />
                        </div>
                    </div>

                    <div className="typeexercises-container">
                        <div className='typeexercises-group'>
                            <h2 className='defaultex-title'>Ejercicios predeterminados</h2>
                            <img className='practiceicon' src="../icons/practice_icon.png" />
                        </div>
                        <hr className='hr-profile' />
                        <h3 className='filtertypes'>Filtra por: </h3>
                        <div className='filter-group'>
                            <div className='typeexercises-group'>
                                <input type='radio' value="Gramatica" onChange={handleExerciseChange} checked={selectedExercise === 'Gramatica'} />
                                <p>Gramática</p>
                            </div>
                            <div className='typeexercises-group'>
                                <input type='radio' value="Vocabulario" onChange={handleExerciseChange} checked={selectedExercise === 'Vocabulario'} />
                                <p>Vocabulario</p>
                            </div>
                            <div className='typeexercises-group'>
                                <input type='radio' value="ComprensionAuditiva" onChange={handleExerciseChange} checked={selectedExercise === 'ComprensionAuditiva'} />
                                <p>Comprensión auditiva</p>
                            </div>
                            <div className='typeexercises-group'>
                                <input type='radio' value="ComprensionLectora" onChange={handleExerciseChange} checked={selectedExercise === 'ComprensionLectora'} />
                                <p>Comprensión lectora</p>
                            </div>
                            <div className='typeexercises-group'>
                                <input type='radio' value="Pronunciacion" onChange={handleExerciseChange} checked={selectedExercise === 'Pronunciacion'} />
                                <p>Pronunciación</p>
                            </div>
                        </div>
                        <img className='start-button' src="../icons/play_icon.png" onClick={handleStart} alt="Start" />
                    </div>
                </div>
            </div>
        </body>
    );
};

export default DefaultExercises;