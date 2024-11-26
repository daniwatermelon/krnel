import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import './Imageasociation.css'

const ImageAsociation = forwardRef(({ exercise, onAnswerChange, onCorrectAnswer }, ref) => {
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
        const esCorrecto = userResponse.trim().toLowerCase() === exercise.respuestaesperada.trim().toLowerCase();
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
        setUserResponse('');
    };

    return (
        <div className="container">
            <div className="image-asociation-container">
            <div className="sentence-container">
                    {exercise.imagen ? (
                <img src={exercise.imagen} 
                style={{ maxWidth: '100%', maxHeight: '300px', display: 'block', margin: '0 auto' }} 
                alt="Perro" />
            ) : (
                <p>Imagen no disponible</p>
            )}
          
            <p></p>
            <input 
                type="text" 
                value={userResponse} 
                onChange={handleInputChange} 
                placeholder="Whats in the image above?" 
                className="image-asociation-input-text"
                maxLength={50}
            />
              </div>
            <button onClick={reiniciar} className="reset">Reestablish</button>
        </div>
    </div>
    );
});
export default ImageAsociation;
