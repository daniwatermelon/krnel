import React, { useState, useRef, useImperativeHandle, forwardRef,useEffect } from 'react';
import './Pronunciation.css';
import handImage from './hand.png';
import micImage from './mic.png';
import playButton from './play-button.png'
import {levenshteinDistance} from '../../levenshtein';

const Pronunciation = forwardRef(({ exercise, onFinish }, ref) => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcriptionResult, setTranscriptionResult] = useState('');
    const audioRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const recordedChunks = useRef([]);
    const [atempts, setAtempts] = useState(3);

    //actualizar el audio cuando el exercise cambia
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load(); // Recarga el audio cuando exercise.audio cambia
            setTranscriptionResult('');
            setAtempts(3)
        }
    }, [exercise.audio]);
    
    // Esta es la funcion que maneja la transcripcin obtenida
    const handleStopRecording = (transcription) => {

        if (!transcription) {
            console.error('La transcripción es undefined o null');
            return; // Sal de la función si no hay transcripción
        }

        //const isCorrect = transcription.trim().toLowerCase() === exercise.respuesta.trim().toLowerCase();
        // VERIFICACION CON DISTANCIA DE LEVENSHTAIN(NO USADO)
         const distancia = levenshteinDistance(transcription.trim().toLowerCase(), 
                          exercise.respuesta.trim().toLowerCase());

        const answerLenght = exercise.respuesta.length * .7;
        
        const isCorrect = distancia <= answerLenght && distancia != null;
        console.log(distancia,'>?',answerLenght)

        if(isCorrect){
            onFinish(true); // Llama a la funcion del padre con el resultado de la verificacin
        } else if(atempts > 0){
            setAtempts(prev => prev - 1); //Restar un intento
            console.log('intentos restantes = ',atempts);
        } else if(atempts < 1){
            setTranscriptionResult('');
            onFinish(false);
        }
    };

    // Inicia la grabacion de audio del usuario
    const startRecording = () => {
        setIsRecording(true);
        recordedChunks.current = [];
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) recordedChunks.current.push(event.data);
            };
            mediaRecorderRef.current.start();
        });
    };

    // Detiene la grabación y envía el archivo al servidor para procesarlo
    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();

            mediaRecorderRef.current.onstop = async () => {
                setIsRecording(false);
                const audioBlob = new Blob(recordedChunks.current, { type: 'audio/wav' });
                const formData = new FormData();
                formData.append('audioFile', audioBlob);

                try{
                // Envía el audio al servidor para el análisis de Speech-to-Text
                const response = await fetch('http://localhost:3001/speech-to-text', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    console.error('Error en el procesamiento del audio');
                    return;
                }

                const data = await response.json();
                if (data.transcription) {
                    setTranscriptionResult(data.transcription);
                    handleStopRecording(data.transcription);
                } else {
                    console.error('No se recibió ninguna transcripción del servidor');
                    setTranscriptionResult(data.transcription = ('Try to speak louder!'))
                }
            } catch (error) {
                console.error('Error al intentar obtener la transcripción:', error);
            }
            };
        }
    };

       // Reinicia el audio y luego lo reproduce
    const playAudio = () => {
        audioRef.current.pause(); // Pausa el audio actual
        audioRef.current.currentTime = 0; // Reinicia el tiempo de reproducción
        audioRef.current.play(); // Reproduce el audio desde el inicio
    };

    const verificarRespuesta = () =>{
        if (!transcriptionResult.trim()) {
            return null; // Retornamos nulo si no hay respuesta
        }
            // Verificar si la transcripción es correcta
        const isCorrect = transcriptionResult.trim().toLowerCase() === exercise.respuesta.trim().toLowerCase();
        
        return isCorrect;
    }

    // Permite al componente padre controlar las funciones de grabación y verificación
    useImperativeHandle(ref, () => ({
        reset: () => setTranscriptionResult(''),
        verificarRespuesta
    }));

    return (
        <div className='container'>
            <p></p>
            <button onClick={playAudio}>
                <img className='pronunciation-play-button' src = {playButton}/>
            </button>
            <audio ref={audioRef} controls>
        <source src={exercise.audio} type="audio/mp3" />
            </audio>
            <p className='pronunciation-instruction'>↑ Play the audio, then hold the mic button and repeat ↓</p>
            <p className='pronunciation-instruction'>Attempts Left {atempts}</p>
            <button
                onMouseDown={() => startRecording()}
                onMouseUp={() => stopRecording()}
                // Soporte tactil
                onTouchStart={() => startRecording()}  
                onTouchEnd={() => stopRecording()}

                className='record-button'
            >
                <img
                    src={isRecording ? handImage : micImage}
                    alt='Record'
                    className='button-image'
                />
            </button>

            <div className='transcription-result'>
                <p>Transcription: {transcriptionResult}</p>
            </div>
        </div>
    );
});

export default Pronunciation;
