import React, { useState, useContext } from 'react';
import './AnswerCommunity.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../firebasestuff/authContext';
import { levenshteinDistance } from '../levenshtein.js';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, getDoc, increment } from "firebase/firestore";
import { db } from '../firebaseConfig.js';

const AnswerCommunity = () => {
  const { usernamePass, userDocId, setUsernamePass } = useContext(AuthContext);
  const location = useLocation();
  const {IDEjercicio,type, author, image, question, text, answers, correctAnswerIndex, text1, text2, correctAnswer, stars } = location.state;
  const [openAnswer, setOpenAnswer] = useState(''); 
  const [selectedAnswer, setSelectedAnswer] = useState(null); 
  const [completeAnswer, setCompleteAnswer] = useState('');
  const [error, setError] = useState({ message: '', color: '' });
  const [clickAnswerButton, setClickAnswerButton] = useState(false);
  const navigate = useNavigate();

  const goBack = () => {
    navigate('/dashboard', { state: { empty: true } });
  };

  const handleSignOut = () => {
    signOutUser()
      .then(() => {
        navigate('/');
      })
      .catch((error) => {
        console.error('An error happened during sign-out:', error);
      });
  };

  const submitAnswer = async () => {
    try {
        const todayDate = new Date().toISOString().split('T')[0];

        const docRef = doc(db, "usuario", userDocId, 'config', 'remindDoc'); // Reemplaza "usuarios" y "tuDocumentoId" con los valores correspondientes

        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const { dates, answers } = docSnap.data();
            const todayIndex = dates.indexOf(todayDate);

            if (todayIndex !== -1) {
                console.log("La posición del día actual en el array es:", todayIndex);
                answers[todayIndex] = true; 
                await updateDoc(docRef, { answers });
                console.log("Estado de respuesta actualizado en Firestore.");
            } else {
                console.log("La fecha de hoy no se encuentra en el array de fechas.");
            }
        } else {
            console.log("El documento no existe.");
        }
    } catch (error) {
        console.error("Error al consultar o actualizar el documento:", error);
    }
};

  const verifyExercise = async () => {
    let isCorrect = false;
  
    switch (type) {
      case 'vocabulary':
        if (openAnswer.trim() === '') {
          setError({ message: 'Por favor, introduce una respuesta.', color: 'red' });
          return;
        }
        isCorrect = levenshteinDistance(openAnswer, correctAnswer) <= 2;
        break;
  
      case 'reading':
        if (openAnswer.trim() === '') {
          setError({ message: 'Por favor, introduce una respuesta.', color: 'red' });
          return;
        }
        isCorrect = levenshteinDistance(openAnswer.trim().toLowerCase(), correctAnswer.trim().toLowerCase()) <= 2;
        break;
  
      case 'openQ':
        if (selectedAnswer === null) {
          setError({ message: 'Por favor, selecciona una respuesta.', color: 'red' });
          return;
        }
        isCorrect = selectedAnswer === correctAnswerIndex;
        break;
  
      case 'completeS':
        if (completeAnswer.trim() === '') {
          setError({ message: 'Por favor, completa la oración.', color: 'red' });
          return;
        }
        isCorrect = levenshteinDistance(completeAnswer, correctAnswer) <= 2;
        break;
  
      default:
        setError({ message: 'Tipo de ejercicio desconocido.', color: 'red' });
        return;
    }
  
   
  
    try {

      const userDocRef = doc(db, 'usuario', userDocId);
      const communityCollectionRef = collection(userDocRef, "community");
      console.log("idejercicio", IDEjercicio);
      const exerciseDocRef = doc(db, 'ejercicioscomunidad', IDEjercicio);

      const newResponse = {
        question: question || 'Pregunta no disponible',
        isCorrect: isCorrect,
        exerciseType: type,
        date: new Date(),
        IDEjercicio: IDEjercicio || 'ID no disponible',
        author: author,
        imageUrl: image,
        text1: text1 || null,
        text2: text2 || null,
        text: text || null,
        answers: answers || null,
        correctAnswer : correctAnswer || 'Respuesta no disponible',
      };
  
      if (isCorrect) {
        setError({ message: '¡Respuesta correcta!', color: 'green' });
        newResponse.userAnswer = openAnswer || completeAnswer || selectedAnswer;
      
        try {
          const userDocRef = doc(db, 'usuario', userDocId);
      
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const currentStars = userDoc.data().stars || 0;
      
            const updatedStars = currentStars + stars;
            await updateDoc(userDocRef, { stars: updatedStars });
            console.log('Estrellas sumadas');
          } else {
            console.log('No se encontró el usuario');
          }
        } catch (error) {
          console.log('No se pudieron agregar las estrellas:', error);
        }
      } else {
        setError({ message: 'Respuesta incorrecta, vuelve a intentarlo.', color: 'red' });
      }

       // Actualizar los contadores en el documento del ejercicio
       await updateDoc(exerciseDocRef, {
        totalAnswers: increment(1),
        allCorrectAnswers: isCorrect ? increment(1) : increment(0)
    });
          // Guardar la respuesta en la subcolección "community" del usuario
      await addDoc(communityCollectionRef, newResponse);
      console.log("Respuesta guardada correctamente en Firestore.");

     
  
    } catch (error) {
      console.error("Error al guardar la respuesta en Firestore:", error);
    }
    submitAnswer();
    setClickAnswerButton(true);
  };
  

  

  // Renderización de los diferentes tipos de ejercicios
  const renderComEx = () => {
    switch (type) {
      case 'vocabulary':
        return (
          <div className='v-exercise'>
            <div className='hor-ex'>
              <p className='author-text'>{author}</p>
              <img className='exicon' src='../icons/vocabulary_icon.png' alt="icon" />
            </div>
            <div className='hor-ex'>
              <h1>{question}</h1>
              {image !== "../icons/default_image.png" && (
                <img className='image-answer-com' src={image} alt="exercise" />
              )}
            </div>
            <input
              className='answer-voc'
              type='text'
              maxLength={50}
              placeholder='Escribe aquí tu respuesta'
              onChange={(e) => setOpenAnswer(e.target.value)}
            />
            <button hidden={clickAnswerButton} className='upload-answer-com' onClick={verifyExercise}>Contestar</button>
            <p style={{ color: error.color }}>{error.message}</p>
            </div>
        );
      case 'reading':
        return (
          <div className='r-exercise'>
            <div className='hor-ex'>
              <p className='author-text'>{author}</p>
              <img className='exicon' src='../icons/reading_icon.png' alt="icon" />
            </div>
            <div className='hor-ex'>
              <div>
                <h1>{question}</h1>
                <p className='reading-text'>{text}</p>
              </div>
              {image !== "../icons/default_image.png" && (
                <img className='image-answer-com' src={image} alt="exercise" />
              )}
            </div>
            <input
              className='answer-voc'
              type='text'
              maxLength={50}
              placeholder='Escribe aquí tu respuesta'
              onChange={(e) => setOpenAnswer(e.target.value)}
            />
            <button hidden={clickAnswerButton} className='upload-answer-com' onClick={verifyExercise}>Contestar</button>
            <p style={{ color: error.color }}>{error.message}</p>

          </div>
        );
      case 'openQ':
        const letters = ['a)', 'b)', 'c)', 'd)']; // Letras para los incisos
        return (
          <div className='oq-exercise'>
            <div className='hor-ex'>
              <p className='author-text'>{author}</p>
              <img className='exicon' src='../icons/options_icon.png' alt="icon" />
            </div>
            <div className='hor-ex'>
              <div>
                <h1>{question}</h1>
                <ul style={{ listStyleType: 'none', padding: 0 }}> {/* Sin viñetas */}
                  {answers.map((answer, index) => (
                    <li key={index}>
                      <label>
                        <input
                          type="radio"
                          name="answer"
                          value={index}
                          checked={selectedAnswer === index}
                          onChange={() => setSelectedAnswer(index)}
                        />
                        <span>{letters[index]} {answer}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
              {image !== "../icons/default_image.png" && (
                <img className='image-answer-com' src={image} alt="exercise" />
              )}
            </div>
            <button hidden={clickAnswerButton} className='upload-answer-com' onClick={verifyExercise}>Contestar</button>
            <p style={{ color: error.color }}>{error.message}</p>

          </div>
        );
      case 'completeS':
        return (
          <div className='c-exercise'>
            <div className='hor-ex'>
              <p className='author-text'>{author}</p>
              <img className='exicon' src='../icons/completeT_icon.png' alt="icon" />
            </div>
            <div className='hor-ex'>
              <div>
                <p>{text1}</p>
                <input
                  className='answer-comS'
                  maxLength={50}
                  placeholder='Escribe el texto que falta'
                  onChange={(e) => setCompleteAnswer(e.target.value)}
                />
                <p>{text2}</p>
              </div>
              {image !== "../icons/default_image.png" && (
                <img className='image-answer-com' src={image} alt="exercise" />
              )}
            </div>
            <button hidden={clickAnswerButton} className='upload-answer-com' onClick={verifyExercise}>Contestar</button>
            <p style={{ color: error.color }}>{error.message}</p>

          </div>
        );
      default:
        return <p>No se ha seleccionado un ejercicio.</p>;
    }
  };

  return (
    <div className="profile-page">
      <header className="header">
        <nav className="navbaranswercom">
          <ul>
            <li>
              <img src="../icons/image.png" style={{ height: 30, marginTop: 10 }} alt="Logo" />
            </li>
          </ul>
          <h1 className="username-pass">{usernamePass}</h1>
        </nav>
      </header>
      <div className="main-content">
        <div className="toolbaranswercom">
          <img className="tab-buttons" src='../icons/return_icon.png' onClick={goBack} alt="Return" />
          <div className="logout-button">
            <img className="tab-buttons" src='../icons/logout_icon.png' onClick={handleSignOut} alt="Logout" />
          </div>
        </div>
      </div>
      {renderComEx()} 
    </div>
  );
};

export default AnswerCommunity;
