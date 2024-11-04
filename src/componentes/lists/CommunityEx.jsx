import React, { useState, useEffect, useContext } from 'react';
import './CommunityEx.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../firebasestuff/authContext';
import { collection, doc, getDocs, addDoc, query, where, updateDoc, increment, getDoc} from 'firebase/firestore';
import { db } from '../../firebaseConfig.js';

const CommunityEx = (props) => {
  const [selectedRating, setSelectedRating] = useState(""); // Estado para la calificación
  const { onButtonClick } = props; // Asegurarte de que onButtonClick esté en las props
  const navigate = useNavigate();
  const { usernamePass, userDocId } = useContext(AuthContext); // Obtener el ID del documento de usuario desde el contexto de autenticación
  const [hasAnswered, setHasAnswered] = useState(false); // Estado para verificar si ya contestó
  const [existingDocId, setExistingDocId] = useState(null); // Para guardar el ID del documento si ya contestó
  const [hasRated, setHasRated] = useState(false); // Verificar si ya ha calificado
  const [hasLiked, setHasLiked] = useState(false); // Verificar si ya dio like
  const [hasDisliked, setHasDisliked] = useState(false); // Verificar si ya dio dislike
  const [hasFeedBack, setHasFeedBack] = useState(false);
  const [newFeedBack, setNewFeedBack] = useState('');
  const [feedbacks, setFeedbacks] = useState([]); // Estado para almacenar feedbacks
  const [showFeedbackDiv, setShowFeedbackDiv] = useState(true); // Estado para controlar la visibilidad del div de retroalimentaciones

  const getFeedbacks = async () => {
    try {
      const exerciseDocRef = doc(db, 'ejercicioscomunidad', props.id);
      const feedbacksCollectionRef = collection(exerciseDocRef, 'feedbacks');
      const feedbackSnapshot = await getDocs(feedbacksCollectionRef);

      const feedbackList = feedbackSnapshot.docs.map((doc) => doc.data());
      setFeedbacks(feedbackList); // Guardamos los feedbacks en el estado
    } catch (error) {
      console.error('Error al obtener las retroalimentaciones:', error);
    }
  };

  const toggleFeedbackVisibility = () => {
    setShowFeedbackDiv(prevState => !prevState); // Alternar el estado
  };

  useEffect(() => {
    const checkIfAnswered = async () => {
      try {
        const userDocRef = doc(db, 'usuario', userDocId);
        const communityCollectionRef = collection(userDocRef, "community");
  
        const q = query(communityCollectionRef, where("IDEjercicio", "==", props.id));
        const querySnapshot = await getDocs(q);
        console.log(querySnapshot.docs.length);

        let hasCorrectAnswer = false;
        querySnapshot.forEach(doc => {
          const docData = doc.data();
          
          // Verificar si hay al menos una respuesta correcta
          if (docData.isCorrect === true) {
            hasCorrectAnswer = true;
            console.log("hay respuesta correcta");
            setHasAnswered(true); // Marcar como respondido si hay una respuesta correcta
            setExistingDocId(doc.id); // Guardar el ID del documento con respuesta correcta
  
            if (docData.starsRated) {
              setSelectedRating(docData.starsRated); // Establecer la calificación que ya dio
              setHasRated(true); // Marcar que ya ha calificado
            }
  
            if (docData.isLiked) {
              setHasLiked(true);
            }
  
            if (docData.isDisliked) {
              setHasDisliked(true);
            }
  
            return; // Salir del bucle en cuanto se encuentra una respuesta correcta
          }
        });
  
        // Si no se encontró ninguna respuesta correcta
        if (!hasCorrectAnswer) {
          setHasAnswered(false);
        }
        
      } catch (error) {
        console.error("Error al verificar si el ejercicio ha sido contestado:", error);
      }
    };
  
    checkIfAnswered();
  }, [props.id, userDocId]);
  
  useEffect(() => {
    const checkUserFeedback = async () => {
      try {
        // Referencia al documento del ejercicio
        const exerciseDocRef = doc(db, 'ejercicioscomunidad', props.id);
  
        // Referencia a la subcolección "feedbacks"
        const feedbacksCollectionRef = collection(exerciseDocRef, 'feedbacks');
  
        // Crear la consulta para verificar si el usuario ya tiene retroalimentación
        const q = query(feedbacksCollectionRef, where("authorID", "==", userDocId));
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          // Si encuentra un documento, significa que el usuario ya envió retroalimentación
          setHasFeedBack(true); // Marcar que ya existe una retroalimentación
        }
      } catch (error) {
        console.error("Error al verificar si el usuario ya envió retroalimentación:", error);
      }
    };
  
    if (hasAnswered) {
      checkUserFeedback(); // Solo ejecutar si el usuario ya ha contestado el ejercicio
    }
  }, [props.id, userDocId, hasAnswered]); 

  useEffect(() => {
    if (hasAnswered) {
      getFeedbacks();
    }
  }, [hasAnswered]);

  const sendRatingToDB = async () => {
    try {
      if (existingDocId) {
        const userDocRef = doc(db, 'usuario', userDocId);
        const communityCollectionRef = collection(userDocRef, "community");
        const existingDocRef = doc(communityCollectionRef, existingDocId);
  
        // Actualizamos el campo de la calificación después de haber contestado
        await updateDoc(existingDocRef, {
          starsRated: parseInt(selectedRating,10),  // Aquí actualizamos la calificación
        });
        console.log("Calificación guardada con éxito:", selectedRating);
        setHasRated(true); // Marcar como calificado y hacer desaparecer el botón
      } else {
        console.error("Error: No se encontró el documento del usuario.");
      }
    } catch (error) {
      console.error("Error al guardar la calificación:", error);
    }
  };

  const updateExerciseLikes = async (exerciseDocId, incrementValue) => {
    try {
      const exerciseDocRef = doc(db, 'ejercicioscomunidad', exerciseDocId);
      await updateDoc(exerciseDocRef, {
        likes: incrementValue ? increment(1) : increment(-1),
      });
      console.log("Like actualizado en el documento del ejercicio.");
    } catch (error) {
      console.error("Error al actualizar los likes:", error);
    }
  };
  
  // Función para actualizar los dislikes en el documento del ejercicio
  const updateExerciseDislikes = async (exerciseDocId, incrementValue) => {
    try {
      const exerciseDocRef = doc(db, 'ejercicioscomunidad', exerciseDocId);
      await updateDoc(exerciseDocRef, {
        dislikes: incrementValue ? increment(1) : increment(-1),
      });
      console.log("Dislike actualizado en el documento del ejercicio.");
    } catch (error) {
      console.error("Error al actualizar los dislikes:", error);
    }
  };

  const sendLikeToDB = async () => {
    try {
      if (existingDocId) {
        const userDocRef = doc(db, 'usuario', userDocId);
        const communityCollectionRef = collection(userDocRef, "community");
        const existingDocRef = doc(communityCollectionRef, existingDocId);
  
        await updateDoc(existingDocRef, {
          isLiked: true,
          isDisliked: false 
        });
  
        console.log("Like guardado y dislike eliminado.");
      }
    } catch (error) {
      console.error("Error al guardar el like:", error);
    }
  };

  const sendDislikeToDB = async () => {
    try {
      if (existingDocId) {
        const userDocRef = doc(db, 'usuario', userDocId);
        const communityCollectionRef = collection(userDocRef, "community");
        const existingDocRef = doc(communityCollectionRef, existingDocId);
  
        // Actualizamos para marcar que se ha dado dislike y quitar el like si existía
        await updateDoc(existingDocRef, {
          isLiked: false, // Se desactiva el like si estaba activo
          isDisliked: true
        });
  
        console.log("Dislike guardado y like eliminado.");
      }
    } catch (error) {
      console.error("Error al guardar el dislike:", error);
    }
  };

  const handleLike = () => {
    if (hasAnswered && !hasLiked) {
      sendLikeToDB(); // Enviar el like a la BD
      updateExerciseLikes(props.id,true)
      setHasLiked(true); // Marcar que ya ha dado like
      setHasDisliked(false); // Desactivar dislike
    }
  };

  const handleDislike = () => {
    if (hasAnswered && !hasDisliked) {
      sendDislikeToDB(); 
      updateExerciseDislikes(props.id,true)
      setHasDisliked(true); 
      setHasLiked(false); 
    }
  };


  
  const handleRatingChange = (e) => {
    const rating = e.target.value;
    setSelectedRating(rating); // Actualizamos la calificación seleccionada
    console.log("Selected rating:", rating);
  };

  const handleSubmitRating = () => {
    sendRatingToDB(); // Enviar la calificación a la base de datos cuando se hace clic en el botón
  };

  const handleFeedback = async () => {
    if (!newFeedBack.trim()) {
      console.error("La retroalimentación no puede estar vacía.");
      return;
    }

    try {
      const exerciseDocRef = doc(db, 'ejercicioscomunidad', props.id);
      const exerciseDocSnap = await getDoc(exerciseDocRef);

      if (!exerciseDocSnap.exists()) {
        console.error("El documento del ejercicio no existe.");
        return;
      }

      let feedbackCount = exerciseDocSnap.data().feedbackCount || 0;
      feedbackCount += 1;
      const newFeedbackId = `${props.id}-feedback${feedbackCount}`;

      const newFeedbackDoc = {
        author: usernamePass,
        authorID: userDocId,
        date: new Date(),
        content: newFeedBack.trim(),
        id: newFeedbackId,
      };

      const feedbacksCollectionRef = collection(exerciseDocRef, 'feedbacks');
      await addDoc(feedbacksCollectionRef, newFeedbackDoc);
      await updateDoc(exerciseDocRef, { feedbackCount });

      setHasFeedBack(true);
      setNewFeedBack('');
      getFeedbacks(); // Actualizar la lista de feedbacks
    } catch (error) {
      console.error("Error al enviar la retroalimentación:", error);
    }
  };
  

  

  const handleNavigate = async () => {

      navigate('/answer-community', {
        state: {
          IDEjercicio: props.id,
          type: props.type,
          author: props.author,
          image: props.image,
          question: props.question,
          text: props.text,
          answers: props.answers,
          correctAnswerIndex: props.correctAnswerIndex,
          text1: props.text1,
          text2: props.text2,
          correctAnswer: props.correctAnswer,
          stars: props.stars
        }
      });
    
  };

  

  const getLikeIcon = () => {
    return hasLiked ? '.././icons/like_icon2.png' : '.././icons/like_icon.png';
  };
  
  // Obtener la imagen del dislike según si ha sido dado o no
  const getDislikeIcon = () => {
    return hasDisliked ? '.././icons/dislike_icon2.png' : '.././icons/dislike_icon.png';
  };
  
  // Obtener el ícono de las estrellas según la calificación
  const getStarIcon = () => {
    if (selectedRating === "") {
      return ".././icons/star_icon.png"; // Ícono de estrella vacía (sin color)
    }
    return ".././icons/star_icon2.png"; // Ícono de estrella coloreada
  };


  const renderExerciseContent = () => {
    switch (props.type) {
      case 'vocabulary':
        return (<>
         <p>Tipo: Vocabulario</p>
        <p>Pregunta: {props.question}</p>;
        </>)
       
      case 'reading':
        return (
          <>            
            <p>Tipo: Lectura</p>
            <p className='readingtext'>Texto de Lectura: {props.text}</p>
            <p>Pregunta: {props.question}</p>
          </>
        );
      case 'openQ':
        return (
          <>
            <p>Tipo: Pregunta cerrada</p>
            <p>Pregunta: {props.question}</p>
            <ul>
              {props.answers.map((answer, index) => (
                <li
                  key={index}
                  
                >
                  {answer}
                </li>
              ))}
            </ul>
          </>
        );
      case 'completeS':
        return (
          <>
            <p>Tipo: Completar Oraciones</p>
            <p>Texto 1: {props.text1}</p>
            <p>Texto 2: {props.text2}</p>
          </>
        );
      default:
        return <p>Tipo de ejercicio no soportado.</p>;
    }
  };

  return (
  <div className="own-exercise">
    <p>Autor: {props.author}</p>

    {/* Renderiza el contenido del ejercicio */}
    {renderExerciseContent()}

    {/* Imagen del ejercicio si no es la imagen por defecto */}
    {props.image !== "../icons/default_image.png" && (
      <img src={props.image} alt="Exercise" />
    )}

    <div className="interaction-div-dashboard">
      {/* Selector de dificultad (calificación) */}
      <div className="difficulty-select">
        <select
          className="star-select"
          value={selectedRating}
          onChange={handleRatingChange} // Maneja el cambio de calificación
          disabled={!hasAnswered || hasRated} // Solo habilitado si ya ha contestado y no ha calificado
        >
          <option value="" disabled>Calificar</option>
          <option value="1">1 Estrella</option>
          <option value="2">2 Estrellas</option>
          <option value="3">3 Estrellas</option>
          <option value="4">4 Estrellas</option>
          <option value="5">5 Estrellas</option>
        </select>
        <img className="star-icon" src={getStarIcon()} alt="Star icon" />
      </div>

      {/* Botón para enviar calificación */}
      {!hasRated && selectedRating && (
        <button
          onClick={handleSubmitRating}
          className="submit-rating-button"
        >
          Enviar calificación
        </button>
      )}

      <p>{props.stars}</p>

      {/* Botón para dar like */}
      <button
        onClick={handleLike}
        className="likebutton"
        disabled={!hasAnswered || hasLiked || hasDisliked} // Desactiva si ya ha dado like o dislike
      >
        <img className='like-icon' src={getLikeIcon()} alt="Like" />
      </button>
      <p>{props.likes}</p>

      {/* Botón para dar dislike */}
      <button
        onClick={handleDislike}
        className="dislikebutton"
        disabled={!hasAnswered || hasDisliked || hasLiked} // Desactiva si ya ha dado dislike o like
      >
        <img className='dislike-icon' src={getDislikeIcon()} alt="Dislike" />
      </button>
      <p>{props.dislikes}</p>

      {/* Botón para navegar y contestar */}
      <button
        onClick={handleNavigate}
        hidden={hasAnswered}
        className='enter-exercise-b'
      >
        Contestar
      </button>
    </div>

    {/* Botón para alternar la visibilidad de la retroalimentación */}
    <button hidden={!hasAnswered}onClick={toggleFeedbackVisibility} className="toggle-feedback-b">
      {showFeedbackDiv ? 'Ocultar retroalimentaciones' : 'Mostrar retroalimentaciones'}
    </button>

    {/* Contenedor de retroalimentaciones */}
    {showFeedbackDiv && (
      <div className="feedbacks-container">
        <div hidden={!hasAnswered} className="scroll-feedbacks">
          {feedbacks.length > 0 ? (
            feedbacks.map((feedback, index) => (
              <div key={index} className="feedback-item">
                <p><strong>{feedback.author}:</strong> {feedback.content}</p>
              </div>
            ))
          ) : (
            <p>No hay retroalimentaciones todavía.</p>
          )}
        </div>

        {/* Input para agregar nueva retroalimentación */}
        <div className='hor-div-com'>
          <input
            placeholder='Escribe aquí tu retroalimentación'
            className='feedback-input'
            type='text'
            disabled={!hasAnswered} // Solo habilitado si ya ha contestado
            hidden={!hasAnswered || hasFeedBack}
            value={newFeedBack}
            onChange={(e) => setNewFeedBack(e.target.value)}
            maxLength={100}
          />
          <p hidden={!hasAnswered || hasFeedBack}>
            {newFeedBack.length}/100
          </p>

          {/* Botón para enviar retroalimentación */}
          <button
            onClick={handleFeedback}
            hidden={!hasAnswered || hasFeedBack}
            className='send-feedback-b'
          >
            <img className="send-feedback-icon" src=".././icons/send_icon.png" alt="Send icon"/>
          </button>
        </div>
      </div>
    )}
  </div>
);

};

export default CommunityEx;
