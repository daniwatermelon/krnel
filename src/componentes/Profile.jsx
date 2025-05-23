// Dashboard.jsx
import React, { useRef,useContext, useEffect, useState } from 'react';
import signOutUser from '../firebasestuff/auth_signout';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, query, where, getDocs } from "firebase/firestore";
import './Profile.css'
import { AuthContext, } from '../firebasestuff/authContext';
import { getDataFromCollections } from '../firebasestuff/userDataQueries';
import { db } from '../firebaseConfig';
import AnsweredEx from './lists/AnsweredEx';

const Profile = () => {
    const { state } = useLocation();
    const {empty} = '';
    const { users: userData } = state.profiledata;
    const { usernamePass,userDocId } = useContext(AuthContext);
    const [emptyExercises, setEmptyExercises] = useState(false);
    const [allExercises, setAllExercises] = useState([]); // Un solo array para todos los ejercicios

    const navigate = useNavigate();
    const [percentAud, setPercentAud] = useState('');
    const [percentRead, setPercentRead] = useState('');
    const [percentGrammar, setPercentGrammar] = useState('');
    const [percentPron, setPercentPron] = useState('');
    const [percentVoc, setPercentVoc] = useState('');

    useEffect(() => {
        const loadAnsweredIdsCounts = async () => {
            try {
                const exercisesRef = collection(db, `usuario/${userDocId}/answered`);
                const querySnapshot = await getDocs(exercisesRef);

                // Definir objetivos de longitud para cada categoría
                const targetLengths = {
                    comprensionauditiva: 20,
                    comprensionlectora: 20,
                    gramatica: 120,
                    pronunciacion: 20,
                    vocabulario: 60,
                };

                // Recorrer documentos y calcular el porcentaje completado
                querySnapshot.docs.forEach(docSnap => {
                    const docId = docSnap.id;
                    const data = docSnap.data();
                    const answeredIdsLength = Array.isArray(data.answeredIds) ? data.answeredIds.length : 0;

                    if (targetLengths[docId] !== undefined) {
                        const totalTarget = targetLengths[docId];
                        const completionPercent = Math.min((answeredIdsLength / totalTarget) * 100, 100).toFixed(2);

                        // Actualizar el estado correspondiente al porcentaje de cada categoría
                        switch (docId) {
                            case 'comprensionauditiva':
                                setPercentAud(completionPercent);
                                break;
                            case 'comprensionlectora':
                                setPercentRead(completionPercent);
                                break;
                            case 'gramatica':
                                setPercentGrammar(completionPercent);
                                break;
                            case 'pronunciacion':
                                setPercentPron(completionPercent);
                                break;
                            case 'vocabulario':
                                setPercentVoc(completionPercent);
                                break;
                            default:
                                break;
                        }

                        console.log(`Porcentaje de ${docId}: ${completionPercent}% completado`);
                    }
                });
            } catch (error) {
                console.error("Error al consultar los documentos:", error);
            }
        };

        loadAnsweredIdsCounts();
    }, [userDocId]);

    useEffect(() => {
        const loadExercises = async () => {
            try {
                const communityRef = collection(db, `usuario/${userDocId}/community`);
                const q = query(communityRef, where("isCorrect", "==", true));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    setEmptyExercises(true);
                    return;
                }

                const exercises = [];
                const defaultImage = "../icons/default_image.png";

                querySnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    exercises.push({
                        IDEjercicio: doc.id,
                        author: data.author,
                        imageUrl: data.imageUrl || defaultImage,
                        correctAnswer: data.correctAnswer,
                        userAnswer: data.userAnswer,
                        question: data.question,
                        text: data.text,
                        text1: data.text1,
                        text2: data.text2,
                        answers: data.answers,
                        type: data.exerciseType,
                    });
                });
                
                exercises.sort((a, b) => b.IDEjercicio.localeCompare(a.IDEjercicio));

                setAllExercises(exercises);
            } catch (error) {
                console.log("Error al cargar los ejercicios", error);
            }
        };

        loadExercises();
    }, [userDocId]);
    

    
    const goBack = () => {
        navigate('/dashboard',{state: {empty}});
    }

const handleMyExercises = async() => {
        try {
            const exercisesdata = await getDataFromCollections(userDocId);
            navigate('/myexercises', { state: { exercisesdata } });
          } catch (error) {
            console.error('Error fetching user data:', error);
          }

    }

    const handleMyFeedbacks = async() => {
        try {
            const feedbacksdata = await getDataFromCollections(userDocId);
            navigate('/myfeedbacks', { state: { feedbacksdata } });
          } catch (error) {
            console.error('Error fetching user data:', error);
          }

    }


    const handleSignOut = () => {
        signOutUser().then(() => { //Esta función ejecuta SignOutUser
            navigate('/'); //Y lo regresa a la pestaña principal
        }).catch((error) => {
            console.error('An error happened during sign-out:', error); //Si por alguna razón no puede salirse, se ejecuta este error en la consola
        });
    };

   

    return (
        <body>
            
            <div className="profile-page">
            <header className="header">
                <nav className="navbarprofile">
                    <ul>
                        <li>
                            <img src="../icons/image.png" style={{ height: 30, marginTop: 10 }} alt="Logo" />
                        </li>
                    </ul>
                    <h1  className="username-pass">{usernamePass}</h1>
                </nav>
            </header>
            <div className="main-content">
                <div className="toolbarprofile">
                    <img className="tab-buttons" src='../icons/return_icon.png' onClick={goBack} alt="Return"/>
                    <div className="logout-button">
                        <img className="tab-buttons" src="../icons/logout_icon.png" onClick={handleSignOut} alt="Logout" />
                    </div>
                </div>
                
                <div className="user-infoprofile">
                <h1 >Profile</h1>
                <hr className='hr-profile'/>
                    <h3>User info</h3>
                    <div className="user-details">
                        <div>
                        {userData ? (
                <>
                
                  <p className="user-info-data">Username:   {userData.username}</p>
                  <p className="user-info-data">Email:   {userData.email}</p>
                  <p className="user-info-data">Level:   {userData.nivel}</p>
                  <p className="user-info-data">Stars obtained: {userData.stars} ⭐</p>

                  
                </>
              ) : (
                <p>No user data found.</p>
              )}
              
                        </div>
                    </div>
                    
                    <div className="user-stats">
                        <strong>Default exercises completion:</strong>
                        <p>Grammar: {percentGrammar}%</p>
                        <p>Vocabulary: {percentVoc}%</p>
                        <p>Reading: {percentRead}%</p>
                        <p>Listening: {percentAud}%</p>
                        <p>Pronunciation: {percentPron}%</p>
                    </div>
                    <hr className='hr-profile'/>

                    <div className="user-exercises">
                        <h3>Exercises I have answered:</h3>
                        <ul className='scrolled-exercises-profile'>
                        

                        <li>
                        <div className="answeredex-container">
                        {emptyExercises ? (
                                    <p className="no-exercises">
                                        You haven't answered any exercise yet, go ahead and answer!
                                    </p>
                                ) : (
                                    allExercises.map(ejercicio => (
                                        <AnsweredEx
                                            key={ejercicio.IDEjercicio}
                                            author={ejercicio.author}
                                            correctAnswer={ejercicio.correctAnswer}
                                            userAnswer={ejercicio.userAnswer}
                                            question={ejercicio.question}
                                            text={ejercicio.text}
                                            text1={ejercicio.text1}
                                            text2={ejercicio.text2}
                                            image={ejercicio.imageUrl}
                                            type={ejercicio.type}
                                        />
                                    ))
                                )}
                </div>
                        </li>

                            
                        </ul>
                    </div>
                    
                    <div className="user-buttonsprofile">
                        <button onClick={handleMyExercises} className="user-buttonprofile">My exercises</button>
                        <button onClick={handleMyFeedbacks}className="user-buttonprofile">My feedbacks</button>
                    </div>
                </div>
            </div>
        </div>

</body>


    );
};

export default Profile;