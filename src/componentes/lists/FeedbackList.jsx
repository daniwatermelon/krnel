import React from 'react';
import { collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import './FeedbackList.css';
import Swal from 'sweetalert2';

const FeedbackList = (props) => {



    const deleteFeedback = async (customId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You cannot undo this",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#950b7c',
            cancelButtonColor: '#b10e4f',
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'Nevermind, cancel'
        });
          if (result.isConfirmed) {
        try {
            const feedbacksRef = collection(db, 'ejercicioscomunidad', props.exerciseId, 'feedbacks');
            const q = query(feedbacksRef, where("id", "==", customId));
            const querySnapshot = await getDocs(q);
    
            querySnapshot.forEach(async (docSnapshot) => {
                await deleteDoc(docSnapshot.ref);
                console.log("Retroalimentación eliminada exitosamente");

            });
            Swal.fire('Eliminado', 'La retroalimentación se eliminó correctamente.', 'success');

        } catch (error) {
            console.log("Error al eliminar la retroalimentación:", error);
            Swal.fire('Error', 'No se pudo eliminar la retroalimentación.', 'error');

        }
    }
    };
    

    const renderFeedbacks = () => {
        switch (props.type) {
            case "vocabulary":
                return (
                    <>
                        <p>{props.question}</p>
                        <p>{props.correctAnswer}</p>
                    </>
                );
            case "reading":
                return (
                    <>
                        <p>{props.question}</p>
                        <p>{props.correctAnswer}</p>
                    </>
                );
            case "openQ":
                return (
                    <>
                        <p>{props.question}</p>
                        {props.answers.map((element, index) => (
                            <p key={index}>-{element}</p>
                        ))}
                    </>
                );
            case "completeS":
                return (
                    <>
                        <p>{props.text1}</p>
                        <p>{props.correctAnswer}</p>
                        <p>{props.text2}</p>
                    </>
                );
            default:
                return null;
        }
    };

    // Renderizamos los feedbacks del ejercicio
    const renderFeedbackList = () => {
        if (props.feedbacks && props.feedbacks.length > 0) {
            return props.feedbacks.map((feedback, index) => (
                <div key={index} className='feedback-item'>
                    <p><strong>{feedback.author}:</strong> {feedback.content}</p>
                    <button onClick={() => deleteFeedback(feedback.id)} className='delete-feedback'>Delete feedback</button>
                </div>
            ));
        } else {
            return <p>There are no feedbacks to show</p>;
        }
    };

    return (
        <div className='feedbackL-container'>
            <p>{props.author}</p>
            {props.image !== "../icons/default_image.png" && (
                <img className='answerdiv-image' src={props.image} alt="Ejercicio" />
            )}
            {renderFeedbacks()}
            
            <div className="feedbacks-container">
                {renderFeedbackList()}
            </div>

        </div>
    );
}

export default FeedbackList;
