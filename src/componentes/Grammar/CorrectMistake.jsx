import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import './CorrectMistake.css';

const CorrectMistake = forwardRef(({ exercise, onCorrectAnswer }, ref) => {
    const [selectedFragment, setSelectedFragment] = useState(null);
    const [resultado, setResultado] = useState('');

    useEffect(() => {
        reiniciar();
    }, [exercise]);

    // Función para manejar la selección del fragmento
    const handleFragmentClick = (fragment) => {
        setSelectedFragment(fragment);
    };

    // Función para verificar la respuesta
    const verificarRespuesta = () => {
        const esCorrecto = selectedFragment === exercise.fragmentocorrecto;
        console.log("Respuesta del usuario:", selectedFragment);
        console.log("Respuesta correcta:", exercise.fragmentocorrecto);
        
        if (onCorrectAnswer) {
            onCorrectAnswer(esCorrecto);
        }
        return esCorrecto;
    };

    useImperativeHandle(ref, () => ({
        verificarRespuesta,
        reiniciar
    }));

    // Función para reiniciar el ejercicio
    const reiniciar = () => {
        setSelectedFragment(null);
        setResultado('');
    };

    return (
        <div className="container">
            <h3></h3>
            <p className="sentence">
                {[exercise.fragmento1, exercise.fragmento2, exercise.fragmento3, exercise.fragmento4].map((fragment, index) => (
                    <span
                        key={index}
                        className={`fragment ${selectedFragment === fragment ? 'selected' : ''}`}
                        onClick={() => handleFragmentClick(fragment)}
                    >
                        {fragment}
                    </span>
                ))}
            </p>
            <button onClick={reiniciar} className="reset-button">Reestablish</button>
            {resultado && <p className="resultado">{resultado}</p>}
        </div>
    );
});

export default CorrectMistake;