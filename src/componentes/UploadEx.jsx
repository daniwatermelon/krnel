import React, { useState, useContext } from 'react';
import imageCompression from 'browser-image-compression';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../firebasestuff/authContext';
import './UploadEx.css';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage  } from '../firebaseConfig';
import { collection, orderBy, limit, getDocs, query, setDoc,doc, where } from 'firebase/firestore';
import axios from 'axios';
import Swal from 'sweetalert2';
const UploadEx = () => {
    let empty = '';
    const location = useLocation();
    const navigate = useNavigate();
    const { newExercise } = location.state || {};
    const [image, setImage] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);  // Para manejar el mensaje de éxito
    const [loading, setLoading] = useState(false);  // Para manejar la animación de carga
    const { usernamePass } = useContext(AuthContext);


   

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
        setLoading(true);  
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
            setError("The complete text could not be constructed to verify.");
            setLoading(false);  

            return;
        }
    
        try {
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
                Swal.fire({
                    position: "center",
                    icon: "warning",
                    title: "Your exercise seems to have offensive text",
                    showConfirmButton: false,
                    timer: 1500
                  });   
                //setError("Your exercise seems to have offensive text, create another exercise..");
                setLoading(false);
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
                       // setError("The exercise image appears to contain inappropriate content.");
                        Swal.fire({
                            position: "center",
                            icon: "warning",
                            title: "Your exercise's image appears to contain inappropriate content",
                            showConfirmButton: false,
                            timer: 1500
                          });   
                          setLoading(false);

                        console.log('Imagen inapropiada');
                        return;
                    }
    
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
                            Swal.fire({
                                position: "center",
                                icon: "warning",
                                title: "Your exercise seems to have offensive text, be polite!",
                                showConfirmButton: false,
                                timer: 1500
                              });    
                              setLoading(false);

                     //       setError("Your image appears to have offensive text, change the image.");
                            console.log('Texto ofensivo extraído de la imagen');
                            return;
                        }
                    } else {
                        setError('Text could not be extracted from the image');
                        setLoading(false);  

                        return;
                    }
                } else {
                    setError('Unable to verify the image');
                    setLoading(false);  

                    return;
                }
            }
    
            setError(null);
            console.log('EJERCICIO SANO');
    
            // Referencia a la colección de Firestore
            const ejerciciosRef = collection(db, 'ejercicioscomunidad');
            const q = query(ejerciciosRef, orderBy('IDEjercicio', 'desc'), limit(1));
            
            const userRef = collection(db, 'usuario');
            const qe = query(userRef, where('username', '==', usernamePass));
            // Ejecutar la consulta
            const querySnapshot = await getDocs(q);
            const querySnapshotU = await getDocs(qe);

            let userID = '';
            querySnapshotU.forEach((doc) => {
                userID = doc.id;
            });
            // Obtener el documento con el IDEjercicio más alto
            let documentoConMaxIDEjercicio = null;
            querySnapshot.forEach((doc) => {
                documentoConMaxIDEjercicio = { id: doc.id, ...doc.data() };
            });
            let newID = 0;
            if (documentoConMaxIDEjercicio == null)
                {
                    newID == 1;
                }
                else{
             newID = documentoConMaxIDEjercicio.IDEjercicio + 1;
                }
            
            try {
                console.log(newExercise.id);
                let exerciseData = {
                    author: newExercise.author,
                    authorId: userID,
                    type: newExercise.type,
                    IDEjercicio: newID,
                    stars: 0,
                    likes: 0,
                    dislikes: 0,
                    totalAnswers: 0,
                    allCorrectAnswers: 0
                };
    
                if (image) {
                    try {
                        // Convertir la imagen a un Blob
                        const imageResponse = await fetch(image);
                        const blob = await imageResponse.blob();
    
                        // Configurar la referencia en Firebase Storage
                        const storageRef = ref(storage, `ejercicios/${newExercise.author}/${Date.now()}image${newID}.jpg`);
    
                        // Subir la imagen a Firebase Storage
                        await uploadBytes(storageRef, blob);
    
                        // Obtener la URL de descarga de la imagen
                        const downloadURL = await getDownloadURL(storageRef);
                        exerciseData.imageUrl = downloadURL; // Vincular la URL al objeto exerciseData
    
                        console.log("Imagen subida exitosamente:", downloadURL);
    
                    } catch (error) {
                        console.error("Error al subir la imagen:", error);
                        setError("There was a problem uploading the image.");
                        return;
                    }
                }
    
                // Agregar campos según el tipo de ejercicio
                switch (newExercise.type) {
                    case 'openQ':
                        exerciseData = {
                            ...exerciseData,
                            question: newExercise.question,
                            answers: newExercise.answers,
                            correctAnswerIndex: newExercise.correctAnswerIndex,
                        };
                        break;
                    case 'vocabulary':
                        exerciseData = {
                            ...exerciseData,
                            question: newExercise.question,
                            correctAnswer: newExercise.correctanswer,
                        };
                        break;
                    case 'reading':
                        exerciseData = {
                            ...exerciseData,
                            text: newExercise.text,
                            question: newExercise.question,
                            correctAnswer: newExercise.correctanswer,
                        };
                        break;
                    case 'completeS':
                        exerciseData = {
                            ...exerciseData,
                            text1: newExercise.text1,
                            text2: newExercise.text2,
                            correctAnswer: newExercise.correctanswer,
                        };
                        break;
                    default:
                        throw new Error("Type of exercise unknown");
                }
    
                // Guardar el ejercicio en Firestore
                const ejercicioDocRef = doc(ejerciciosRef, `${newID}`);
                await setDoc(ejercicioDocRef, exerciseData);
    
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Exercise created succesfully!",
                    showConfirmButton: false,
                    timer: 1500
                  });               
                   setLoading(false);  // Detener la animación de carga

                setTimeout(() => {
                    navigate('/dashboard',{state: {empty}});
                }, 1500);

            } catch (error) {
                console.error('Error al guardar el ejercicio:', error);
                Swal.fire({
                    position: "center",
                    icon: "error",
                    title: "An error happened during the uploading ",
                    showConfirmButton: false,
                    timer: 1500
                  });    
                setError('Error saving exercise in Firestore.');
                setLoading(false);  // Detener la animación de carga en caso de error

            }
    
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                position: "center",
                icon: "error",
                title: "An error happened during the uploading",
                showConfirmButton: false,
                timer: 1500
              });   
            setError(error.toString());
            setLoading(false);  

        }
    };
    
    
    



    const handleImageUpload = async (event) => {
        const file = event.target.files[0];

        if (file) {
            if (!file.type.startsWith("image/")) {
                Swal.fire({
                position: "center",
                icon: "error",
                title: "Please upload a valid image format",
                showConfirmButton: false,
                timer: 1500
              });               
                return;
            }
        
        if (file) {
            const maxSize = 1 * 1024 * 1024; 

            if (file.size > maxSize) {
                try {
                    const options = {
                        maxSizeMB: 1,
                        maxWidthOrHeight: 1024,
                        useWebWorker: true
                    };

                    const compressedFile = await imageCompression(file, options);
                    setImage(URL.createObjectURL(compressedFile));
                    console.log("SE COMPRIMIÓ LA IMAGEN");
                } catch (err) {
                    console.error("Error al comprimir la imagen:", err);
                    setError('Error compressing the image.');
                }
            } else {
                setImage(URL.createObjectURL(file));
                setError(null);
            }
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
                        <h3 style={{ color: "green" }}>Close question exercise</h3>
                        <p>Author: {newExercise.author}</p>
                        <p>Question: {newExercise.question}</p>
                        <p>Answers:</p>
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
                        <p>Correct answer index: {newExercise.correctAnswerIndex + 1}</p>
                    </div>
                );
                
            case 'completeS':
                return (
                    <div className='details-container'>
                        <h3 style={{ color: "red" }}>Sentence completion exercise</h3>
                        <p>Author: {newExercise.author}</p>
                        <p>Text 1: {newExercise.text1}</p>
                        <p style={{color:"green"}}>Answer: {newExercise.correctanswer}</p>
                        <p>Text 2: {newExercise.text2}</p>
                    </div>
                );
            case 'reading':
                return (
                    <div className='details-container'>
                        <h3 style={{ color: "orange" }}>Reading exercise</h3>
                        <p>Author: {newExercise.author}</p>
                        <p>Reading: {newExercise.text}</p>
                        <p>Question: {newExercise.question}</p>
                        <p style={{color:"green"}}>Answer: {newExercise.correctanswer}</p>
                    </div>
                );
            case 'vocabulary':
                return (
                    <div className='details-container'>
                        <h3 style={{ color: "blue" }}>Vocabulary exercise</h3>
                        <p>Author: {newExercise.author}</p>
                        <p>Question: {newExercise.question}</p>
                        <p style={{color:"green"}}>Answer: {newExercise.correctanswer}</p>
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
                    <h2 style={{ padding: "20px" }}>Details of exercise</h2>
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
            {success && <div className="success-message">{success}</div>}

            <button onClick={handleCheckExercise} className='check-upload-b'>Upload</button>
            <button className='upload-cancel' onClick={cancelCreate}>Cancel</button>
            {loading && <div className="loading-spinner">Loading...</div>}

            

        </div>
    );
};

export default UploadEx;
