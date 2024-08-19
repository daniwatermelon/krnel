// Dashboard.jsx
import React, { useContext, useState } from 'react';
import signOutUser from '../firebasestuff/auth_signout';
import { useNavigate } from 'react-router-dom';
import './CreateGOpenQ.css';
import { AuthContext } from '../firebasestuff/authContext';

const CreateGOpenQ = () => {
    const [openQuestion, setOpenQuestion] = useState('');
    const [answers, setAnswers] = useState(['']); // Estado para las respuestas
    const [correctAnswerIndex, setCorrectAnswerIndex] = useState(null);

    const { usernamePass } = useContext(AuthContext); // Se usa el contexto de Auth para pasar el nombre de usuario
    const navigate = useNavigate(); // Se incluye todo de navegación

    const goBack = () => {
        navigate(-1);
    };

    const handleSignOut = () => {
        signOutUser().then(() => { // Esta función ejecuta SignOutUser
            navigate('/'); // Y lo regresa a la pestaña principal
        }).catch((error) => {
            console.error('An error happened during sign-out:', error); // Si por alguna razón no puede salirse, se ejecuta este error en la consola
        });
    };

    const handleAddAnswer = () => {
        if (answers.length < 4) {
            setAnswers([...answers, '']);
        }
    };

    const handleAnswerChange = (index, value) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    const handleRemoveAnswer = (index) => {
        const newAnswers = answers.filter((_, i) => i !== index);
        setAnswers(newAnswers);

        if (correctAnswerIndex === index) {
            setCorrectAnswerIndex(null);
        } else if (correctAnswerIndex > index) {
            setCorrectAnswerIndex(correctAnswerIndex - 1);
        }
    };

    const handleSelectCorrectAnswer = (index) => {
        setCorrectAnswerIndex(index);
    };

    const handleCheck = (e) => {
        e.preventDefault(); // Previene el comportamiento por defecto del formulario
        if (firstText || (secondText && answerText)) {
            const newExercise = {
                correctanswer: answerText,
                question: openQuestion,
                author: usernamePass,
                answer2: firstText,
                answer3: secondText,
                answer4: asdaasdas,
                type: 'openQ'
            };
            navigate('/upload-ex', { state: { newExercise } });
        } else {
            setError('Debes de llenar al menos un texto para la respuesta para poder proceder');
        }
    }

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
                    <div className='question-div'>
                        <h3>Escribe tu pregunta:</h3>
                        <div className='flexdiv-row'>
                            <input
                                type="text"
                                id='question-open'
                                value={openQuestion}
                                onChange={(e) => setOpenQuestion(e.target.value)}
                                maxLength={50}

                            />
                            <p>{openQuestion.length}/50</p>
                        </div>
                    </div>
                    <div className='answers-open-div'>
                        <div className='flexdiv-row'>
                            <h3>Crea respuestas para tu pregunta y establece cual será la respuesta correcta</h3>
                            <button
                                className='add-answerb'
                                onClick={handleAddAnswer}
                                disabled={answers.length >= 4}
                            ></button>
                        </div>
                        {answers.map((answer, index) => (
                            <div key={index} className="answer-container">
                                <input
                                    type="text"
                                    value={answer}
                                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                                    className="answer-input"
                                    maxLength={50}
                                    required
                                />
                                <p>{answer.length}/50</p>
                                <button
                                    className="remove-answerb"
                                    onClick={() => handleRemoveAnswer(index)}
                                ></button>
                                <button
                                    className={`correct-answerb ${correctAnswerIndex === index ? 'selected' : ''}`}
                                    onClick={() => handleSelectCorrectAnswer(index)}
                                />
                            </div>
                            
                        ))}
                        
                    </div>
                    
                </div>
                
                

            </div>
            
            
            <button onClick={handleCheck} className='upload_openqg'>Subir</button>

        </div>
        
    );
    
};

export default CreateGOpenQ;
