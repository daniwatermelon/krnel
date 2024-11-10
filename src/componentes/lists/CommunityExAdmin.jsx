import React, { useState, useEffect, useContext } from 'react';
import './CommunityEx.css';
import { collection, doc, getDocs, addDoc, query, where, updateDoc, increment, getDoc, deleteDoc, writeBatch} from 'firebase/firestore';
import { db } from '../../firebaseConfig.js';
import './CommunityExAdmin.css'
import ModalExercises from '../modal/ModalExercisesD.jsx';
const CommunityExAdmin = (props) => {
  const [hasRated, setHasRated] = useState(false);
  const [hasDeleted, setHasDeleted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const deleteCommunityExercise = async () => {
    try {
        // Elimina el documento principal de "ejercicioscomunidad"
        const communityRef = doc(db, "ejercicioscomunidad", String(props.id));
        await deleteDoc(communityRef);
        console.log("Se eliminó el ejercicio correctamente de 'ejercicioscomunidad'");

        // Obtener todos los documentos de la colección "usuario"
        const usersSnapshot = await getDocs(collection(db, "usuario"));
        const batch = writeBatch(db);
        const deletePromises = []; // Array para almacenar promesas de eliminaciones

        // Iterar sobre cada documento de usuario
        for (const userDoc of usersSnapshot.docs) {
            const userCommunityRef = collection(db, `usuario/${userDoc.id}/community`);
            const querySnapshot = await getDocs(query(userCommunityRef, where("IDEjercicio", "==", String(props.id))));
            console.log(String(props.id));

            // Agregar cada eliminación de respuesta al array de promesas
            querySnapshot.forEach((responseDoc) => {
                const responseRef = doc(db, `usuario/${userDoc.id}/community/${responseDoc.id}`);
                deletePromises.push(batch.delete(responseRef));
            });
        }

        // Esperar a que todas las promesas de eliminación se completen
        await Promise.all(deletePromises);
        await batch.commit(); // Ejecutar las eliminaciones en batch

        console.log("Se eliminaron todas las respuestas de los usuarios relacionadas con el ejercicio");

        setIsModalOpen(false); // Cerrar el modal después de la eliminación
        setHasDeleted(true);

    } catch (error) {
        console.error("Error al eliminar el ejercicio y las respuestas:", error);
    }
};



const setCommunityRating = async () => {
    try {
        const communityRef = doc(db, "ejercicioscomunidad", props.id);
        console.log(props.id);
        
            await updateDoc(communityRef, {
                stars: props.stars, // Actualizar la calificación

            });
            console.log("Se actualizaron las estrellas correctamente");
            setHasRated(true);
        }
     catch (error) {
        console.error("Error al actualizar la calificación:", error);
    }
};

  const renderExerciseContent = () => {
    switch (props.type) {
      case 'vocabulary':
        return (
        <>
         <p>Tipo: Vocabulario</p>
        <p>Pregunta: {props.question}</p>;
        </>
        )
       
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

    {renderExerciseContent()}

    {props.image !== "../icons/default_image.png" && (
      <img src={props.image} alt="Exercise" />
    )}

    <div className="interaction-div-dashboard">
    <img className="star-admin" src='.././icons/star_icon2.png'alt="Star icon" />
    <p>{props.stars}</p>
    <img className='like-admin' src='.././icons/like_icon2.png' alt="Like" />
    <p>{props.likes}</p>
    <img className='dislike-admin' src='.././icons/dislike_icon2.png' alt="Dislike" />
     <p>{props.dislikes}</p>
     {props.rated === true && hasRated === false && (
      <button className='enter-exercise-b' onClick={setCommunityRating}>Confirmar</button>
    )}
    {props.delete === true && hasDeleted === false && (
      <button className='enter-exercise-b' onClick={() => setIsModalOpen(true)}>Eliminar</button>
    )}
    {hasDeleted == true &&(
      <p>El ejercicio se ha eliminado </p>
    )}
    {hasRated == true &&(
      <p>Se han actualizado las estrellas</p>
    )}

{isModalOpen && (
                <ModalExercises
                    isOpen={isModalOpen}
                    closeModal={() => setIsModalOpen(false)}
                    title="Confirmar eliminación"
                    content={
                        <div>
                            <p>¿Estás seguro de que quieres eliminar este ejercicio?</p>
                            <button  className='modal-ex-button'onClick={deleteCommunityExercise}>Sí, eliminar</button>
                            <button className='modal-ex-button-c' onClick={() => setIsModalOpen(false)}>Cancelar</button>
                        </div>
                    }
                />
            )}
    </div>
  </div>
);

};

export default CommunityExAdmin;
