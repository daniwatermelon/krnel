import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import './VerbalTime.css';
import {levenshteinDistance} from '../../levenshtein';

const VerbalTime = forwardRef(({ exercise, onCorrectAnswer }, ref) => {
    const [userResponse, setUserResponse] = useState('');
    const [resultado, setResultado] = useState('');

    useEffect(() => {
        reiniciar();
    }, [exercise]);

    // Función para manejar el cambio en el cuadro de texto
    const handleInputChange = (event) => {
        setUserResponse(event.target.value);
    };

    // Función para verificar la respuesta
    const verificarRespuesta = () => {
        if (!userResponse.trim()) {
            return;  // No hacer nada si la respuesta esta vacia
        }

        const distancia = levenshteinDistance(userResponse.trim().toLowerCase(), exercise.respuesta.trim().toLowerCase());
        const esCorrecto = distancia <= 3; // Considerar correcto si la distancia es 3 o menor
        
        console.log("Respuesta del usuario:", userResponse);
        console.log("Respuesta correcta:", exercise.fragmentocorrecto);
        console.log("Distancia de Levenshtein:", distancia);    
        
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
        setUserResponse('');
        setResultado('');
    };

    return (
        <div className="container">
            <div className='instruccion'>
            <h3>{exercise.instruccion}</h3>
            </div>
            <p className="oracion">{exercise.oracionpresente}</p>
            <input 
                type="text" 
                value={userResponse} 
                onChange={handleInputChange} 
                placeholder="Escribe tu respuesta aquí" 
                className="input-text"
                maxLength={50}
            />
            <button onClick={reiniciar} className="reset-button">Reiniciar</button>
            {resultado && <p className={`resultado ${resultado === 'Correcto' ? 'correcto' : 'incorrecto'}`}>{resultado}</p>}
        </div>
    );
});

export default VerbalTime;
