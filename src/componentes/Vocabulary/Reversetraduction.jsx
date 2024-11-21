import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import './Reversetraduction.css'

const ReverseTraduction= forwardRef(({ exercise, onAnswerChange, onCorrectAnswer }, ref) => {
    const [userResponse, setUserResponse] = useState('');

    // Al montar el componente, inicializamos el estado
    useEffect(() => {
        setUserResponse(''); // Reiniciar la selección cuando se carga un nuevo ejercicio
    }, [exercise]);

    // Función para manejar la selección de opción
    /*const seleccionarOpcion = (opcion) => {   
        setSelectedOption(opcion);
    };*/

    // Función para manejar el cambio en el cuadro de texto
    const handleInputChange = (event) => {
        setUserResponse(event.target.value);
    };

    // Exponer las funciones de verificarRespuesta y reiniciar al componente principal
    useImperativeHandle(ref, () => ({
        verificarRespuesta,
        reiniciar
    }));

    // Función para verificar si la opción seleccionada es correcta
    const verificarRespuesta = () => {
        // Comparar con la opción correcta del ejercicio
        if(userResponse.trim() != ('')){
        const esCorrecto = userResponse.trim().toLowerCase() === exercise.caso1.trim().toLowerCase()
                           || userResponse.trim().toLowerCase() === exercise.caso2.trim().toLowerCase()
                           || userResponse.trim().toLowerCase() === exercise.caso3.trim().toLowerCase()
                           || userResponse.trim().toLowerCase() === exercise.caso4.trim().toLowerCase();

        // Llamar a la función que indica la respuesta correcta al componente padre
        if (onCorrectAnswer) {
            onCorrectAnswer(esCorrecto);
        }
        return esCorrecto;
        } else {
            return;
    }
    };

    // Función para reiniciar el ejercicio
    const reiniciar = () => {
        console.log("Reiniciando...");
        setSelectedOption(null);
    };

    return (
        <div className="container">
            <p className='traduction-header'></p>
            <div className="reverse-traduction-container">
            <div className="reverse-traduction-sentence-container">
                    <span>{exercise.frase}</span>        
            <input 
                type="text" 
                value={userResponse} 
                onChange={handleInputChange} 
                placeholder="Also Known in Spanish As:" 
                className="input-text"
                maxLength={50}
            />
              </div>
            <button onClick={reiniciar} className="reset">Reiniciar</button>
        </div>
    </div>
    );
});
export default ReverseTraduction;
