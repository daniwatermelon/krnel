import React, { useState } from 'react';
import './DefaultExercisesAdmin.css';
import ModalExercisesD from '../modal/ModalExercisesD';
import { collection, doc, getDocs, addDoc, query, where, updateDoc, increment, getDoc, deleteDoc} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
const DefaultExercisesAdmin = (props) => {
    const [hasDeleted, setHasDeleted] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Función para eliminar un ejercicio
    const deleteExercise = async (exerciseId, path) => {
        try {
            const exerciseRef = doc(db, path, exerciseId);
            await deleteDoc(exerciseRef);
            console.log(`Ejercicio con ID ${exerciseId} eliminado`);
            //Para actualizar la lista de ejercicio
            if (props.fetchAllExercisesForAdmin) {
                props.fetchAllExercisesForAdmin();
            }
            setHasDeleted(true); 
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error eliminando el ejercicio:", error);
        }
    };

    return (
        <div className="own-exercise">
            <p>ID: {props.id}</p>
            <p>Tipo de ejercicio: {props.type}</p>
            {hasDeleted === false && (
                <button className='enter-exercise-b' onClick={() => setIsModalOpen(true)}>Eliminar</button>
            )}

            {isModalOpen && (
                <ModalExercisesD
                    isOpen={isModalOpen}
                    closeModal={() => setIsModalOpen(false)}
                    title="Confirmar eliminación"
                    content={
                        <div>
                            <p>¿Estás seguro de que quieres eliminar este ejercicio?</p>
                            <button className='modal-ex-button' onClick={() => deleteExercise(props.id, props.path)}>
                                Sí, eliminar
                            </button>
                            <button className='modal-ex-button-c' onClick={() => setIsModalOpen(false)}>
                                Cancelar
                            </button>
                        </div>
                    }
                />
            )}
        </div>
    );
};

export default DefaultExercisesAdmin;
