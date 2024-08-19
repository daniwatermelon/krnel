// Dashboard.jsx
import React, { useRef,useContext, useState } from 'react';
import signOutUser from '../firebasestuff/auth_signout';
import { useNavigate, useLocation } from 'react-router-dom';
import './CreateR.css'
import { AuthContext } from '../firebasestuff/authContext';
import { getDataFromCollections } from '../firebasestuff/userDataQueries';

const CreateR = () => {
    const [userText, setUserText] = useState('');
    const [userAnswerText, setUserAnswerText] = useState('');
    const [userQuestionText, setUserQuestionText] = useState('');

    const { state } = useLocation();
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

    const handleCheck = (e) => {
        e.preventDefault(); // Previene el comportamiento por defecto del formulario
        if (userText && userAnswerText && userQuestionText) {
            const newExercise = {
                text: userText,
                correctanswer: userAnswerText,
                author: usernamePass,
                question: userQuestionText,
                type: 'reading'
            };
            navigate('/upload-ex', { state: { newExercise } });
        } else {
            setError('Debes de llenar al menos un texto para la respuesta para poder proceder');
        }
    };
    return (
        <body>
            
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
                    <div className='question-div-vocabulary'>
                        <form onSubmit={handleCheck}>
                        <h3>Escribe tu lectura:</h3>
                        <div className='flexdiv-row'>
                            <input
                                type="text"
                                maxLength={200}
                                value={userText}
                                onChange={(e) => setUserText(e.target.value)}

                            />
                        </div>
                        <p>{userText.length}/200</p>
                        <h3>Escribe la pregunta</h3>
                        <div className='flexdiv-row'>
                            <input
                                type="text"
                                id='userquestiontext'
                                maxLength={50}
                                value={userQuestionText}
                                onChange={(e) => setUserQuestionText(e.target.value)}

                            />
                        </div>
                        <p>{userQuestionText.length}/50</p>
                        <h3 className='answerh3-complete'>Escribe la respuesta:</h3>
                        <div className='flexdiv-row'>
                            <input
                                type="text"
                                id='useranswertext'
                                maxLength={50}
                                value={userAnswerText}
                                onChange={(e) => setUserAnswerText(e.target.value)}
                            />
                        </div>
                        <p>{userAnswerText.length}/50</p>
                        <button type='submit' className='upload_openqg'>Subir</button>

                        </form>
                    </div>
                    
                    <div className='answers-open-div'>
                        
                      
                    </div>
                    
                </div>
                

            </div>

        </div>

</body>


    );
};

export default CreateR;
