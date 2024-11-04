import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../firebasestuff/authContext';
import signOutUser from '../firebasestuff/auth_signout';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../firebaseConfig.js';
import CommunityExAdmin from './lists/CommunityExAdmin';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { usernamePass } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Com"); 
    const [selectedFilters, setSelectedFilters] = useState(['moreLikes']);
    const [allExercises, setAllExercises] = useState([]);
    const [emptyExercises, setEmptyExercises] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [ratedExercises, setRatedExercises] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // Nuevo estado de carga


    useEffect(() => {
        if (activeTab === "Com") {
            loadAdminExercises();
        }
        else if(activeTab === "Def")
        {
            loadAdminDefaultExercises();
        }
        else if(activeTab === "Rat")
        {
            loadAdminExercisesWithRatings();
        }
    }, [activeTab]);

    const toggleFilters = () => {
        setShowFilters(!showFilters);
      };
    
      const cleanFilters = () =>{
        setSelectedFilters([]);
      };
    
        const filters = [
            { name: 'Mejor valorados', value: 'moreLikes' },
            { name: 'Peor valorados', value: 'lessLikes' },
            { name: 'Orden alfabético', value: 'alphabetic' },
            { name: 'Más recientes', value: 'recent' },
            { name: 'Más antiguos', value: 'old' },
            { name: 'Por nombre de usuario', value: 'username' },
        ];

        const isFilterDisabled = (filterValue) => {
            if (filterValue === 'moreLikes' && selectedFilters.includes('lessLikes')) return true;
            if (filterValue === 'lessLikes' && selectedFilters.includes('moreLikes')) return true;
            if (filterValue === 'recent' && selectedFilters.includes('old')) return true;
            if (filterValue === 'old' && selectedFilters.includes('recent')) return true;
            if (filterValue === 'username' && selectedFilters.includes('alphabetic')) return true;
            if (filterValue === 'alphabetic' && selectedFilters.includes('username')) return true;
        
            return false;
        };

        const handleFilterChange = (e) => {
            const { value, checked } = e.target;
            setSelectedFilters(prevFilters => {
                if (checked) {
                    if (value === 'moreLikes') return prevFilters.filter(f => f !== 'lessLikes').concat(value);
                    if (value === 'lessLikes') return prevFilters.filter(f => f !== 'moreLikes').concat(value);
                    if (value === 'recent') return prevFilters.filter(f => f !== 'old').concat(value);
                    if (value === 'old') return prevFilters.filter(f => f !== 'recent').concat(value);
                    if (value === 'username') return prevFilters.filter(f => f !== 'alphabetic').concat(value);
                    if (value === 'alphabetic') return prevFilters.filter(f => f !== 'username').concat(value);
                    return prevFilters.concat(value); 
                } else {
                    return prevFilters.filter(f => f !== value);
                }
            });
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

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    const loadAdminExercises = async () => {
        try {
            const collectionRef = collection(db, 'ejercicioscomunidad');
            const querySnapshot = await getDocs(collectionRef);
    
            if (querySnapshot.empty) {
                setEmptyExercises(true);
            } else {
                const allExercisesArray = [];
    
                querySnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    const defaultImage = "../icons/default_image.png";
                    
                    // Calcula la suma de likes y dislikes
                    const totalVotes = (data.likes || 0) + (data.dislikes || 0);
                    
                    // Verifica si el ejercicio tiene al menos el 50% de dislikes
                    if (totalVotes > 0 && (data.dislikes / totalVotes) >= 0.5) {
                        allExercisesArray.push({
                            IDEjercicio: doc.id,
                            author: data.author,
                            imageUrl: data.imageUrl || defaultImage,
                            question: data.question,
                            type: data.type,
                            stars: data.stars,
                            likes: data.likes,
                            dislikes: data.dislikes,
                            text: data.text,
                            correctAnswer: data.correctAnswer,
                            correctAnswerIndex: data.correctAnswerIndex,
                            answers: data.answers,
                            text1: data.text1,
                            text2: data.text2
                        });
                    }
                });
    
                setAllExercises(allExercisesArray);
            }
        } catch (error) {
            console.error("Error al cargar los ejercicios", error);
        }
    };

    const loadAdminDefaultExercises = async() =>{
        
    }

    const calculateExerciseRating = async (exerciseID) => {
        try {
            const usersRef = collection(db, 'usuario');
            const usersSnapshot = await getDocs(usersRef);
    
            let totalStars = 0;
            let ratingCount = 0;
    
            for (const userDoc of usersSnapshot.docs) {
                const communityRef = collection(userDoc.ref, 'community');
                const ratingQuery = query(communityRef, where('IDEjercicio', '==', `${exerciseID}`));
                const ratingSnapshot = await getDocs(ratingQuery);
    
                ratingSnapshot.forEach((doc) => {
                    const data = doc.data();
                    // Aseguramos que el documento tenga la variable `starsRated`
                    if (data.hasOwnProperty('starsRated')) {
                        totalStars += data.starsRated;
                        ratingCount += 1;
                    }
                });
            }
    
            // Calculamos el promedio solo si hay ratings válidos
            const averageRating = ratingCount > 0 ? Math.round(totalStars / ratingCount) : 0;
            return averageRating;
        } catch (error) {
            console.error("Error al calcular el promedio de estrellas", error);
            return 0;
        }
    };
    
    
    const loadAdminExercisesWithRatings = async () => {
        try {
            setIsLoading(true);
            const collectionRef = collection(db, 'ejercicioscomunidad');
            const querySnapshot = await getDocs(collectionRef);
    
            if (querySnapshot.empty) {
                setEmptyExercises(true);
            } else {
                const ratedExercisesArray = []; 
    
                for (const doc of querySnapshot.docs) {
                    const data = doc.data();
                    const averageRating = await calculateExerciseRating(doc.id);
    
                    if (averageRating > 0) {
                        ratedExercisesArray.push({
                            IDEjercicio: doc.id,
                            author: data.author,
                            imageUrl: data.imageUrl || "../icons/default_image.png",
                            question: data.question,
                            type: data.type,
                            likes: data.likes,
                            dislikes: data.dislikes,
                            stars: averageRating,
                            text: data.text,
                            correctAnswer: data.correctAnswer,
                            correctAnswerIndex: data.correctAnswerIndex,
                            answers: data.answers,
                            text1: data.text1,
                            text2: data.text2,
                        });
                    }
                }
    
                setRatedExercises(ratedExercisesArray);
            }
        } catch (error) {
            console.error("Error al cargar los ejercicios con ratings", error);
        } finally
        {
            setIsLoading(false);
        }
    };
    
    
    const sortExercises = (exercises) => {
        return exercises.sort((a, b) => {
            // Prioridad 1: Filtro por fecha (más reciente o más antiguo)
            if (selectedFilters.includes('recent') || selectedFilters.includes('old')) {
                const dateComparison = selectedFilters.includes('recent')
                    ? b.IDEjercicio - a.IDEjercicio
                    : a.IDEjercicio - b.IDEjercicio;
    
                if (dateComparison !== 0) return dateComparison;
            }
    
            // Prioridad 2: Filtro alfabético (por nombre de usuario o alfabético general)
            if (selectedFilters.includes('alphabetic') || selectedFilters.includes('username')) {
                if (a.author && b.author) {
                    const alphaComparison = a.author.localeCompare(b.author);
                    if (alphaComparison !== 0) return alphaComparison;
                }
            }
    
            // Prioridad 3: Filtro por likes (más likes o menos likes)
            if (selectedFilters.includes('moreLikes') || selectedFilters.includes('lessLikes')) {
                const likeComparison = selectedFilters.includes('moreLikes')
                    ? b.likes - a.likes
                    : a.likes - b.likes;
    
                if (likeComparison !== 0) return likeComparison;
            }
    
            return 0;
        });
    };
    
    return (
        <div className="admin-page">
            <header className="header">
                <nav className="navbaradmin">
                    <ul>
                        <li>
                            <img src="../icons/image.png" style={{ height: 30, marginTop: 10 }} alt="Logo" />
                        </li>
                        <li>
                            <p className='admin-acc-text'>Cuenta de administrador</p>
                        </li>
                    </ul>
                    <h1 className="username-pass-admin">{usernamePass}</h1>
                </nav>
            </header>
            <div className="main-content">
                <div className="toolbaradmin">
                    <div className="logout-button">
                        <img className="tab-buttons" src="../icons/logout_icon.png" onClick={handleSignOut} alt="Logout" />
                    </div>
                </div>
            </div>

            <div className='admin-content'>
                <div className='admin-buttons-container'>
                    <ul className='admin-buttons'>
                        <li>
                        <button onClick={() => handleTabClick("Com")} >
                                <img src="../icons/community_posts.png" alt="" className="button-image1" />
                            </button>
                        </li>
                        <li>
                        <button onClick={() => handleTabClick("Def")} >
                                <img src="../icons/default_exercises.png" alt="" className="button-image2" />
                            </button>
                        </li>
                        <li>
                            <button onClick={() => handleTabClick("Rat")} >
                                <img src="../icons/community_rating.png" alt="" className="button-image3" />
                            </button>
                                                        
                        </li>
                    </ul>
                </div>

                <div className='admin-main-container'>
                    <div className="tab-content">
                        {activeTab === "Com" && 
                        <div>
                           <div className='filter-admin'>
                           <h3>Administrar ejercicios de la comunidad</h3>
                           <button className='show-filters-button' onClick={toggleFilters}>
                                <img className='filters-button'src="../icons/filters_icon.png" />
                            </button>

                            {showFilters && (
                                <div className="select-filters-admin">
                                    <div>
                                    <button className='clean-button'onClick={cleanFilters}>X</button>

                                        </div>
                                {filters.map((filter) => (
                                    <div key={filter.value}>
                                    <label className='text-filter'>
                                        <input
                                        type="checkbox"
                                        value={filter.value}
                                        onChange={handleFilterChange}
                                        disabled={isFilterDisabled(filter.value)}
                                        checked={selectedFilters.includes(filter.value)}
                                        />
                                        <p className='filters-text'>{filter.name}</p>
                                    </label>
                                    </div>
                                ))}

                                </div>
                            )}
                           </div>

                           <div className="ownexercises-container">
                          
        {emptyExercises ? (
            <p className="no-exercises">Todavía no hay ejercicios</p>
        ) : (
            sortExercises(allExercises).map(ejercicio => (
                <CommunityExAdmin
                    key={ejercicio.IDEjercicio}
                    id={ejercicio.IDEjercicio}
                    author={ejercicio.author}
                    question={ejercicio.question}
                    image={ejercicio.imageUrl}
                    stars={ejercicio.stars}
                    likes={ejercicio.likes}
                    dislikes={ejercicio.dislikes}
                    correctAnswer={ejercicio.correctAnswer}
                    answers={ejercicio.answers}
                    text={ejercicio.text}
                    text1={ejercicio.text1}
                    type={ejercicio.type}
                    delete={true}
                />
            ))
        )}
    </div>

                        </div>
                        }

                        {activeTab === "Def" && 
                        <div>
                           <h3>Administrar ejercicios predeterminados</h3>

                        
                        </div>
                        }

                        {activeTab === "Rat" && 
                        <div>
                           <h3>Confirmar calificaciones</h3>
    <div className="ownexercises-container">
    {isLoading ? (
                    <p>Cargando ejercicios con calificaciones...</p> // Mensaje de carga
                ) :
        emptyExercises ? (
            <p className="no-exercises">Todavía no hay ejercicios</p>
        ) : (
            sortExercises(ratedExercises).map(ejercicio => (
                <CommunityExAdmin
                    key={ejercicio.IDEjercicio}
                    id={ejercicio.IDEjercicio}
                    author={ejercicio.author}
                    question={ejercicio.question}
                    image={ejercicio.imageUrl}
                    stars={ejercicio.stars}
                    likes={ejercicio.likes}
                    dislikes={ejercicio.dislikes}
                    correctAnswer={ejercicio.correctAnswer}
                    answers={ejercicio.answers}
                    text={ejercicio.text}
                    text1={ejercicio.text1}
                    type={ejercicio.type}
                    rated={true}
                />
            ))
        )}
    </div>
                        </div>
                        }

                    </div>
                </div> 
            </div>
        </div>
    );
};

export default AdminDashboard;
