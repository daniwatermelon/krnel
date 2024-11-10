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
    const { usernamePass,userDocId } = useContext(AuthContext); //Se usa el contexto de Auth para pasar el nombre de usuario
    const [emptyExercises, setEmptyExercises] = useState(false);
    const [vocabularyExercises, setVocabularyExercises] = useState([]);
    const [readingExercises, setReadingExercises] = useState([]);
    const [openQExercises, setOpenQExercises] = useState([]);
    const [completeSExercises, setCompleteSExercises] = useState([]);

    const navigate = useNavigate(); //Se incluye todo de navegación
    
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
        
                const vocabExercises = [];
                const readExercises = [];
                const openQEx = [];
                const completeSEx = [];
        
                querySnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    const defaultImage = "../icons/default_image.png"; // Ruta de imagen por defecto
                    switch (data.exerciseType) {
                        case 'vocabulary':
                            vocabExercises.push({
                                IDEjercicio: doc.id, // Se usa doc.id para obtener el ID del documento
                                author: data.author,
                                imageUrl: data.imageUrl || defaultImage, // Asignar imagen por defecto si no existe
                                correctAnswer: data.correctAnswer,
                                userAnswer: data.userAnswer,
                                question: data.question,
                                type: data.exerciseType,
                            });
                            break;
                        case 'reading':
                            readExercises.push({
                                IDEjercicio: doc.id,
                                author: data.author,
                                imageUrl: data.imageUrl || defaultImage,
                                text: data.text,
                                question: data.question,
                                correctAnswer: data.correctAnswer,
                                userAnswer: data.userAnswer,
                                type: data.exerciseType,
                            });
                            break;
                        case 'openQ':
                            openQEx.push({
                                author: data.author,
                                imageUrl: data.imageUrl || defaultImage,
                                question: data.question,
                                answers: data.answers,
                                userAnswer: data.userAnswer,
                                type: data.exerciseType,

                            });
                            break;
                        case 'completeS':
                            completeSEx.push({
                                IDEjercicio: doc.id,
                                author: data.author,
                                imageUrl: data.imageUrl || defaultImage,
                                text1: data.text1,
                                text2: data.text2,
                                correctAnswer: data.correctAnswer,
                                userAnswer: data.userAnswer,
                                type: data.exerciseType,
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
                <h1 >Perfil</h1>
                <hr className='hr-profile'/>
                    <h3>Información de usuario</h3>
                    <div className="user-details">
                        <div>
                        {userData ? (
                <>
                
                  <p className="user-info-data">Nombre de usuario:   {userData.username}</p>
                  <p className="user-info-data">Correo:   {userData.email}</p>
                  <p className="user-info-data">Nivel:   {userData.nivel}</p>
                  <p className="user-info-data">Total de estrellas: {userData.stars} ⭐</p>

                  
                </>
              ) : (
                <p>No user data found.</p>
              )}
              
                        </div>
                    </div>
                    
                    <div className="user-stats">
                        
                        <p>Gramática: 0%</p>
                        <p>Vocabulario: 0%</p>
                        <p>Comprensión lectora: 0%</p>
                        <p>Comprensión auditiva: 0%</p>
                        <p>Pronunciación: 0%</p>
                    </div>
                    <hr className='hr-profile'/>

                    <div className="user-exercises">
                        <h3>Ejercicios contestados por mí:</h3>
                        <ul className='scrolled-exercises-profile'>
                        

                        <li>
                        <div className="answeredex-container">
                    {emptyExercises ? (
                        <p className="no-exercises">Todavía no has contestado algún ejercicio, ¡anímate a contestar!</p>
                    ) : (
                        <>
                            {vocabularyExercises.map(ejercicio => (
                                <AnsweredEx
                                    key={ejercicio.IDEjercicio}
                                    author={ejercicio.author}
                                    correctAnswer={ejercicio.correctAnswer}
                                    image={ejercicio.imageUrl}
                                    userAnswer={ejercicio.userAnswer}
                                    question={ejercicio.question}                                  
                                    type="vocabulary"
                                />
                            ))}

                            {readingExercises.map(ejercicio => (
                                <AnsweredEx
                                    key={ejercicio.IDEjercicio}
                                    author={ejercicio.author}
                                    correctAnswer={ejercicio.correctAnswer}
                                    userAnswer={ejercicio.userAnswer}

                                    question={ejercicio.question}
                                    image={ejercicio.imageUrl}
                                    type="reading"
                                />
                            ))}

                            {openQExercises.map(ejercicio => (
                                <AnsweredEx
                                    key={ejercicio.IDEjercicio}
                                    author={ejercicio.author}
                                    question={ejercicio.question}
                                    answers={ejercicio.answers}  // Verifica que este valor sea un array
                                    userAnswer={ejercicio.userAnswer}
                                    image={ejercicio.imageUrl}
                                    type="openQ"
                                />
                            ))}

                            {completeSExercises.map(ejercicio => (
                                <AnsweredEx
                                    key={ejercicio.IDEjercicio}
                                    author={ejercicio.author}
                                    text1={ejercicio.text1}
                                    text2={ejercicio.text2}
                                    userAnswer={ejercicio.userAnswer}

                                    correctAnswer={ejercicio.correctAnswer}
                                    image={ejercicio.imageUrl}
                                    type="completeS"
                                />
                            ))}
                        </>
                    )}
                </div>
                        </li>

                            
                        </ul>
                    </div>
                    
                    <div className="user-buttonsprofile">
                        <button onClick={handleMyExercises} className="user-buttonprofile">Mis ejercicios</button>
                        <button onClick={handleMyFeedbacks}className="user-buttonprofile">Mis retroalimentaciones</button>
                    </div>
                </div>
            </div>
        </div>

</body>


    );
};

export default Profile;
