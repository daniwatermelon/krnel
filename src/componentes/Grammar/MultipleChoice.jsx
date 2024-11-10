import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import './MultipleChoice.css'
const MultipleChoice = forwardRef(({ exercise, onAnswerChange, onCorrectAnswer }, ref) => {
    const [selectedOption, setSelectedOption] = useState(null); // Opción seleccionada por el usuario


    // Al montar el componente, inicializamos el estado
    useEffect(() => {
        setSelectedOption(null); // Reiniciar la selección cuando se carga un nuevo ejercicio
    }, [exercise]);

    // Función para manejar la selección de opción
    /*const seleccionarOpcion = (opcion) => {   
        setSelectedOption(opcion);
    };*/

    const handleAnswerChange = (e) => {
        const selectedValue = e.target.value;
        setSelectedOption(selectedValue); // Actualiza el estado con la opción seleccionada
        if (onAnswerChange) {
            onAnswerChange(selectedValue); // Llama a la función de respuesta con el valor seleccionado
        }
    };

    // Exponer las funciones de verificarRespuesta y reiniciar al componente principal
    useImperativeHandle(ref, () => ({
        verificarRespuesta,
        reiniciar
    }));

    // Función para verificar si la opción seleccionada es correcta
    const verificarRespuesta = () => {
        // Comparar con la opción correcta del ejercicio
        const esCorrecto = selectedOption === exercise.opcioncorrecta;
        // Llamar a la función que indica la respuesta correcta al componente padre
        if (onCorrectAnswer) {
            onCorrectAnswer(esCorrecto);
        }
        return esCorrecto;
    };

    // Función para reiniciar el ejercicio
    const reiniciar = () => {
        console.log("Reiniciando...");
        setSelectedOption(null);
    };

    return (
        <div className="container">
            <div className="multiple-choice-sentence-container">
                {/* Mostrar las dos partes de la oración */}
                <span>{exercise.oracionparte1} </span>
                <span>______</span>
                <span> {exercise.oracionparte2}</span>
            </div>

            <div className="options-container">
                {/* Mostrar las 4 opciones */}
                {[exercise.opcion1, exercise.opcion2, exercise.opcion3, exercise.opcion4].map((opcion, index) => (
                    <div className='answer-box' key={index}>
                        <input
                            type="radio"
                            id={`opcion${index}`}
                            name="opcion"
                            value={opcion}
                            onChange={handleAnswerChange}
                            checked={selectedOption === opcion}
                        />
                        <label htmlFor={`opcion${index}`}>{opcion}</label>
                    </div>
                ))}
            </div>
            <button className='reset' onClick={reiniciar}>Reestablish</button>
        </div>
    );
});

export default MultipleChoice;
