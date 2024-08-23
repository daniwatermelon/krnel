import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { useNavigate, useLocation } from 'react-router-dom';
import './UploadEx.css';
import axios from 'axios';
import { renderToStaticMarkup } from 'react-dom/server';

const UploadEx = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { newExercise } = location.state || {};
    const [image, setImage] = useState(null);
    const [error, setError] = useState(null);


   

    if (!newExercise) {
        navigate(-1);
        return null;
    }

    const goBack = () => {
        navigate(-1);
    };

    const cancelCreate = () => {
        navigate(-3);
    };

    

    const handleCheckExercise = async () => {
        let completeText = '';
    
        switch (newExercise.type) {
            case 'openQ':
                completeText = `${newExercise.question} ${newExercise.answers.join(' ')}`;
                break;
            case 'vocabulary':
                completeText = `${newExercise.correctanswer} ${newExercise.question}`;
                break;
            case 'reading':
                completeText = `${newExercise.text} ${newExercise.question} ${newExercise.correctanswer}`;
                break;
            case 'completeS':
                completeText = `${newExercise.text1} ${newExercise.text2} ${newExercise.correctanswer}`;
                break;
            default:
                break;
        }
    
        if (!completeText) {
            setError("No se pudo construir el texto completo para verificar.");
            return;
        }
    
        try {
            // Verifica el texto del ejercicio
            const response = await fetch(`https://api.api-ninjas.com/v1/profanityfilter?text=${completeText}`, {
                method: 'GET',
                headers: {
                    'X-Api-Key': 'VXW03XXUSANwZc1JwJKKAQ==gclLMikgvFHUa1rg',
                    'Content-Type': 'application/json',
                },
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const data = await response.json();
    
            if (data.has_profanity) {
                setError("Tu ejercicio parece tener texto ofensivo, crea otro ejercicio.");
                console.log('Ejercicio ofensivo por texto');
                return;
            }
    
            // Si hay una imagen, verifica si es explícita
            if (image) {
                const formData = new FormData();
                const imageResponse = await fetch(image);
                const blob = await imageResponse.blob();
                formData.append('imageFile', blob, 'uploaded-image.jpg');
    
                const imageCheckResponse = await axios.post('http://localhost:3001/check-image', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
    
                if (imageCheckResponse.status === 200) {
                    const { adult, medical, violence, racy } = imageCheckResponse.data;
    
                    // Verifica si alguno de los valores es "LIKELY" o peor
                    if ([adult, medical, violence, racy].some(value => ["LIKELY", "VERY_LIKELY"].includes(value))) {
                        setError("La imagen del ejercicio parece tener contenido inapropiado.");
                        console.log('Imagen inapropiada');
                        return;
                    }
    
                    // Extrae el texto de la imagen y verifica si contiene lenguaje ofensivo
                    const textExtractionResponse = await axios.post('http://localhost:3001/extract-text', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
    
                    if (textExtractionResponse.status === 200) {
                        let extractedText = textExtractionResponse.data.map(item => item.description).join(' ');
                        completeText += ` ${extractedText}`;
    
                        const profanityResponse = await fetch(`https://api.api-ninjas.com/v1/profanityfilter?text=${completeText}`, {
                            method: 'GET',
                            headers: {
                                'X-Api-Key': 'VXW03XXUSANwZc1JwJKKAQ==gclLMikgvFHUa1rg',
                                'Content-Type': 'application/json',
                            },
                        });
    
                        if (!profanityResponse.ok) {
                            throw new Error('Network response was not ok');
                        }
    
                        const profanityData = await profanityResponse.json();
    
                        if (profanityData.has_profanity) {
                            setError("Tu imagen parece tener texto ofensivo, cambia la imagen.");
                            console.log('Texto ofensivo extraído de la imagen');
                            return;
                        }
                    } else {
                        setError('No se pudo extraer el texto de la imagen');
                        return;
                    }
                } else {
                    setError('No se pudo checar la imagen');
                    return;
                }
            }
    
            // Si todo está bien
            setError(null);
            console.log('EJERCICIO SANO');
            // Aquí podrías proceder a la siguiente acción, como subir el ejercicio
    
        } catch (error) {
            console.error('Error:', error);
            setError(error.toString());
        }
    };
    



    const handleImageUpload = async (event) => {
        const file = event.target.files[0];

        if (file) {
            const maxSize = 1 * 1024 * 1024; // 1MB

            if (file.size > maxSize) {
                try {
                    const options = {
                        maxSizeMB: 1,
                        maxWidthOrHeight: 1024,
                        useWebWorker: true
                    };

                    const compressedFile = await imageCompression(file, options);
                    setImage(URL.createObjectURL(compressedFile));

                } catch (err) {
                    console.error("Error al comprimir la imagen:", err);
                    setError('Error al comprimir la imagen.');
                }
            } else {
                setImage(URL.createObjectURL(file));
                setError(null);
            }
        }
    };

    const triggerFileInput = () => {
        document.getElementById('fileInput').click();
    };

    const removeImage = () => {
        setImage(null);
    };

    const showExercise = () => {
        switch (newExercise.type) {
            case 'openQ':
                return (
                    <div className='details-container'>
                        <h3 style={{ color: "green" }}>Ejercicio de preguntas abiertas</h3>
                        <p>Autor: {newExercise.author}</p>
                        <p>Pregunta: {newExercise.question}</p>
                        <p>Respuestas:</p>
                        <ul>
                            {newExercise.answers.map((answer, index) => (
                                <li
                                    key={index}
                                    style={{ 
                                        color: index === newExercise.correctAnswerIndex ? 'green' : 'black',
                                        fontWeight: index === newExercise.correctAnswerIndex ? 'bold' : 'normal'
                                    }}
                                >
                                    {answer}
                                </li>
                            ))}
                        </ul>
                        <p>Índice de respuesta correcta: {newExercise.correctAnswerIndex + 1}</p>
                    </div>
                );
                
            case 'completeS':
                return (
                    <div className='details-container'>
                        <h3 style={{ color: "red" }}>Ejercicio de completar oraciones</h3>
                        <p>Autor: {newExercise.author}</p>
                        <p>Texto 1: {newExercise.text1}</p>
                        <p style={{color:"green"}}>Respuesta: {newExercise.correctanswer}</p>
                        <p>Texto 2: {newExercise.text2}</p>
                    </div>
                );
            case 'reading':
                return (
                    <div className='details-container'>
                        <h3 style={{ color: "orange" }}>Ejercicio de comprensión lectora</h3>
                        <p>Autor: {newExercise.author}</p>
                        <p>Lectura: {newExercise.text}</p>
                        <p>Pregunta: {newExercise.question}</p>
                        <p style={{color:"green"}}>Respuesta: {newExercise.correctanswer}</p>
                    </div>
                );
            case 'vocabulary':
                return (
                    <div className='details-container'>
                        <h3 style={{ color: "blue" }}>Ejercicio de vocabulario</h3>
                        <p>Autor: {newExercise.author}</p>
                        <p>Pregunta: {newExercise.question}</p>
                        <p style={{color:"green"}}>Respuesta: {newExercise.correctanswer}</p>
                    </div>
                );
            default:
                navigate(-3);
                break;
        }
   };

    return (
        <div className="profile-page">
            <header className="header">
                <nav className="navbarcreate">
                    <ul>
                        <li>
                            <img src="../icons/image.png" style={{ height: 30, marginTop: 10 }} alt="Logo" />
                        </li>
                    </ul>
                    <h1 className="username-pass">{newExercise.author}</h1>
                </nav>
            </header>
            <div className="main-content">
                <div className="toolbarcreate">
                    <img className="tab-buttons" src='../icons/return_icon.png' onClick={goBack} alt="Return" />
                    <div className="logout-button">
                        <img className="tab-buttons" src="../icons/logout_icon.png" alt="Logout" />
                    </div>
                </div>
                <div className='upload-div'>
                    <h2 style={{ padding: "20px" }}>Detalles del Ejercicio</h2>
                    <div className='upload-details-div'>
                        {showExercise()}
                    </div>
                </div>
                <div className='image-div'>
                    {!image && (
                        <div className='buttondiv'>
                            <img className="image-icon" src='../icons/imagedownload_icon.png' style={{ opacity: "50%" }} onClick={triggerFileInput} alt="Upload" />
                        </div>
                    )}
                    {image && (
                        <div className='uploaded-image'>
                            <img className="image-submitted" src={image} alt="Uploaded" style={{ maxWidth: "500px", maxHeight: "300px" }} />
                            <button className="remove-image-btn" onClick={removeImage}/>
                        </div>
                    )}
                    <input
                        type="file"
                        id="fileInput"
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                        accept="image/*"
                    />
                </div>

            </div>
            {error && <p className="error" style={{marginLeft:"20px"}}>{error}</p>}

            <button onClick={handleCheckExercise} className='check-upload-b'>Subir</button>
            <button className='upload-cancel' onClick={cancelCreate}>Cancelar</button>
            

        </div>
    );
};

export default UploadEx;
