// Dashboard.jsx
import React, {useContext, useState } from 'react';
import signOutUser from '../firebasestuff/auth_signout';
import { useNavigate, useLocation } from 'react-router-dom';
import './Flashcards.css'
import { AuthContext } from '../firebasestuff/authContext';
import Flashcard from './lists/Flashcard';
import { db } from '../firebaseConfig.js';
import { collection, query, where, getDocs } from "firebase/firestore";

const Flashcards = () => {
    const { state } = useLocation();
    const {empty} = '';
    const { users: userData } = state.flashcardsdata;
    const { usernamePass } = useContext(AuthContext); //Se usa el contexto de Auth para pasar el nombre de usuario
    const navigate = useNavigate(); //Se incluye todo de navegación

    // useEffect(() => {
    //     const loadFlashcards = async () => {
    //         try {
    //             const usersRef = collection(db, 'usuario');
    //             const q = query(usersRef, where('username', '==', usernamePass));
    //             const querySnapshot = await getDocs(q);

    //             const userDocRef = querySnapshot.docs[0].ref;
    //             const configDocRef = collection(userDocRef, "flashcards");
                
    //             const vocabExercises = [];
    //             const readExercises = [];
    //             const openQEx = [];
    //             const completeSEx = [];

    //             querySnapshot.docs.forEach(doc => {
    //                 const data = doc.data();
    //                 const defaultImage = "../icons/default_image.png"; // Ruta de imagen por defecto
    //                 switch (data.type) {
    //                     case 'vocabulary':
    //                         vocabExercises.push({
    //                             IDEjercicio: doc.IDEjercicio,
    //                             author: data.author,
    //                             imageUrl: data.imageUrl || defaultImage, // Asignar imagen por defecto si no existe
    //                             correctAnswer: data.correctAnswer,
    //                             question: data.question,
    //                             type: data.type,
    //                             stars: data.stars,
    //                             likes: data.likes
    //                         });
    //                         break;
    //                     case 'reading':
    //                         readExercises.push({
    //                             IDEjercicio: doc.IDEjercicio,
    //                             author: data.author,
    //                             imageUrl: data.imageUrl || defaultImage, // Asignar imagen por defecto si no existe
    //                             text: data.text,
    //                             question: data.question,
    //                             correctAnswer: data.correctAnswer,
    //                             type: data.type,
    //                             stars: data.stars,
    //                             likes: data.likes
    //                         });
    //                         break;
    //                         case 'openQ':
    //                             openQEx.push({
    //                                 IDEjercicio: doc.IDEjercicio,
    //                                 author: data.author,
    //                                 imageUrl: data.imageUrl || defaultImage, // Asignar imagen por defecto si no existe
    //                                 question: data.question,
    //                                 answers: data.answers, // Array de respuestas
    //                                 correctAnswerIndex: data.correctAnswerIndex, // Índice de la respuesta correcta
    //                                 stars: data.stars,
    //                                 likes: data.likes
    //                             });
    //                             break;
    //                     case 'completeS':
    //                         completeSEx.push({
    //                             IDEjercicio: doc.IDEjercicio,
    //                             author: data.author,
    //                             imageUrl: data.imageUrl || defaultImage, // Asignar imagen por defecto si no existe
    //                             text1: data.text1,
    //                             text2: data.text2,
    //                             correctAnswer: data.correctAnswer,
    //                             type: data.type,
    //                             stars: data.stars,
    //                             likes: data.likes
    //                         });
    //                         break;
    //                     default:
    //                         break;
    //                 }
    //             });

    //             setVocabularyExercises(vocabExercises);
    //             setReadingExercises(readExercises);
    //             setOpenQExercises(openQEx);
    //             setCompleteSExercises(completeSEx);
    //         } catch (error) {
    //             console.log("Error al cargar los ejercicios", error);
    //         }
    //     };

    //     loadFlashcards();
    // },[usernamePass]);
    
    const goBack = () => {
        navigate('/dashboard',{state: {empty}});
    }

    const handleSignOut = () => {
        signOutUser().then(() => { //Esta función ejecuta SignOutUser
            navigate('/'); //Y lo regresa a la pestaña principal
        }).catch((error) => {
            console.error('An error happened during sign-out:', error); //Si por alguna razón no puede salirse, se ejecuta este error en la consola
        });
    };

    const handleDeleteFlashcard = () => {

    };

   

    return (
        <body>
            
            <div className="profile-page">
            <header className="header">
                <nav className="navbarflashcards">
                    <ul>
                        <li>
                            <img src="../icons/image.png" style={{ height: 30, marginTop: 10 }} alt="Logo" />
                        </li>
                    </ul>
                    <h1  className="username-pass">{usernamePass}</h1>
                </nav>
                
            </header>

            <div className='filter-flashcards'>

                <select className='filter-select'>
                <option value="date" defaultValue={true}>Fecha</option>
                <option value="category" >Categoría</option>
                </select>
            </div>
            <div className="main-content">
                
                <div className="toolbarflashcards">
                    <img className="tab-buttons" src='../icons/return_icon.png' onClick={goBack} alt="Return"/>
                    <div className="logout-button">
                        <img className="tab-buttons" src="../icons/logout_icon.png" onClick={handleSignOut} alt="Logout" />
                    </div>
                </div>
                
                <div className="flashcard-container">

                    
                </div>

            </div>
        </div>

</body>


    );
};

export default Flashcards;
