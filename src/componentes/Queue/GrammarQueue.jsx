import React, { useState, useEffect } from 'react';
import { getGrammarExercises } from '../services/exerciseService'; // Función que recupera ejercicios de Firestore
import MultipleChoice from './subtypes/MultipleChoice';
import SentenceOrder from './subtypes/SentenceOrder';

const GrammarQueue = () => {
    const [exercises, setExercises] = useState([]);
    const [currentExercise, setCurrentExercise] = useState(null);

    // Obtener todos los ejercicios de gramática cuando se monta el componente
    useEffect(() => {
        async function fetchExercises() {
            const grammarExercises = await getGrammarExercises();
            setExercises(grammarExercises);
            setCurrentExercise(grammarExercises[0]); // Iniciar con el primer ejercicio
        }

        fetchExercises();
    }, []);

    const handleNextExercise = () => {
        // Tomar un ejercicio aleatorio de la cola
        const nextExercise = exercises[Math.floor(Math.random() * exercises.length)];
        setCurrentExercise(nextExercise);
    };

    if (!currentExercise) {
        return <div>Loading...</div>;
    }

    // Mostrar el componente de ejercicio basado en su subtipo
    const renderExerciseComponent = (exercise) => {
        switch (exercise.subtype) {
            case 'opcionmultiple':
                return <MultipleChoice exercise={exercise} />;
            case 'ordenaroraciones':
                return <SentenceOrder exercise={exercise} />;
            // Agrega más subtipos aquí
            default:
                return <div>Exercise type not supported yet.</div>;
        }
    };

    return (
        <div>
            <h2>Ejercicio de Gramática</h2>
            {renderExerciseComponent(currentExercise)}
            <button onClick={handleNextExercise}>Siguiente Ejercicio</button>
        </div>
    );
};

export default GrammarQueue;
