// Dashboard.jsx
import React, { useRef, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import signOutUser from '../firebasestuff/auth_signout';
import { AuthContext } from '../firebasestuff/authContext';
import { getDataFromCollections} from '../firebasestuff/userDataQueries';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../firebaseConfig.js';
import Modal from './modal/Modal';
import './Dashboard.css';
import CommunityEx from './lists/CommunityEx';
import { levenshteinDistance } from '../levenshtein.js';

import { encryptPassword } from '../encryptPassword.js';

//import { useLowestCategory } from './LowestCategoryContext'; // Importa el hook

const Dashboard = () => {
    const { state } = useLocation(); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { usernamePass, userDocId } = useContext(AuthContext);
    const navigate = useNavigate(); 
    const [titleDashboard, setTitleDashboard] = useState('');
    const [contentDashboard, setContentDashboard] = useState('');
    const [emptyExercises, setEmptyExercises] = useState(false);
    const [vocabularyExercises, setVocabularyExercises] = useState([]);
    const [readingExercises, setReadingExercises] = useState([]);
    const [openQExercises, setOpenQExercises] = useState([]);
    const [completeSExercises, setCompleteSExercises] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState(['moreLikes']);
    const [searchText, setSearchText] = useState('');
    const [allExercises, setAllExercises] = useState([]);
    const [filteredExercises, setFilteredExercises] = useState([]);
    const [emptyFiltered, setEmptyFiltered] = useState(false);
    const [noFeedback,setIsNoFeedback] = useState(false);
    //const { lowestCategory } = useLowestCategory();  // para recomend
    const [lowestCategory, setLowestCategory] = useState('');

    const [percentAud, setPercentAud] = useState('');
    const [percentRead, setPercentRead] = useState('');
    const [percentGrammar, setPercentGrammar] = useState('');
    const [percentPron, setPercentPron] = useState('');
    const [percentVoc, setPercentVoc] = useState('');
    
    useEffect(() => {
        const exercises = filterAndSearchExercises();
        setFilteredExercises(exercises);  // Guardamos los ejercicios filtrados en el estado
        console.log('Ejercicios filtrados después del cambio de filtro:', filteredExercises);
    }, [selectedFilters, searchText, allExercises]);
    
    useEffect(() => {
        if (lowestCategory !== null) {
            console.log('lowestCategory después del delay:', lowestCategory);
        }
    }, [lowestCategory]);

    useEffect(() => {
        const calculateLowest = async () => {
            try {
                const exercisesRef = collection(db, `usuario/${userDocId}/answered`);
                const querySnapshot = await getDocs(exercisesRef);
    
                const targetLengths = {
                    comprensionauditiva: 20,
                    comprensionlectora: 20,
                    gramatica: 120,
                    pronunciacion: 20,
                    vocabulario: 60,
                };
    
                let lowestCategory = { category: '', percentage: 100 };
    
                querySnapshot.docs.forEach(docSnap => {
                    const docId = docSnap.id;
                    const data = docSnap.data();
                    const answeredIdsLength = Array.isArray(data.answeredIds) ? data.answeredIds.length : 0;
    
                    if (targetLengths[docId] !== undefined) {
                        const totalTarget = targetLengths[docId];
                        const completionPercent = Math.min((answeredIdsLength / totalTarget) * 100, 100).toFixed(2);
    
                        if (completionPercent < lowestCategory.percentage) {
                            lowestCategory = { category: docId, percentage: completionPercent };
                        }
    
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
                    }
                });

                    setLowestCategory(lowestCategory);
                    console.log("lowestCategory después del delay:", lowestCategory);
                    if (state.recomendation) {
                        setTimeout(() => {
                        setIsModalOpen(true);
                        setTitleDashboard('Te recomendamos que practiques más esta categoría');
                        setContentDashboard(lowestCategory.category);
                        console.log("lowestCategory:", lowestCategory);
                    }, 1000);  // Retraso de 1 segundo (1000 ms)
                }
            } catch (error) {
                console.error("Error al consultar los documentos:", error);
            }
        };
    
        if (userDocId) {
            calculateLowest(); // Llama a la función cuando el userDocId esté disponible
        }
    }, [userDocId]);  // Dependencia en userDocId

        useEffect(() => {
            const loadExercises = async () => {
                try {
                    if(noFeedback){}
                    const usersRef = collection(db, 'ejercicioscomunidad');
                    
                    const q = query(usersRef, where('authorId', '!=', userDocId)); 
                    
                    const querySnapshot = await getDocs(q);
            
                    if(querySnapshot.empty) {
                        setEmptyExercises(true);
                    } else {
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
                                        IDEjercicio: doc.id,
                                        authorId: data.authorId,
                                        author: data.author,
                                        imageUrl: data.imageUrl || defaultImage,
                                        correctAnswer: data.correctAnswer,
                                        question: data.question,
                                        type: data.type,
                                        stars: data.stars,
                                        likes: data.likes,
                                        dislikes: data.dislikes,
                                        totalAnswers: data.totalAnswers,
                                        allCorrectAnswers: data.allCorrectAnswers
                                    });
                                    break;
                                case 'reading':
                                    readExercises.push({
                                        IDEjercicio: doc.id,
                                        authorId: data.authorId,
                                        author: data.author,
                                        imageUrl: data.imageUrl || defaultImage,
                                        text: data.text,
                                        question: data.question,
                                        correctAnswer: data.correctAnswer,
                                        type: data.type,
                                        stars: data.stars,
                                        likes: data.likes,
                                        dislikes: data.dislikes,
                                        totalAnswers: data.totalAnswers,
                                        allCorrectAnswers: data.allCorrectAnswers
    
    
                                    });
                                    break;
                                case 'openQ':
                                    openQEx.push({
                                        IDEjercicio: doc.id,
                                        authorId: data.authorId,
                                        author: data.author,
                                        imageUrl: data.imageUrl || defaultImage,
                                        question: data.question,
                                        answers: data.answers,
                                        correctAnswerIndex: data.correctAnswerIndex,
                                        stars: data.stars,
                                        likes: data.likes,
                                        dislikes: data.dislikes,
                                        type: data.type,
                                        totalAnswers: data.totalAnswers,
                                        allCorrectAnswers: data.allCorrectAnswers
    
                           
    
                                    });
                                    break;
                                case 'completeS':
                                    completeSEx.push({
                                        IDEjercicio: doc.id,
                                        authorId: data.authorId,
                                        author: data.author,
                                        imageUrl: data.imageUrl || defaultImage,
                                        text1: data.text1,
                                        text2: data.text2,
                                        correctAnswer: data.correctAnswer,
                                        type: data.type,
                                        stars: data.stars,
                                        likes: data.likes,
                                        dislikes: data.dislikes,
                                        totalAnswers: data.totalAnswers,
                                        allCorrectAnswers: data.allCorrectAnswers,
                                        question: data.text1
    
    
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
                        setAllExercises([...vocabExercises, ...readExercises, ...openQEx, ...completeSEx]);
                        console.log("Vocabulario:",vocabExercises.length);
                        console.log("Todos los ejercicios están aquí:",allExercises.length);
                       
                    }
                } catch (error) {
                    console.log("Error al cargar los ejercicios", error);
                }
            };
            
        

        
        if(state)
        {
            if (state.nivel) {
                setTitleDashboard('Nivel Alcanzado');
                setContentDashboard(`¡Felicidades! Has alcanzado el nivel ${state.nivel}`);
                setIsModalOpen(true);
            }
    
            if(state.empty)
            {
              setIsModalOpen(false);
            }
            
           /* if (state.recomendation) {
                setTimeout(() => {
                setIsModalOpen(true);
                setTitleDashboard('Te recomendamos que practiques más esta categoría');
                setContentDashboard(`${lowestCategory}`);
                console.log("lowestCategory:", lowestCategory);
            }, 3000);  // Retraso de 1 segundo (1000 ms)
        }*/

            const sortedVocabExercises = sortExercises(vocabularyExercises);
            const sortedReadExercises = sortExercises(readingExercises);
            const sortedOpenQExercises = sortExercises(openQExercises);
            const sortedCompleteSExercises = sortExercises(completeSExercises);
        
            setVocabularyExercises([...sortedVocabExercises]);
            setReadingExercises([...sortedReadExercises]);
            setOpenQExercises([...sortedOpenQExercises]);
            setCompleteSExercises([...sortedCompleteSExercises]);
        }
        loadExercises();
    }, [state]);

    const [showFilters, setShowFilters] = useState(false);

    const viewNoFeedback = () =>{
        cleanFilters();
        setIsNoFeedback(prevState=>!prevState)
        
    }

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const cleanFilters = () =>{
    setSelectedFilters([]);
  };

    const filters = [
        { name: 'Most liked', value: 'moreLikes' },
        { name: 'Less liked', value: 'lessLikes' },
        { name: 'Most answered correctly', value: 'moreCorrect' },
        { name: 'Less answered correctly', value: 'lessCorrect' },
        { name: 'Most answered', value: 'moreAnswered' },
        { name: '1 ⭐', value: '1Star' },
        { name: '2 ⭐', value: '2Star' },
        { name: '3 ⭐', value: '3Star' },
        { name: '4 ⭐', value: '4Star' },
        { name: '5 ⭐', value: '5Star' },
        { name: 'Grammar', value: 'grammar' },
        { name: 'Vocabulary', value: 'vocabulary' },
        { name: 'Reading', value: 'reading' }
    ];

    const handleProfile = async () => {
        try {
            const profiledata = await getDataFromCollections(userDocId);
            navigate('/profile', { state: { profiledata } });
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const handleSettings = async () => {
        try {
            const settingsdata = await getDataFromCollections(userDocId);
            navigate('/settings', { state: { settingsdata } });
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const handleFlashcards = async () => {
        try {
            const flashcardsdata = await getDataFromCollections(userDocId);
            navigate('/flashcards', { state: { flashcardsdata } });
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const handleCreateExercises = async () => {
        try {
            const createexercisesdata = await getDataFromCollections(userDocId);
            navigate('/createexercises', { state: { createexercisesdata } });
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const handleDefaultExercises = async () => {
        try {
            const defaultextdata = await getDataFromCollections(userDocId);
            navigate('/default-ex', { state: { defaultextdata } });
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
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


    // Verifica si un filtro debe estar deshabilitado debido a incompatibilidades
    const isFilterDisabled = (filterValue) => {
        if (filterValue === 'moreLikes' && selectedFilters.includes('lessLikes')) return true;
        if (filterValue === 'lessLikes' && selectedFilters.includes('moreLikes')) return true;
        if (filterValue === 'moreCorrect' && selectedFilters.includes('lessCorrect')) return true;
        if (filterValue === 'lessCorrect' && selectedFilters.includes('moreCorrect')) return true;
        if (filterValue === 'moreCorrect' && selectedFilters.includes('moreAnswered')) return true;
        if (filterValue === 'lessCorrect' && selectedFilters.includes('moreAnswered')) return true;
        if (filterValue === 'moreAnswered' && selectedFilters.includes('moreCorrect')) return true;
        if (filterValue === 'moreAnswered' && selectedFilters.includes('lessCorrect')) return true;


        return false;
    };

    const sortExercises = (exercises) => {
        return exercises.sort((a, b) => {
            return a.IDEjercicio.localeCompare(b.IDEjercicio); // Ordena por el campo IDEjercicio
        });
    };

    const filterAndSearchExercises = () => {
        let filteredExercisesF = [...allExercises];
    
        if (selectedFilters.includes('moreLikes')) {
            filteredExercisesF.sort((a, b) => b.likes - a.likes);
        } else if (selectedFilters.includes('lessLikes')) {
            filteredExercisesF.sort((a, b) => a.likes - b.likes);
        }
    
        if (selectedFilters.includes('moreCorrect')) {
            filteredExercisesF.sort((a, b) => b.allCorrectAnswers - a.allCorrectAnswers);
        } else if (selectedFilters.includes('lessCorrect')) {
            filteredExercisesF.sort((a, b) => a.allCorrectAnswers - b.allCorrectAnswers);
        }
    
        if (selectedFilters.includes('moreAnswered')) {
            filteredExercisesF.sort((a, b) => (b.totalAnswers) - (a.totalAnswers));
        }
    
        const typeFilters = [];
    if (selectedFilters.includes('vocabulary')) typeFilters.push('vocabulary');
    if (selectedFilters.includes('reading')) typeFilters.push('reading');
    if (selectedFilters.includes('grammar')) typeFilters.push('openQ', 'completeT');

    if (typeFilters.length > 0) {
        filteredExercisesF = filteredExercisesF.filter(exercise => typeFilters.includes(exercise.type));
    }

    // Filtrado por estrellas
    const starFilters = selectedFilters
        .filter(filter => filter.endsWith('Star'))
        .map(filter => parseInt(filter.charAt(0), 10));

    if (starFilters.length > 0) {
        filteredExercisesF = filteredExercisesF.filter(exercise => starFilters.includes(exercise.stars));
    }
    
        // Búsqueda por texto
        if (searchText) {
            const normalizedSearchText = searchText.trim().toLowerCase();
        
            filteredExercisesF = filteredExercisesF.filter(exercise => {
                const question = exercise.question ? exercise.question.toLowerCase() : '';
                const text1 = exercise.text1 ? exercise.text1.toLowerCase() : '';
        
                // Verifica si el texto de búsqueda está incluido en `question` o `text1`
                return question.includes(normalizedSearchText) || text1.includes(normalizedSearchText);
            });
        }

        if (noFeedback) {
            filteredExercisesF = filteredExercisesF.filter(exercise => exercise.stars === 0);
        }

        
    
        if(filteredExercisesF.length === 0)
        {
            setEmptyFiltered(true)
        }
        else{
            setEmptyFiltered(false);
        }
        return filteredExercisesF;
    };
    



    const handleFilterChange = (e) => {
        const { value, checked } = e.target;
    
        setSelectedFilters(prevFilters => {
            if (checked) {
                // Agrega el filtro seleccionado, eliminando incompatibles
                if (value === 'moreLikes') {
                    return [...prevFilters.filter(f => f !== 'lessLikes'), value];
                }
                if (value === 'lessLikes') {
                    return [...prevFilters.filter(f => f !== 'moreLikes'), value];
                }
                if (value === 'moreCorrect') {
                    return [...prevFilters.filter(f => f !== 'lessCorrect' && f !== 'moreAnswered'), value];
                }
                if (value === 'lessCorrect') {
                    return [...prevFilters.filter(f => f !== 'moreCorrect'), value];
                }
                if (value === 'moreAnswered') {
                    return [...prevFilters.filter(f => f !== 'moreCorrect'), value];
                }
                return [...prevFilters, value];
            } else {
                // Elimina el filtro si se deselecciona
                return prevFilters.filter(f => f !== value);
            }
        });
    };
    return (
        <div className="dashboard-page">
            <header className="header">
                <nav className="navbar">
                    <ul>
                        <li>
                            <img src="../icons/image.png" style={{ height: 30, marginTop: 10 }} alt="Logo" />
                        </li>
                        <li className="user-stuff">
                            <p>Welcome back, {usernamePass}!</p>
                        </li>
                    </ul>
                    <button onClick={handleProfile} className="username-pass">{usernamePass}</button>
                </nav>
            </header>

            <div className="main-content">
                <div className="toolbardashboard">
                    <img onClick={handleFlashcards} className="tab-buttons" src="../icons/flashcard_icon.png" alt="Flashcard" />
                    <img onClick={handleCreateExercises} className="tab-buttons" src="../icons/create_icon.png" alt="Create" />
                    <img onClick={handleDefaultExercises} className="tab-buttons" alt="Practice" src='../icons/practice_icon.png' />
                    <img onClick={handleSettings} className="tab-buttons" src="../icons/settings_icon.png" alt="Settings" />
                    <div className="logout-button">
                        <img className="tab-buttons" src="../icons/logout_icon.png" onClick={handleSignOut} alt="Logout" />
                    </div>
                </div>

                <div className='community-exercises-container'>
                <Modal 
                        isOpen={isModalOpen} 
                        closeModal={() => setIsModalOpen(false)} 
                        title={titleDashboard} 
                        content={contentDashboard} 
                    />
                    <div className='searchbar-container'>
                        <input placeholder='Type here to search...'className="searchbar" type='text' maxLength={50} onChange={(e) => setSearchText(e.target.value)}></input>
                        <p>{searchText.length}/50</p>
                            <div className='filter-content'>
                            <button disabled={noFeedback}className='show-filters-button' onClick={toggleFilters} >
                                <img className='filters-button'src="../icons/filters_icon.png" />
                            </button>

                            {showFilters && (
                                <div className="filters-container">
                                    <div>
                                    <button className='clean-button'onClick={cleanFilters}>X</button>

                                        </div>
                                {filters.map((filter) => (
                                    <div key={filter.value}>
                                    <label>
                                        <input
                                        className='instant-checkboxes-filters'
                                        type="checkbox"
                                        value={filter.value}
                                        onChange={handleFilterChange}
                                        disabled={isFilterDisabled(filter.value)}
                                        checked={selectedFilters.includes(filter.value)}
                                        />
                                        {filter.name}
                                    </label>
                                    </div>
                                ))}

                                </div>
                            )}
                            </div>
                            <div className='no-feedback-d'>
                            <h3 hidden={showFilters}>Show exercises without ratings</h3>
                            <input hidden={showFilters} onChange={viewNoFeedback}checked={noFeedback} type='checkbox'className='instant-checkboxes' disabled={showFilters}/>

                            </div>
                    </div>
                    <div className="ownexercises-container">
                    {emptyExercises ? (
                        <p className="no-exercises">There are no exercises yet, you can be the first creator!</p>
                    ) : emptyFiltered? (
                        <p className="no-exercises">There are no exercises with the selected filters</p>
                    ) : (
                        <>
                                {(filteredExercises).map(ejercicio => (
                                    <CommunityEx
                                    key={ejercicio.IDEjercicio}
                                    id={ejercicio.IDEjercicio}
                                    author={ejercicio.author}
                                    authorId={ejercicio.authorId}
                                    image={ejercicio.imageUrl}
                                    likes={ejercicio.likes}
                                    dislikes={ejercicio.dislikes}
                                    question={ejercicio.question}
                                    stars={ejercicio.stars}
                                    type={ejercicio.type}
                                    correctAnswer={ejercicio.correctAnswer}
                                    // Propiedades específicas para tipos de ejercicio
                                    text={ejercicio.text} // solo aplicará si existe
                                    answers={ejercicio.answers} // solo aplicará si existe
                                    text1={ejercicio.text1} // solo aplicará si existe
                                    text2={ejercicio.text2} // solo aplicará si existe
                                    correctAnswerIndex={ejercicio.correctAnswerIndex} // solo aplicará si existe
                                    />
                                ))}

                        </>
                    )}
                </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
