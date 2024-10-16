import React, { useState, useEffect, useImperativeHandle,forwardRef } from 'react';
import './OrderSentence.css'

const OrderSentence = forwardRef(({ exercise, onCorrectAnswer } , ref) => {
    const [bloques, setBloques] = useState([]);
    const [respuestaUsuario, setRespuestaUsuario] = useState([]);
    const [resultado, setResultado] = useState(null); // Para mostrar el resultado al final

    useEffect(() => {
        // Obtener los bloques del ejercicio en desorden
        const bloquesArray = [
            { id: 'bloque1', text: exercise.bloque1 },
            { id: 'bloque2', text: exercise.bloque2 },
            { id: 'bloque3', text: exercise.bloque3 },
            { id: 'bloque4', text: exercise.bloque4 }
        ];

        // Mezclar los bloques
        const bloquesDesordenados = bloquesArray.sort(() => Math.random() - 0.5);
        setBloques(bloquesDesordenados);
    }, [exercise]);

    // Manejar la selección de bloques por parte del usuario
    const seleccionarBloque = (bloque) => {
        setRespuestaUsuario([...respuestaUsuario, bloque]);
        setBloques(bloques.filter((b) => b.id !== bloque.id)); // Remover el bloque seleccionado
    };

      // Exponer la función a mi componente principal para que pueda usar verificarRespuesta 
      // y reiniciar usando useImperativeHandle
      useImperativeHandle(ref, () => ({
        verificarRespuesta,
        reiniciar
    }));

    // Funcion para verificar la respuesta
    const verificarRespuesta = () => {
        // Concatenar los textos de los bloques seleccionados por el usuario
        const respuestaConcatenada = respuestaUsuario.map(b => b.text).join(' ');
    
        // Normalizamos ambas cadenas eliminando espacios extra y poniendo todo en minusculas
        const respuestaUsuarioNormalizada = respuestaConcatenada.trim().replace(/\s+/g, ' ').toLowerCase();
        const oracionCorrectaNormalizada = exercise.oracion.trim().replace(/\s+/g, ' ').toLowerCase();
        
        // Mostrar las respuestas normalizadas para debuggear
        console.log("Respuesta normalizada del usuario:", respuestaUsuarioNormalizada);
        console.log("Oración normalizada correcta:", oracionCorrectaNormalizada);
        
        // Comparamos con el campo 'oracion' del ejercicio
        // esCorrecto es una variable booleana btw
        const esCorrecto = respuestaUsuarioNormalizada === oracionCorrectaNormalizada;
       
        if(esCorrecto) {
            console.log('El resultado Es COrrectoo')     
        } else {
            console.log('Respuesta Incorrecta'); 
        }

        return esCorrecto;
    };

    /*
    const verificarRespuesta = () => {
        // Generar el formato de respuesta del usuario usando los IDs de los bloques seleccionados
        const respuestaUsuarioIDs = respuestaUsuario.map(b => b.id).join('+');
    
        // Comparamos con el campo 'respuesta' del ejercicio
        const esCorrecto = respuestaUsuarioIDs === exercise.respuesta;
        
        setResultado(esCorrecto ? '¡Correcto!' : 'Incorrecto, intenta de nuevo.');
    };
    */
    
    // Función para reiniciar el ejercicio
    const reiniciar = () => {
        console.log("Reiniciando...");
        setRespuestaUsuario([]);
        const bloquesArray = [
            { id: 'bloque1', text: exercise.bloque1 },
            { id: 'bloque2', text: exercise.bloque2 },
            { id: 'bloque3', text: exercise.bloque3 },
            { id: 'bloque4', text: exercise.bloque4 }
        ];
        const bloquesDesordenados = bloquesArray.sort(() => Math.random() - 0.5);
        setBloques(bloquesDesordenados);
        setResultado(null); 
    };

    return (
        <div className="container">
            <div className="sentence-container">
                {bloques.map((bloque, index) => (
                    <button key={index} className="word-button" onClick={() => seleccionarBloque(bloque)}>
                        {bloque.text}
                    </button>
                ))}
            </div>
            <div className="response-container">
            {respuestaUsuario.map((bloque, index) => (
                    <span key={index} className="response-word">{bloque.text} </span>
                ))}
            </div>

            <button onClick={reiniciar}>reiniciar</button>
        </div>
    );
});

export default OrderSentence;
