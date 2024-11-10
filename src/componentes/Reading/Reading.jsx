import React, { useState, useImperativeHandle, forwardRef } from 'react';
import './Reading.css';

const Reading = forwardRef(({ exercise, onFinish }, ref) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    
    const questions = [
        { question: exercise.pregunta1, correctAnswer: exercise.respuesta1 },
        { question: exercise.pregunta2, correctAnswer: exercise.respuesta2 },
        { question: exercise.pregunta3, correctAnswer: exercise.respuesta3 },
        { question: exercise.pregunta4, correctAnswer: exercise.respuesta4 }
    ];
    
    const currentQuestion = questions[currentQuestionIndex];
    const options = currentQuestion.question.split(',');

    const handleAnswerChange = (selectedOption) => {
        setUserAnswers({
            ...userAnswers,
            [currentQuestionIndex]: selectedOption
        });
    };

    const verificarRespuesta = () => {
        const respuestaUsuario = userAnswers[currentQuestionIndex];
        const esCorrecto = respuestaUsuario === currentQuestion.correctAnswer;

        const siguientePregunta = currentQuestionIndex + 1;
        if (siguientePregunta < questions.length) {
            setCurrentQuestionIndex(siguientePregunta); // Avanza a la siguiente pregunta
        } else {
            // Verificar si todas las respuestas son correctas
            const allCorrect = questions.every((question, index) => userAnswers[index] === question.correctAnswer);
            onFinish(allCorrect); // Envía true si todas son correctas, de lo contrario false
        }
    };

    const reiniciar = () => {
        setCurrentQuestionIndex(0);
        setUserAnswers({});
    };

    useImperativeHandle(ref, () => ({
        verificarRespuesta,
        reiniciar
    }));

    return (
        <div className='container'>
            <div className="question-box">
                <p>{exercise.lectura}</p>
            </div>
            <div className="question-section">
                <p>{options[0]}</p>
                <ul>
                    {options.slice(1).map((option, index) => (
                        <li key={index}>
                            <label>
                                <input
                                    type="radio"
                                    name={`question${currentQuestionIndex}`}
                                    value={option.trim()}
                                    checked={userAnswers[currentQuestionIndex] === option.trim()}
                                    onChange={() => handleAnswerChange(option.trim())}
                                />
                                {option.trim()}
                            </label>
                        </li>
                    ))}
                </ul>
            </div>
            <button className='reading-next-question' onClick={verificarRespuesta}>Next Question</button>
            <button className='reset' onClick={reiniciar}>Reestablish</button>
        </div>
    );
});

export default Reading;
