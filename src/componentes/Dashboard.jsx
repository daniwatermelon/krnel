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
    
        useEffect(() => {

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

            if (state.recomendation) {
                setIsModalOpen(true);
                setTitleDashboard('Te recomendamos que practiques más esta categoría');
                setContentDashboard('Categoría rara');
            }

            const sortedVocabExercises = sortExercises(vocabularyExercises);
            const sortedReadExercises = sortExercises(readingExercises);
            const sortedOpenQExercises = sortExercises(openQExercises);
            const sortedCompleteSExercises = sortExercises(completeSExercises);
        
            setVocabularyExercises([...sortedVocabExercises]);
            setReadingExercises([...sortedReadExercises]);
            setOpenQExercises([...sortedOpenQExercises]);
            setCompleteSExercises([...sortedCompleteSExercises]);
        }

       
       
        const loadExercises = async () => {
            try {
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
                                    author: data.author,
                                    imageUrl: data.imageUrl || defaultImage,
                                    correctAnswer: data.correctAnswer,
                                    question: data.question,
                                    type: data.type,
                                    stars: data.stars,
                                    likes: data.likes,
                                    dislikes: data.dislikes
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
                                    type: data.type,
                                    stars: data.stars,
                                    likes: data.likes,
                                    dislikes: data.dislikes


                                });
                                break;
                            case 'openQ':
                                openQEx.push({
                                    IDEjercicio: doc.id,
                                    author: data.author,
                                    imageUrl: data.imageUrl || defaultImage,
                                    question: data.question,
                                    answers: data.answers,
                                    correctAnswerIndex: data.correctAnswerIndex,
                                    stars: data.stars,
                                    likes: data.likes,
                                    dislikes: data.dislikes
                       

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
                                    type: data.type,
                                    stars: data.stars,
                                    likes: data.likes,
                                    dislikes: data.dislikes


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
                }
            } catch (error) {
                console.log("Error al cargar los ejercicios", error);
            }
        };
        
        loadExercises();

        
    }, [state]);

    const [showFilters, setShowFilters] = useState(false);


  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const cleanFilters = () =>{
    setSelectedFilters([]);
  };

    const filters = [
        { name: 'Más likes', value: 'moreLikes' },
        { name: 'Menos likes', value: 'lessLikes' },
        { name: 'Más respuestas correctas', value: 'moreCorrect' },
        { name: 'Menos respuestas correctas', value: 'lessCorrect' },
        { name: 'Más respuestas totales', value: 'moreAnswered' },
        { name: '1 ⭐', value: '1Star' },
        { name: '2 ⭐', value: '2Star' },
        { name: '3 ⭐', value: '3Star' },
        { name: '4 ⭐', value: '4Star' },
        { name: '5 ⭐', value: '5Star' },
        { name: 'Gramática', value: 'grammar' },
        { name: 'Vocabulario', value: 'vocabulary' },
        { name: 'Comprensión lectora', value: 'reading' }
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
    const handleSortChange = (e) => {
        setSortCriteria(e.target.value);
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
   
    const handleSearch = async () => {
        try {
            // Aquí haces la búsqueda de ejercicios aplicando los filtros seleccionados
            const exercises = await getExercisesFiltered(selectedFilters); // Reemplaza con la lógica de búsqueda
            console.log('Ejercicios filtrados:', exercises); // Aquí puedes manejar los ejercicios obtenidos
        } catch (error) {
            console.error('Error fetching exercises:', error);
        }
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
                        <input placeholder='Escribe aquí para buscar...'className="searchbar" type='text' maxLength={50} onChange={(e) => setSearchText(e.target.value)}></input>
                        <p>{searchText.length}/50</p>
                        <button onClick={handleSearch} className='search-button' />
                            <div>
                            <button className='show-filters-button' onClick={toggleFilters}>
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
                    </div>
                    <div className="ownexercises-container">
                    {emptyExercises ? (
                        <p className="no-exercises">Todavía no hay ejercicios, ¡pero puedes ser el primer autor!</p>
                    ) : (
                        <>
                                {sortExercises(vocabularyExercises).map(ejercicio => (
                                <CommunityEx
                                    key={ejercicio.IDEjercicio}
                                    id={ejercicio.IDEjercicio}

                                    author={ejercicio.author}
                                    image={ejercicio.imageUrl}
                                    likes={ejercicio.likes}
                                    dislikes={ejercicio.dislikes}
                                    question={ejercicio.question}
                                    stars={ejercicio.stars}
                                    type="vocabulary"
                                    correctAnswer={ejercicio.correctAnswer}

                                    
                                />
                            ))}

                                {sortExercises(readingExercises).map(ejercicio => (
                                <CommunityEx
                                    key={ejercicio.IDEjercicio}
                                    id={ejercicio.IDEjercicio}

                                    author={ejercicio.author}
                                    question={ejercicio.question}
                                    text={ejercicio.text}
                                    image={ejercicio.imageUrl}
                                    stars={ejercicio.stars}
                                    likes={ejercicio.likes}
                                    dislikes={ejercicio.dislikes}
                                    correctAnswer={ejercicio.correctAnswer}

                                    type="reading"

                                />
                            ))}

                                {sortExercises(openQExercises).map(ejercicio => (
                                <CommunityEx
                                    key={ejercicio.IDEjercicio}
                                    id={ejercicio.IDEjercicio}

                                    author={ejercicio.author}
                                    question={ejercicio.question}
                                    answers={ejercicio.answers}
                                    image={ejercicio.imageUrl}
                                    stars={ejercicio.stars}
                                    likes={ejercicio.likes}
                                    dislikes={ejercicio.dislikes}
                                    correctAnswerIndex={ejercicio.correctAnswerIndex}
                                    type="openQ"

                                />
                            ))}

                                {sortExercises(completeSExercises).map(ejercicio => (
                                <CommunityEx
                                    key={ejercicio.IDEjercicio}
                                    id={ejercicio.IDEjercicio}
                                    author={ejercicio.author}
                                    text1={ejercicio.text1}
                                    text2={ejercicio.text2}
                                    image={ejercicio.imageUrl}
                                    stars={ejercicio.stars}
                                    likes={ejercicio.likes}
                                    dislikes={ejercicio.dislikes}
                                    correctAnswer={ejercicio.correctAnswer}
                                    type="completeS"

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
