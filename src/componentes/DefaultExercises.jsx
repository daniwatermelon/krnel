// Dashboard.jsx
import React, { useRef,useContext,useState, useEffect } from 'react';
import { collection, query, where, getDocs } from "firebase/firestore"; 
import { db } from '../firebaseConfig.js';
import signOutUser from '../firebasestuff/auth_signout';
import { useNavigate, useLocation } from 'react-router-dom';
import './DefaultExercises.css'
import { AuthContext } from '../firebasestuff/authContext';
import Modal from './modal/Modal';


const DefaultExercises = () => {
    
    const { state } = useLocation();
    const {empty} = '';
    const { users: userData } = state.defaultextdata;
    const { usernamePass, userDocId } = useContext(AuthContext); //Se usa el contexto de Auth para pasar el nombre de usuario
    const navigate = useNavigate(); //Se incluye todo de navegación
    const [selectedExercise, setSelectedExercise] = useState('gramatica');
   
    //recomendaciones
    const [lowestCategory, setLowestCategory] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [titleDashboard, setTitleDashboard] = useState('');
    const [contentDashboard, setContentDashboard] = useState('');

    const [percentAud, setPercentAud] = useState('');
    const [percentRead, setPercentRead] = useState('');
    const [percentGrammar, setPercentGrammar] = useState('');
    const [percentPron, setPercentPron] = useState('');
    const [percentVoc, setPercentVoc] = useState('');

    const [completedExercises, setCompletedExercises] = useState({
        comprensionauditiva: false,
        comprensionlectora: false,
        gramatica: false,
        pronunciacion: false,
        vocabulario: false,
    });

    const goBack = () => {
        navigate('/dashboard',{state: {empty}});
    }

    const handleSignOut = () => {
        signOutUser().then(() => { //Esta funcion ejecuta SignOutUser
            navigate('/'); //Y lo regresa a la pestaña principal
        }).catch((error) => {
            console.error('Ha ocurrido un error en la verificacion de LogOut:', error); //Si por alguna razón no puede salirse, se ejecuta este error en la consola
        });
    };

    const handlePracticeExercises = async(e) => {
        e.preventDefault();
        navigate('queue-default', {state: {selectedExercise}});
        console.log(selectedExercise);

    };

    useEffect(() => {
        const calculateLowest = async () => {
            try {
                const exercisesRef = collection(db, `usuario/${userDocId}/answered`);
                const querySnapshot = await getDocs(exercisesRef);
    
                const targetLengths = {
                    comprensionauditiva: 10,
                    comprensionlectora: 10,
                    gramatica: 60,
                    pronunciacion: 10,
                    vocabulario: 40,
                };

            // Contadores para cada tipo de ejercicio
            const exerciseCount = {
                comprensionauditiva: 0,
                comprensionlectora: 0,
                gramatica: 0,
                pronunciacion: 0,
                vocabulario: 0,
            };

                let lowestCategory = { category: '', percentage: 100 };
    
                querySnapshot.docs.forEach(docSnap => {
                    const docId = docSnap.id;
                    const data = docSnap.data();
                    const answeredIdsLength = Array.isArray(data.answeredIds) ? data.answeredIds.length : 0;
                    
                    const normalizedDocId = docId.replace('-', ''); // Eliminar guiones
                    console.log(`[calculateLowest] Procesando categoría: ${normalizedDocId}, Respuestas contestadas: ${answeredIdsLength}`);

                    if (targetLengths[normalizedDocId] !== undefined) {
                        const totalTarget = targetLengths[normalizedDocId];
                        const completionPercent = (answeredIdsLength / totalTarget) * 100;
    
                        console.log(`[calculateLowest] Porcentaje de completitud para ${normalizedDocId}: ${completionPercent}%`);
                        
                        if (answeredIdsLength > 0) {
                            exerciseCount[normalizedDocId] += answeredIdsLength;
                        }

                        if (completionPercent < lowestCategory.percentage) {
                            lowestCategory = { category: normalizedDocId, percentage: completionPercent };
                            console.log("[calculateLowest] Actualizando categoría más baja:", lowestCategory);
                        }
    
                        switch (normalizedDocId) {
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
                    }
                });

                console.log("Ejercicios completados por tipo:", exerciseCount);
                let traductionCategory = ('')

                switch(lowestCategory.category){
                    case 'gramatica':
                        traductionCategory = 'Grammar';
                        break;
                    case 'comprensionauditiva':
                        traductionCategory = 'Listening';
                        break;
                    case 'comprensionlectora':
                        traductionCategory = 'Reading';
                        break;
                    case 'pronunciacion':
                        traductionCategory = 'Pronunciation';
                        break;
                    case 'vocabulario':
                        traductionCategory = 'Vocabulary';
                        break;
                    }

                    if(lowestCategory.percentage !== 100)
                    {
                    setLowestCategory(lowestCategory);
                    console.log("lowestCategory después del delay:", lowestCategory);
                    
                        setIsModalOpen(true);
                        setTitleDashboard('We recomend you to practice more this category!');
                        setContentDashboard(traductionCategory);
                        console.log("lowestCategory:", lowestCategory);
               
                }
                    /*const Toast = Swal.mixin({
                        toast: true,
                        position: "top-end",
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                        didOpen: (toast) => {
                          toast.onmouseenter = Swal.stopTimer;
                          toast.onmouseleave = Swal.resumeTimer;
                        }
                      });
                      Toast.fire({
                        icon: "success",
                        title: "Signed in successfully"
                      });*/
                    
            } catch (error) {
                console.error("Error al consultar los documentos:", error);
            }
        };
    
        if (userDocId) {
            calculateLowest(); // Llama a la función cuando el userDocId esté disponible
        }
    }, [userDocId]);  // Dependencia en userDocId

    useEffect(() => {
        const calculateCompletedExercises = async () => {
            try {
                console.log('entrando a calcular completados')
                const exercisesRef = collection(db, `usuario/${userDocId}/answered`);
                const querySnapshot = await getDocs(exercisesRef);

                const targetLengths = {
                    comprensionauditiva: 10,
                    comprensionlectora: 10,
                    gramatica: 60,
                    pronunciacion: 10,
                    vocabulario: 40,
                };

                const updatedCompletedExercises = { ...completedExercises };

                const exerciseCount = {
                    comprensionauditiva: 0,
                    comprensionlectora: 0,
                    gramatica: 0,
                    pronunciacion: 0,
                    vocabulario: 0,
                };

                querySnapshot.docs.forEach(docSnap => {
                    const docId = docSnap.id;
                    const data = docSnap.data();
                    const answeredIdsLength = Array.isArray(data.answeredIds) ? data.answeredIds.length : 0;
                    const normalizedDocId = docId.replace('-', ''); // Eliminar guiones

                    if (targetLengths[normalizedDocId] !== undefined) {
                        const totalTarget = targetLengths[normalizedDocId];
                        exerciseCount[normalizedDocId] += answeredIdsLength;
                        if (answeredIdsLength >= totalTarget) {
                            updatedCompletedExercises[normalizedDocId] = true;  // Marcar como completado
                          
                            console.log('aumentadndo contador')
                        }
                    }
                });

                setCompletedExercises(updatedCompletedExercises);
                console.log("Conteo de ejercicios completados por tipo:", exerciseCount);
            } catch (error) {
                console.error("Error al consultar los documentos:", error);
            }
        };

        if (userDocId) {
            calculateCompletedExercises();
        }
    }, [userDocId]);

    return (
            
            <div className="profile-page">
                <header className="header">
                    <nav className="navbartypeexercises">
                        <ul>
                            <li>
                                <img src="../icons/image.png" style={{ height: 30, marginTop: 10 }} alt="Logo" />
                            </li>
                        </ul>
                        <h1 className="username-pass">{usernamePass}</h1>
                    </nav>
                </header>

            <div className="main-content">


                <div className="toolbartypeexercises">
                    <img className="tab-buttons" src='../icons/return_icon.png' onClick={goBack} alt="Return"/>
                    <div className="logout-button">
                        <img className="tab-buttons" src="../icons/logout_icon.png" onClick={handleSignOut} alt="Logout" />
                    </div>
                </div>
                
                <div className="typeexercises-container">

                <Modal 
                        isOpen={isModalOpen} 
                        closeModal={() => setIsModalOpen(false)} 
                        title={titleDashboard} 
                        content={contentDashboard} 
                    />
                    <div className='typeexercises-group'>
                        <h2 className='defaultex-title'>Default Exercises</h2>               
                        <img className='practiceicon'src="../icons/practice_icon.png" />
                    </div>
                    <hr className='hr-profile'/>
                    <h3 className='filtertypes'>Filter By: </h3>
                    <div className='filter-group'>
                        <form  onSubmit={handlePracticeExercises}>
                        <div className='typeexercises-group'>
                        <input 
                            type='radio'
                            name='exercise-type' // mismo name para agrupar
                            className='inputradio-filters'
                            value='gramática'
                            checked={selectedExercise === 'gramatica'}
                            onChange={() => setSelectedExercise('gramatica')}
                            disabled={completedExercises.gramatica}
                        />
                        <p>Grammar</p>
                        </div>

                        <div className='typeexercises-group'>
                        <input 
                            type='radio'
                            name='exercise-type' // mismo name para agrupar
                            className='inputradio-filters'
                            value='vocabulario'
                            checked={selectedExercise === 'vocabulario'}
                            onChange={() => setSelectedExercise('vocabulario')}
                            disabled={completedExercises.vocabulario}
                        />
                        <p>Vocabulary</p>
                        </div>

                        <div className='typeexercises-group'>
                        <input 
                            type='radio'
                            name='exercise-type' // mismo name para agrupar
                            className='inputradio-filters'
                            value='comprensión auditiva'
                            checked={selectedExercise === 'comprension-auditiva'}
                            onChange={() => setSelectedExercise('comprension-auditiva')}
                            disabled={completedExercises.comprensionauditiva} 
                        />
                        <p>Listening</p>
                        </div>

                        <div className='typeexercises-group'>
                        <input 
                        type='radio'
                        name='exercise-type' // mismo name para agrupar
                        className='inputradio-filters'
                        value='comprensión lectora'
                        checked={selectedExercise === 'comprension-lectora'}
                        onChange={() => setSelectedExercise('comprension-lectora')}
                        disabled={completedExercises.comprensionlectora}
                        />
                        <p>Reading</p>
                        </div>

                        <div className='typeexercises-group'>
                        <input 
                        type='radio'
                        name='exercise-type' // mismo name para agrupar
                        className='inputradio-filters'
                        value='pronunciación'
                        checked={selectedExercise === 'pronunciacion'}
                        onChange={() => setSelectedExercise('pronunciacion')}
                        disabled={completedExercises.pronunciacion}
                        />
                        <p>Speaking</p>
                        </div>

                        <div className='typeexercises-group'>
                        <input 
                        type='radio'
                        name='exercise-type' // mismo name para agrupar
                        className='inputradio-filters'
                        value='aleatorio'
                        checked={selectedExercise === 'aleatorio'}
                        onChange={() => setSelectedExercise('aleatorio')}
                        />
                        <p>Random</p>
                        </div>
                        
                        <button type='submit'className='start-button' src="../icons/play_icon.png"/>
                        </form>
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DefaultExercises;