import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import './CompleteSentence.css';

const CompleteSentence = forwardRef(({ exercise, onCorrectAnswer }, ref) => {
    const [answers, setAnswers] = useState({});

    // Al montar el componente, inicializamos las respuestas
    useEffect(() => {
        if (!exercise) return;  // Verificar si 'exercise' está definido

        const initialAnswers = {};

        // Iteramos sobre los fragmentos y agregamos los que están vacíos a answers
        Object.keys(exercise).forEach((key) => {
            if (key.startsWith('fragmento') && !exercise[key]) { // Solo si el fragmento está vacío
                initialAnswers[key] = ''; // Inicializamos como vacío
            }
        });

        setAnswers(initialAnswers);
    }, [exercise]);

    // Función para manejar el cambio de respuesta
    const handleAnswerChange = (fragment, value) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [fragment]: value,
        }));
    };

    // Función para verificar las respuestas
    const verificarRespuesta = () => {
        let esCorrecto = true;

        if (!exercise) return false;

        // Comprobar si el usuario ha ingresado algo en todos los campos
        for (const fragmento in answers) {
            const respuestaUsuario = answers[fragmento]?.trim() || ''; // Si la respuesta del usuario no está definida, asignamos un valor vacío
            if (respuestaUsuario === '') {
                return;
            }
        }

        // Compara las respuestas de los fragmentos vacíos con las respuestas esperadas
        Object.keys(answers).forEach((fragmento, index) => {
            const respuestaKey = `respuesta${index + 1}`; // Generamos el nombre de la respuesta esperada (respuesta1, respuesta2, etc.)
            const respuestaEsperada = exercise?.[respuestaKey] || ''; // Si la respuesta no está definida, asignamos un valor vacío
            const respuestaUsuario = answers[fragmento]?.trim() || ''; // Si la respuesta del usuario no está definida, asignamos un valor vacío

            // Comparación de respuestas (sin tener en cuenta mayúsculas/minúsculas ni espacios)
            if (respuestaUsuario.toLowerCase() !== respuestaEsperada.toLowerCase()) {
                esCorrecto = false;
            }
        });

        if (onCorrectAnswer) {
            onCorrectAnswer(esCorrecto);
        }

        return esCorrecto;
    };

    useImperativeHandle(ref, () => ({
        verificarRespuesta,
    }));

    // Ordenamos los fragmentos por su numero (fragmento1, fragmento2, etc.)
    const sortedFragments = exercise
        ? Object.keys(exercise)
              .filter((key) => key.startsWith('fragmento')) // Filtrar solo los fragmentos
              .sort((a, b) => {
                  const numA = parseInt(a.replace('fragmento', ''), 10);
                  const numB = parseInt(b.replace('fragmento', ''), 10);
                  return numA - numB; // Ordenar por número
              })
        : [];

    return (
        <div className="container">
            <div className="complete-sentence-container">
                {sortedFragments.map((key, index) => {
                    const fragmento = exercise[key];

                    return (
                        <div key={index} className="complete-sentence-fragment">
                            {/* Verifica si el fragmento está vacío y muestra un cuadro de texto si lo está */}
                            {fragmento === '' ? (
                                <input
                                    type="text"
                                    value={answers[key] || ''}
                                    onChange={(e) => handleAnswerChange(key, e.target.value)}
                                    maxLength={50}
                                />
                            ) : (
                                <span>{fragmento}</span> // Si no está vacío, solo mostramos el fragmento
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

export default CompleteSentence;
