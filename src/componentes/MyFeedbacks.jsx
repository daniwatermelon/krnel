import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../firebasestuff/authContext';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from "firebase/firestore";
import FeedbackList from './lists/FeedbackList';
import signOutUser from '../firebasestuff/auth_signout';
import './MyFeedbacks.css';

const MyFeedbacks = () => {
    const { usernamePass, userDocId } = useContext(AuthContext); // Datos de autenticación
    const [emptyExercises, setEmptyExercises] = useState(true);
    const [vocabularyExercises, setVocabularyExercises] = useState([]);
    const [readingExercises, setReadingExercises] = useState([]);
    const [openQExercises, setOpenQExercises] = useState([]);
    const [completeSExercises, setCompleteSExercises] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const loadExercises = async () => {
            try {
                const vocabulary = [];
                const reading = [];
                const openQ = [];
                const completeS = [];

                const communityRef = collection(db, 'ejercicioscomunidad');
                const q = query(communityRef);
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    console.log("No hay ejercicios de la comunidad");
                } else {
                    console.log("SI AGARRÓ LOS EJERCICIOS DE LA COMUNIDAD");
                    console.log("MY ID: ", userDocId);

                    for (const doc of querySnapshot.docs) {
                        const exerciseData = doc.data();
                        const feedbacksRef = collection(db, 'ejercicioscomunidad', doc.id, 'feedbacks');
                        const feedbacksQuery = query(feedbacksRef, where('authorID', '==', userDocId));
                        const feedbacksSnapshot = await getDocs(feedbacksQuery);

                        const feedbacks = [];
                        feedbacksSnapshot.forEach(feedbackDoc => {
                            feedbacks.push(feedbackDoc.data());
                        });

                        if (feedbacks.length > 0) {
                            setEmptyExercises(false);
                            const exerciseWithFeedbacks = {
                                ...exerciseData,
                                feedbacks: feedbacks
                            };

                            switch (exerciseData.type) {
                                case 'vocabulary':
                                    vocabulary.push(exerciseWithFeedbacks);
                                    break;
                                case 'reading':
                                    reading.push(exerciseWithFeedbacks);
                                    break;
                                case 'openQ':
                                    openQ.push(exerciseWithFeedbacks);
                                    break;
                                case 'completeS':
                                    completeS.push(exerciseWithFeedbacks);
                                    break;
                                default:
                                    break;
                            }
                        }
                    }

                    setVocabularyExercises(vocabulary);
                    setReadingExercises(reading);
                    setOpenQExercises(openQ);
                    setCompleteSExercises(completeS);
                }
            } catch (error) {
                console.log("Error al cargar las retroalimentaciones", error);
            } finally {
                setIsLoading(false); // La carga ha terminado
            }
        };

        loadExercises();
    }, [userDocId]);

    const goBack = () => {
        navigate(-1);
    };

    const handleSignOut = () => {
        signOutUser().then(() => {
            navigate('/');
        }).catch((error) => {
            console.error('An error happened during sign-out:', error);
        });
    };

    return (
        <div className="profile-page">
            <header className="header">
                <nav className="navbarmyfeedbacks">
                    <ul>
                        <li>
                            <img src="../icons/image.png" style={{ height: 30, marginTop: 10 }} alt="Logo" />
                        </li>
                    </ul>
                    <h1 className="username-pass">{usernamePass}</h1>
                </nav>
            </header>

            <div className="main-content">
                <div className="toolbarmyfeedbacks">
                    <img className="tab-buttons" src='../icons/return_icon.png' onClick={goBack} alt="Return" />
                    <div className="logout-button">
                        <img className="tab-buttons" src="../icons/logout_icon.png" onClick={handleSignOut} alt="Logout" />
                    </div>
                </div>
                <div className="ownexercises-container">
                    {isLoading ? (
                        <p className="loading-message">Loading feedbacks</p>
                    ) : (
                        emptyExercises ? (
                            <p className="no-exercises">You haven't done any feedback yet</p>
                        ) : (
                            <>
                                {vocabularyExercises.map(ejercicio => (
                                    <FeedbackList
                                        key={ejercicio.IDEjercicio}
                                        author={ejercicio.author}
                                        correctAnswer={ejercicio.correctAnswer}
                                        image={ejercicio.imageUrl}
                                        question={ejercicio.question}
                                        type="vocabulary"
                                        feedbacks={ejercicio.feedbacks}
                                        exerciseId={ejercicio.IDEjercicio ? String(ejercicio.IDEjercicio) : ""}
                                    />
                                ))}

                                {readingExercises.map(ejercicio => (
                                    <FeedbackList
                                        key={ejercicio.IDEjercicio}
                                        author={ejercicio.author}
                                        correctAnswer={ejercicio.correctAnswer}
                                        question={ejercicio.question}
                                        text={ejercicio.text}
                                        image={ejercicio.imageUrl}
                                        type="reading"
                                        feedbacks={ejercicio.feedbacks}
                                        exerciseId={ejercicio.IDEjercicio ? String(ejercicio.IDEjercicio) : ""}
                                    />
                                ))}

                                {openQExercises.map(ejercicio => (
                                    <FeedbackList
                                        key={ejercicio.IDEjercicio}
                                        author={ejercicio.author}
                                        question={ejercicio.question}
                                        answers={ejercicio.answers}
                                        image={ejercicio.imageUrl}
                                        type="openQ"
                                        feedbacks={ejercicio.feedbacks}
                                        exerciseId={ejercicio.IDEjercicio ? String(ejercicio.IDEjercicio) : ""}
                                    />
                                ))}

                                {completeSExercises.map(ejercicio => (
                                    <FeedbackList
                                        key={ejercicio.IDEjercicio}
                                        author={ejercicio.author}
                                        text1={ejercicio.text1}
                                        text2={ejercicio.text2}
                                        correctAnswer={ejercicio.correctAnswer}
                                        image={ejercicio.imageUrl}
                                        type="completeS"
                                        feedbacks={ejercicio.feedbacks}
                                        exerciseId={ejercicio.IDEjercicio ? String(ejercicio.IDEjercicio) : ""}
                                    />
                                ))}
                            </>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyFeedbacks;
