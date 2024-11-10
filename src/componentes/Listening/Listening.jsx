import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import './Listening.css';
import playButton from '../Pronunciation/play-button.png';

const Listening = forwardRef(({ exercise, onFinish }, ref) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const audioRef = useRef(null);

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
            setCurrentQuestionIndex(siguientePregunta);
        } else {
            const allCorrect = questions.every((question, index) => userAnswers[index] === question.correctAnswer);
            
            onFinish(allCorrect);
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

    const playAudio = () => {
        audioRef.current.pause(); // Pausa el audio actual
        audioRef.current.currentTime = 0; // Reinicia el tiempo de reproducción
        audioRef.current.play(); // Reproduce el audio desde el inicio
    };

    return (
        <div className='container'>
             <p></p>
            <button onClick={playAudio} className='audio-button'>
                <img src={playButton} alt='Play Audio' className='play-button-image' />
            </button>
            <audio ref={audioRef} src={exercise.audio} />

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
            <button className='listening-next-question' onClick={verificarRespuesta}>Next Question</button>
            <button className='reset' onClick={reiniciar}>Reestablish</button>
        </div>
    );
});

export default Listening;
