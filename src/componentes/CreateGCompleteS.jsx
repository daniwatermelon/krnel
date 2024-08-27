import React, { useContext, useState, useEffect } from 'react';
import signOutUser from '../firebasestuff/auth_signout';
import { useNavigate } from 'react-router-dom';
import './CreateGCompleteS.css';
import { AuthContext } from '../firebasestuff/authContext';

const CreateGCompleteS = () => {
    const [firstText, setFirstText] = useState('');
    const [secondText, setSecondText] = useState('');
    const [answerText, setAnswerText] = useState('');
    const [error, setError] = useState(null);
    const { usernamePass } = useContext(AuthContext);
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    const handleSignOut = () => {
        signOutUser().then(() => {
            navigate('/');
        }).catch((error) => {
            console.error('An error happened during sign-out:', error);
        });
    };

    const handleCheck = (e) => {
        e.preventDefault();
        if (firstText || (secondText && answerText)) {
            const newExercise = {
                correctanswer: answerText,
                author: usernamePass,
                text1: firstText,
                text2: secondText,
                type: 'completeS'
            };
            navigate('/upload-ex', { state: { newExercise } });
        } else {
            setError('Debes de llenar al menos un texto para la respuesta para poder proceder');
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
                    <h1 className="username-pass">{usernamePass}</h1>
                </nav>
            </header>
            <div className="main-content">
                <div className="toolbarcreate">
                    <img className="tab-buttons" src='../icons/return_icon.png' onClick={goBack} alt="Return" />
                    <div className="logout-button">
                        <img className="tab-buttons" src="../icons/logout_icon.png" onClick={handleSignOut} alt="Logout" />
                    </div>
                </div>
                <div className="createexercises-container-open">
                    <div className='question-div-complete'>
                        <form onSubmit={handleCheck}>
                            <h3>Escribe tu primer texto:</h3>
                            <div className='flexdiv-row'>
                                <input  
                                    type="text"
                                    id='first_text'
                                    value={firstText}
                                    onChange={(e) => setFirstText(e.target.value)}
                                    maxLength={50}
                                />
                                <p>{firstText.length}/50</p>
                            </div>
                            <h3 className='answerh3-complete'>Aquí va la respuesta:</h3>
                            <div className='flexdiv-row'>
                                <input
                                    type="text"
                                    id='answer_text'
                                    value={answerText}
                                    onChange={(e) => setAnswerText(e.target.value)}
                                    maxLength={50}
                                    required
                                />
                                <p>{answerText.length}/50</p>
                            </div>
                            <h3>Escribe tu último texto:</h3>
                            <div className='flexdiv-row'>
                                <input
                                    type="text"
                                    id='second_text'
                                    value={secondText}
                                    onChange={(e) => setSecondText(e.target.value)}
                                    maxLength={50}
                                />
                                <p>{secondText.length}/50</p>
                                
                            </div>
                            <h3 style={{color:"gray"}}>Este es tu texto</h3>
                            <p className="combined-text">
                            {firstText} <span style={{ color: '#39b019', textDecoration: 'underline' }}>{answerText}</span> {secondText}
                        </p>
                            <p>{error}</p>
                            <button type='submit' className='upload_openqg'>Subir</button>
                        </form>
                        {/* Renderizar el texto combinado con colores */}
                       
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateGCompleteS;
