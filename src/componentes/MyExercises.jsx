import React, { useContext, useState, useEffect } from 'react';
import signOutUser from '../firebasestuff/auth_signout';
import { useNavigate } from 'react-router-dom';
import './MyExercises.css';
import { AuthContext } from '../firebasestuff/authContext';
import OwnExercises from './lists/OwnExercises';
import { db } from '../firebaseConfig.js';
import { collection, query, where, getDocs } from "firebase/firestore";

const MyExercises = () => {
    const { usernamePass } = useContext(AuthContext);
    const navigate = useNavigate();
    const [vocabularyExercises, setVocabularyExercises] = useState([]);
    const [readingExercises, setReadingExercises] = useState([]);
    const [openQExercises, setOpenQExercises] = useState([]);
    const [completeSExercises, setCompleteSExercises] = useState([]);
    const [emptyExercises, setEmptyExercises] = useState(false);
    useEffect(() => {
        const loadExercises = async () => {
            try {
               

                const userRef = collection(db, 'usuario');
                const qe = query(userRef, where('username', '==', usernamePass));
                const querySnapshotU = await getDocs(qe);
                let userID = '';
            querySnapshotU.forEach((doc) => {
                userID = doc.id;
            });

            const usersRef = collection(db, 'ejercicioscomunidad');
            const q = query(usersRef, where('authorId', '==', userID));
            const querySnapshot = await getDocs(q);
            if(querySnapshot.empty)
            {
                setEmptyExercises(true);
            }
                const vocabExercises = [];
                const readExercises = [];
                const openQEx = [];
                const completeSEx = [];

                querySnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    const defaultImage = "../icons/default_image.png"; // Ruta de imagen por defecto
                    switch (data.type) {
                        case 'vocabulary':
                            vocabExercises.push({
                                IDEjercicio: doc.IDEjercicio,
                                author: data.author,
                                imageUrl: data.imageUrl || defaultImage, // Asignar imagen por defecto si no existe
                                correctAnswer: data.correctAnswer,
                                question: data.question,
                                type: data.type,
                                stars: data.stars,
                                likes: data.likes
                            });
                            break;
                        case 'reading':
                            readExercises.push({
                                IDEjercicio: doc.IDEjercicio,
                                author: data.author,
                                imageUrl: data.imageUrl || defaultImage, // Asignar imagen por defecto si no existe
                                text: data.text,
                                question: data.question,
                                correctAnswer: data.correctAnswer,
                                type: data.type,
                                stars: data.stars,
                                likes: data.likes
                            });
                            break;
                            case 'openQ':
                                openQEx.push({
                                    IDEjercicio: doc.IDEjercicio,
                                    author: data.author,
                                    imageUrl: data.imageUrl || defaultImage, // Asignar imagen por defecto si no existe
                                    question: data.question,
                                    answers: data.answers, // Array de respuestas
                                    correctAnswerIndex: data.correctAnswerIndex, // Índice de la respuesta correcta
                                    stars: data.stars,
                                    likes: data.likes
                                });
                                break;
                        case 'completeS':
                            completeSEx.push({
                                IDEjercicio: doc.IDEjercicio,
                                author: data.author,
                                imageUrl: data.imageUrl || defaultImage, // Asignar imagen por defecto si no existe
                                text1: data.text1,
                                text2: data.text2,
                                correctAnswer: data.correctAnswer,
                                type: data.type,
                                stars: data.stars,
                                likes: data.likes
                            });
                            break;
                        default:
                            break;
                    }
                });

                setVocabularyExercises(vocabExercises);
                setReadingExercises(readExercises);
                setOpenQExercises(openQEx);
                setCompleteSExercises(completeSEx);
            } catch (error) {
                console.log("Error al cargar los ejercicios", error);
            }
        };

        loadExercises();
    }, [usernamePass]);

    const goBack = () => {
        navigate(-1);
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

    return (
        <div className="profile-page">
            <header className="header">
                <nav className="navbarmyexercises">
                    <ul>
                        <li>
                            <img src="../icons/image.png" style={{ height: 30, marginTop: 10 }} alt="Logo" />
                        </li>
                    </ul>
                    <h1 className="username-pass">{usernamePass}</h1>
                </nav>
            </header>

            <div className="main-content">
                <div className="toolbarmyexercises">
                    <img className="tab-buttons" src='../icons/return_icon.png' onClick={goBack} alt="Return" />
                    <div className="logout-button">
                        <img className="tab-buttons" src="../icons/logout_icon.png" onClick={handleSignOut} alt="Logout" />
                    </div>
                </div>

                <div className="ownexercises-container">
                    {emptyExercises ? (
                        <p className="no-exercises">Todavía no has realizado ningún ejercicio, ¡te invitamos a que crees uno de forma gratuita!</p>
                    ) : (
                        <>
                            {vocabularyExercises.map(ejercicio => (
                                <OwnExercises
                                    key={ejercicio.IDEjercicio}
                                    author={ejercicio.author}
                                    correctAnswer={ejercicio.correctAnswer}
                                    image={ejercicio.imageUrl}
                                    likes={ejercicio.likes}
                                    question={ejercicio.question}
                                    stars={ejercicio.stars}
                                    type="vocabulary"
                                />
                            ))}

                            {readingExercises.map(ejercicio => (
                                <OwnExercises
                                    key={ejercicio.IDEjercicio}
                                    author={ejercicio.author}
                                    correctAnswer={ejercicio.correctAnswer}
                                    question={ejercicio.question}
                                    text={ejercicio.text}
                                    image={ejercicio.imageUrl}
                                    stars={ejercicio.stars}
                                    likes={ejercicio.likes}
                                    type="reading"
                                />
                            ))}

                            {openQExercises.map(ejercicio => (
                                <OwnExercises
                                    key={ejercicio.IDEjercicio}
                                    author={ejercicio.author}
                                    question={ejercicio.question}
                                    answers={ejercicio.answers}
                                    image={ejercicio.imageUrl}
                                    stars={ejercicio.stars}
                                    likes={ejercicio.likes}
                                    type="openQ"
                                />
                            ))}

                            {completeSExercises.map(ejercicio => (
                                <OwnExercises
                                    key={ejercicio.IDEjercicio}
                                    author={ejercicio.author}
                                    text1={ejercicio.text1}
                                    text2={ejercicio.text2}
                                    correctAnswer={ejercicio.correctAnswer}
                                    image={ejercicio.imageUrl}
                                    stars={ejercicio.stars}
                                    likes={ejercicio.likes}
                                    type="completeS"
                                />
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyExercises;
