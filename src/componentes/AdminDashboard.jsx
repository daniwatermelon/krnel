import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../firebasestuff/authContext';
import signOutUser from '../firebasestuff/auth_signout';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../firebaseConfig.js';
import CommunityExAdmin from './lists/CommunityExAdmin';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import DefaultExercisesAdmin from './lists/DefaultExercisesAdmin.jsx';
import Swal from 'sweetalert2';

const AdminDashboard = () => {
    const { usernamePass } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Com"); 
    const [selectedFilters, setSelectedFilters] = useState(['recent']);
    const [allExercises, setAllExercises] = useState([]);
    const [emptyExercises, setEmptyExercises] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [ratedExercises, setRatedExercises] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // Nuevo estado de carga
    const [emptyExercisesRating, setEmptyExercisesRating] = useState(false);
    const [filteredExercises, setFilteredExercises] = useState([]);
    const [fireee, setFireee] = useState(false);
    useEffect(() => {
        if(fireee === false)
        {
            const Toast = Swal.mixin({
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
              });
    
        }
        
            setFireee(true);
        
       
         if(activeTab === "Com")
        {
            loadAdminExercises();
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
            { name: 'Best rated', value: 'moreLikes' },
            { name: 'Worst rated', value: 'lessLikes' },
           // { name: 'Alphabetical order', value: 'morealphabetic' },
            { name: 'Most recent', value: 'morerecent' },
            { name: 'Oldest', value: 'moreold' },
            { name: 'By author name', value: 'moreusername' },
        ];

        const isFilterDisabled = (filterValue) => {
            if (selectedFilters.some(f => f.includes('more')) && (filterValue.includes('more') || filterValue.includes('less'))) {
                return true;
            }
            
            if (selectedFilters.some(f => f.includes('less')) && (filterValue.includes('more') || filterValue.includes('less'))) {
                return true;
            }
        
            return false;
        };

        const handleFilterChange = (e) => {
            const { value, checked } = e.target;
        
            setSelectedFilters(prevFilters => {
                if (checked) {
                    if (value.includes('more')) {
                        return [...prevFilters.filter(f => !f.includes('more') && !f.includes('less')), value];
                    }
        
                    if (value.includes('less')) {
                        return [...prevFilters.filter(f => !f.includes('more') && !f.includes('less')), value];
                    }
                    return [...prevFilters, value];
                } else {
                    // Elimina el filtro si se deselecciona
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
            setEmptyExercises(false);

            const collectionRef = collection(db, 'ejercicioscomunidad');
            const querySnapshot = await getDocs(collectionRef);
    
            if (querySnapshot.empty) {
                console.log("No hay ejercicios de la comunidad");
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
                            key: doc.id,
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
                console.log("Si hay ejercicios de la comunidad");
                if(allExercisesArray.length == 0)
                {
                    setEmptyExercises(true);

                }

            }
        } catch (error) {
            console.error("Error al cargar los ejercicios", error);
        }
    };

    
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
                console.log("loading shit");
                setIsLoading(true);
                const collectionRatingRef = collection(db, 'ejercicioscomunidad');
                const querySnapshotRating = await getDocs(
                    query(
                        collectionRatingRef,
                        where('stars', '==', 0),
                    )
                );
                if (querySnapshotRating.empty) {
                    setEmptyExercisesRating(true);
                    console.log("There are no rated exercises left");
                } else {
                    const ratedExercisesArray = []; 
                    console.log("There are exercises");
                    for (const doc of querySnapshotRating.docs) {
                        const data = doc.data();
                        const averageRating = await calculateExerciseRating(doc.id);
        
                        if (averageRating > 0 ) {
                            ratedExercisesArray.push({
                                IDEjercicio: doc.IDEjercicio,
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
    
    useEffect(() => {
        const exercises = sortExercises();
        setFilteredExercises(exercises);  // Guardamos los ejercicios filtrados en el estado
        console.log('Ejercicios filtrados después del cambio de filtro:', filteredExercises);
    }, [selectedFilters, allExercises]);

    const sortExercises = () => {
        let filteredExercisesF = [...allExercises];

            
        if (selectedFilters.includes('morerecent')) {
            console.log("moreRECENT");

            filteredExercisesF.sort((a, b) => (b.IDEjercicio) - (a.IDEjercicio));
        }

        if (selectedFilters.includes('moreold')) {
            console.log("moreOLD");

            filteredExercisesF.sort((a, b) => (a.IDEjercicio) - (b.IDEjercicio));
        }
            if (selectedFilters.includes('moreusername')) {
                console.log("Sorting by author name...");
                filteredExercisesF.sort((a, b) => (a.author || '').localeCompare(b.author || '', 'en', { sensitivity: 'base' }));
            }

            if (selectedFilters.includes('moreLikes')) {
                filteredExercisesF.sort((a, b) => {
                    const ratioA = a.likes / (a.likes + a.dislikes || 1); 
                    const ratioB = b.likes / (b.likes + b.dislikes || 1);
                    
                    if (b.likes !== a.likes) {
                        return b.likes - a.likes;
                    } else if (ratioB !== ratioA) {
                        return ratioB - ratioA; 
                    } else {
                        return a.dislikes - b.dislikes; 
                    }
                });
            } else if (selectedFilters.includes('lessLikes')) {
                filteredExercisesF.sort((a, b) => {
                    const ratioA = a.likes / (a.likes + a.dislikes || 1);
                    const ratioB = b.likes / (b.likes + b.dislikes || 1);
            
                    if (a.likes !== b.likes) {
                        return a.likes - b.likes; 
                    } else if (ratioA !== ratioB) {
                        return ratioA - ratioB; 
                    } else {
                        return b.dislikes - a.dislikes; 
                    }
                });
            }
    
            return filteredExercisesF;

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
                            <p className='admin-acc-text'>Admin account</p>
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
                           <h3>Manage community exercises</h3>
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
                                        className='instant-checkboxes-filters-a'

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
            <p className="no-exercises">There are still no poorly rated exercises </p>
        ) : (
            filteredExercises.map(ejercicio => (
                <CommunityExAdmin
                    key={ejercicio.IDEjercicio}
                    id={parseInt(ejercicio.IDEjercicio)}
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


                        {activeTab === "Rat" && 
                        <div>
                           <h3>Confirm stars</h3>
    <div className="ownexercises-container">
    {isLoading ? (
                    <p>Loading rated exercises...</p>
                ) :
        emptyExercisesRating ? (
            <p className="no-exercises">There are no rated exercises yet</p>
        ) : (
            ratedExercises.map(ejercicio => (
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
