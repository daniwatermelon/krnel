import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, getDocs } from "firebase/firestore";
import './Exam.css';

const Exam = () => {
    const [exercises, setExercises] = useState([]);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(0);
    const [audio] = useState(new Audio());
    const navigate = useNavigate();

    useEffect(() => {
        const fetchExercises = async () => {
            const querySnapshot = await getDocs(collection(db, "submodulonivelacion"));
            const exercisesList = querySnapshot.docs.map(doc => doc.data());
            setExercises(exercisesList);
        };
        fetchExercises();
    }, []);

    const handleAnswerChange = (e) => {
        const newAnswers = { ...answers, [currentExerciseIndex]: e.target.value };
        setAnswers(newAnswers);
    };

    const handleNext = async () => {
        if (answers[currentExerciseIndex] === exercises[currentExerciseIndex].respuestacorrecta) {
            setScore(score + 1);
        }
        if (currentExerciseIndex < exercises.length - 1) {
            setCurrentExerciseIndex(currentExerciseIndex + 1);
        } else {
            const nivel = score <= 6 ? 'B1' : 'B2';
            // Adignar el nivel y te redirige al modulo de ejercicios de la comunidad
            await updateUserNivel(nivel);
            navigate('/dashboard');
        }
    };

    const playAudio = (audioUrl) => {
        audio.src = audioUrl;
        audio.play();
    };

    if (exercises.length === 0) {
        return <div>Loading...</div>;
    }

    const currentExercise = exercises[currentExerciseIndex];
    const isListeningExercise = currentExercise.tipo === 'auditiva';

    return (
        <div className="exam-container">
            <div className="question-header">
                <h2>Nivelación</h2>
            </div>
            <div className="separator"></div>
            <div className="question-title">
               <p>{currentExerciseIndex + 1}.</p>
            </div>
            {isListeningExercise && (
                <div className="audio-control">
                    <button onClick={() => playAudio(currentExercise.audioUrl)}>Reproducir Audio</button>
                </div>
            )}
            <div className="question-box">
                <p className="question-text">{currentExercise.lectura}</p>
            </div>
            <div className="answer-container">
                {[currentExercise.respuesta1, currentExercise.respuesta2, currentExercise.respuesta3, currentExercise.respuesta4].map((respuesta, index) => (
                    <div className="answer-box" key={index}>
                        <input 
                            type="radio" 
                            id={`respuesta${index}`} 
                            name="respuesta" 
                            value={respuesta} 
                            onChange={handleAnswerChange} 
                            checked={answers[currentExerciseIndex] === respuesta}
                        />
                        <label htmlFor={`respuesta${index}`}>{respuesta}</label>
                    </div>
                ))}
            </div>
            <div className="footer">
                <p className="question-progress">{currentExerciseIndex + 1}/{exercises.length}</p>
                <button className="next-button" onClick={handleNext}>Siguiente</button>
            </div>
        </div>
    );
};

export default Exam;