import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import './Crossword.css';

const Crossword = forwardRef(({ exercise, onAnswerChange, onCorrectAnswer }, ref) => {
    const [userAnswers, setUserAnswers] = useState({});
    const gridSize = exercise.gridSize || 7;

    useEffect(() => {
        setUserAnswers({});
    }, [exercise]);

    const handleInputChange = (e, row, col) => {    
        const newUserAnswers = { ...userAnswers, [`${row}-${col}`]: e.target.value.toUpperCase() };
        setUserAnswers(newUserAnswers);

        if (onAnswerChange) {
            onAnswerChange(newUserAnswers);
        }
    };

    /*const verificarRespuesta = () => {
        const correctAnswers = exercise.correctAnswers || {};
        const isCorrect = Object.entries(correctAnswers).every(
            ([key, letter]) => userAnswers[key] === letter
        );

        if (onCorrectAnswer) {
            onCorrectAnswer(isCorrect);
        }
        return isCorrect;
    };*/

    const verificarRespuesta = () => {

        /* ESTE FRAGMENTO NO PERMITE ESPACIOS VACIOS
        const hasNonEmptyAnswer = Object.values(userAnswers).some(value => value === '');
        if (hasEmptyAnswer) {
            console.log('Hay respuestas vacías. No se puede verificar.');
            return false;  // No verifica si hay respuestas vacías
        }*/

        // Verifica si al menos una respuesta no está vacía
        const hasEmptyAnswer = Object.values(userAnswers).some(value => value !== '');
        if (!hasEmptyAnswer) {
            console.log('No hay respuestas para verificar.');
            return;
        }


        const correctAnswers = exercise.correctAnswers || {};
        let correctCount = 0;
    
        // Contamos el numero de respuestas correctas
        Object.entries(correctAnswers).forEach(([key, letter]) => {
            if (userAnswers[key] === letter) {
                correctCount++;
            }
        });
    
        // Calculamos el porcentaje de respuestas correctas
        const totalAnswers = Object.keys(correctAnswers).length;
        const correctPercentage = (correctCount / totalAnswers) * 100;
        
        console.log(`Respuestas correctas: ${correctCount}/${totalAnswers} (${correctPercentage.toFixed(2)}%)`);
        // Verificamos si cumple el criterio del 70%
        const isCorrect = correctPercentage >= 70;
    
        if (onCorrectAnswer) {
            onCorrectAnswer(isCorrect);
        }
        
        return isCorrect;
    };
    

    useImperativeHandle(ref, () => ({
        verificarRespuesta,
        reiniciar
    }));

    const reiniciar = () => {
        setUserAnswers({});
    };

    return (
    <div className='container'>
        <div className='container-for-crossword'>
            <div className="crossword-container">
                <div className="crossword-clues-container">
                    <h3>Clues</h3>
                    <ul>
                    {Object.keys(exercise)
                        .filter((key) => key.startsWith("pista") && exercise[key]) // Filtra las claves que comienzan con "pista" y tienen valor
                        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) // Ordena las claves numericamente
                        .map((key) => (
                            <li key={key}>
                                {key.replace("pista", "")}. {exercise[key]} {/* Extrae el numero de la clave */}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="crossword-grid" style={{
                    gridTemplateColumns: `repeat(${gridSize}, 40px)`,
                    gridTemplateRows: `repeat(${gridSize}, 40px)`
                }}>
                    {Array.from({ length: gridSize }).map((_, row) => (
                     Array.from({ length: gridSize }).map((_, col) => {
       
                        const cellKey = `${row}-${col}`;
                        const isEditable = cellKey in (exercise.correctAnswers || {});
                        
                        /*const clueNumber = exercise.clueNumbers?.[cellKey];*/
                        const clueNumber = exercise.clueNumbers?.[cellKey];

                return (
                    <div key={cellKey} className="crossword-cell-wrapper">
                        {/* Renderiza el numero de pista en la esquina superior izquierda */}
                        {clueNumber && <span className="clue-number">{clueNumber}</span>}
                        {isEditable /*&& isNaN(exercise.correctAnswers[cellKey])*/ ? (
                            <input
                                type="text"
                                maxLength="1"
                                value={userAnswers[cellKey] || ''}
                                onChange={(e) => handleInputChange(e, row, col)}
                                className="editable crossword-cell"
                                
                            />
                        ) : (
                            <div className="crossword-cell empty"></div>
                        )}
                    </div>
                );
            })
        ))}
                </div>
            </div>
            <button className="crossword-reset" onClick={reiniciar}>Reestablish</button>
        </div>
        </div>
    );
});

export default Crossword;
