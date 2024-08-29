import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import './Exam.css';
import { AuthContext } from '../firebasestuff/authContext';
import { collection, getDocs, doc, updateDoc, query,where } from "firebase/firestore";

const Exam = () => {
    const [exercises, setExercises] = useState([]);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(0);
    const [audio] = useState(new Audio());
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [isAnswerSelected, setIsAnswerSelected] = useState(false);

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
        setIsAnswerSelected(true);
    };

    //ACTUALIZAR NIVEL DE USUARIO
    const updateUserNivel = async (nivel) => {
        if (!user) {
            console.error("Usuario no autenticado");
            return;
        }
    
        try {
            const usersRef = collection(db, 'usuario');
            const q = query(usersRef, where("email", "==", user.email)); // Busca el usuario por email
            const querySnapshot = await getDocs(q);
    
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0]; // Obtén el primer documento coincidente
                const userRef = doc(db, "usuario", userDoc.id); // Usa el ID del documento para referenciarlo
                await updateDoc(userRef, { nivel }); // Actualiza el campo 'nivel' del usuario
                console.log(`Nivel del usuario actualizado a ${nivel}`);
            } else {
                console.error("No se encontró el usuario en la colección 'usuario'");
            }
        } catch (error) {
            console.error("Error al actualizar el nivel del usuario:", error);
        }
    };

    const handleNext = async () => {
        // Pausar el audio para que no se siga escuchando al continuar
        audio.pause();
        audio.currentTime = 0;

        if (answers[currentExerciseIndex] === exercises[currentExerciseIndex].respuestacorrecta) {
            setScore(score + 1);
        }

        setIsAnswerSelected(false);

        if (currentExerciseIndex < exercises.length - 1) {
            setCurrentExerciseIndex(currentExerciseIndex + 1);
        } else {
            const nivel = score <= 6 ? 'B1' : 'B2';
            // Asignar el nivel y redirigir al usuario
            await updateUserNivel(nivel); // Llama a la función para actualizar el nivel en Firestore
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
        <div className='fondo'>
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
                <img 
                    className="audio-button" 
                    onClick={() => playAudio(currentExercise.audioUrl)} 
                    src='/icons/puchainanegra_icon.png'
                    height='50px'
                />
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
                <button className="next-button" onClick={handleNext} disabled={!isAnswerSelected} >Siguiente</button>
            </div>
        </div>
    </div>
    );
};

export default Exam;