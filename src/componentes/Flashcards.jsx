    import React, { useEffect, useState, useContext,useRef } from 'react';
    import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
    import { useNavigate } from 'react-router-dom';
    import { AuthContext } from '../firebasestuff/authContext';
    import { db } from '../firebaseConfig.js';
    import Swal from 'sweetalert2';
    import './Flashcards.css';

    // Importación de componentes de ejercicio
    import MultipleChoice from './Grammar/MultipleChoice.jsx';
    import OrderSentence from './Grammar/OrderSentence.jsx';
    import VerbalTime from './Grammar/VerbalTime.jsx';
    import VoiceChange from './Grammar/VoiceChange.jsx';
    import CorrectMistake from './Grammar/CorrectMistake.jsx';
    import CompleteSentence from './Grammar/CompleteSentence.jsx';
    import Crossword from './Vocabulary/Crossword.jsx';
    import ImageAsociation from './Vocabulary/Imageasociation.jsx';
    import ReverseTraduction from './Vocabulary/Reversetraduction.jsx';
    import RelatedWords from './Vocabulary/Relatedwords.jsx';
    import Reading from './Reading/Reading.jsx';
    import Listening from './Listening/Listening.jsx';
    import Pronunciation from './Pronunciation/Pronunciation.jsx';

    const Flashcards = () => {
        const { usernamePass } = useContext(AuthContext);
        const [flashcards, setFlashcards] = useState([]);
        const navigate = useNavigate(); 
        const [expandedCard, setExpandedCard] = useState(null);
        const [isHovering, setIsHovering] = useState(false);
        const [timeoutId, setTimeoutId] = useState(null); 
        const [flippedCard, setFlippedCard] = useState(null);
        const [userDataFlashcard, setUserDataFlashcard] = useState(null)
        const [filterCategory, setFilterCategory] = useState('Date');  // Para filtrar por categoría
        const [sortOrder, setSortOrder] = useState('');  // Para ordenar por flashCardID

        // Crear refs para cada tipo de ejercicio
        const orderSentenceRef = useRef();
        const multipleChoiceRef = useRef();
        const correctMistakeRef = useRef();
        const voiceChangeRef = useRef();
        const verbalTimeRef = useRef();
        const completeSentenceRef = useRef();
        
        const crosswordRef = useRef();
        const imageAsociationRef = useRef();
        const reverseTraductionRef = useRef();
        const relatedWordsRef = useRef();
    
        const readingRef = useRef();
    
        const listeningRef = useRef()
    
        const pronunciationRef = useRef();

        const goBack = () => {
            navigate('/dashboard');
        };

        useEffect(() => {
            const loadFlashcards = async () => {
                try {
                    const userQuery = query(collection(db, 'usuario'), where('username', '==', usernamePass));
                    const userSnapshot = await getDocs(userQuery);
                    
                    if (!userSnapshot.empty) {
                        const userDoc = userSnapshot.docs[0];
                        const flashcardsRef = collection(userDoc.ref, 'flashcards');
                        const flashcardSnapshot = await getDocs(flashcardsRef);

                        setUserDataFlashcard(flashcardsRef);

                        const flashcardData = flashcardSnapshot.docs.map(doc => ({
                            ...doc.data(),
                            flashCardID: doc.id
                        }));
                            
                        setFlashcards(flashcardData);
                        console.log(flashcardData);

                        // Aquí se agrega la lógica para expandir la tarjeta en el centro por defecto
                        if (flashcardData.length > 0) {
                            setExpandedCard(flashcardData[0]);
                        }
                    }
                } catch (error) {
                    console.error("Error al cargar flashcards:", error);
                }
            };

            loadFlashcards();
        }, [usernamePass]);

        const handleHover = (flashcard) => {
            if (!isHovering) { 
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }

                const newTimeoutId = setTimeout(() => {
                    setIsHovering(true); 
                    setExpandedCard(flashcard); 
                }, 200); 

                setTimeoutId(newTimeoutId); 
            }
        };

        const handleLeave = () => {
            if (isHovering) {
                clearTimeout(timeoutId); 
                setIsHovering(false); 
                setExpandedCard(null); 
            }
        };

        const handleCardClick = (flashcard) => {
            setFlippedCard(flippedCard === flashcard.flashCardID ? null : flashcard.flashCardID); // Alterna el estado de la tarjeta
        };

        const handleDelete = async (index, flashcard) => {
            // Verifica que flashcard tenga la propiedad flashCardID
            if (!flashcard.flashCardID) {
                console.error('Error: flashCardID no encontrado en el objeto flashcard');
                return;
            }

             // Mostrar una ventana de confirmación
            /*const confirmDelete = window.confirm("The FlashCard WILL be deleted FOR EVER, Continue?");
                if (!confirmDelete) {
                    return; // Si el usuario cancela, no se elimina la flashcard
                }*/
                const result = await Swal.fire({
                    title: 'Are you Sure?',
                    text: "You cannot undo this",
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#950b7c',
                    cancelButtonColor: '#b10e4f',
                    confirmButtonText: 'Yes, Delete',
                    cancelButtonText: 'Nevermind, Cancel'
                });
                
            if (result.isConfirmed) {
            const flashCardID = flashcard.flashCardID;
        
            try {
                const newFlashcards = [...flashcards];
                newFlashcards.splice(index, 1); // Elimina la flashcard en el índice dado
                setFlashcards(newFlashcards); // Actualiza el estado con la nueva lista de flashcards
        
                // Accede a la referencia del documento usando el ID numérico
                const flashCardRef = doc(userDataFlashcard, String(flashCardID)); // Asegúrate de convertir a cadena
                await deleteDoc(flashCardRef);
                console.log(`Flashcard ${flashCardID} eliminada correctamente`);
                Swal.fire('Eliminado', 'La flashcard ha sido eliminada.', 'success');
            } catch (error) {
                console.error("Error al eliminar flashcard:", error);
                Swal.fire('Error', 'No se pudo eliminar la flashcard.', 'error');
            }
        }
        };

       // Filtrar flashcards por categoría
    let filteredFlashcards = filterCategory 
    ? flashcards.filter(flashcard => {
        if (filterCategory === 'Date') {
            // No filtrar por categoría si es 'Date', solo ordenar
            return true; // Deja pasar todas las tarjetas sin filtrar por 'BigType' en este caso
        }
        return flashcard.BigType === filterCategory; // Filtrar solo por BigType
    })
    : flashcards;

    if (filterCategory === 'Date' || !filterCategory) {
    filteredFlashcards = filteredFlashcards.sort((a, b) => a.flashCardID - b.flashCardID);
    } 
    // Verifica que las flashcards se están filtrando y ordenando correctamente
    console.log(filteredFlashcards);

    // Si después de aplicar el filtro el array está vacío, asegúrate de mostrar un mensaje o manejar ese caso
    if (filteredFlashcards.length === 0) {
    console.log('No se encontraron flashcards.');
    }
        
        
        const renderExerciseComponent = (exercise) => {
            switch(exercise.tipoEjercicio){
                case 'opcionmultiple':
                    return <MultipleChoice ref={multipleChoiceRef} exercise={exercise} />;
                case 'ordenaoraciones':
                    return <OrderSentence ref={orderSentenceRef} exercise={exercise} />;
                case 'corregirerrores':
                    return <CorrectMistake ref={correctMistakeRef} exercise={exercise} />;
                case 'cambiodevoz':
                    return <VoiceChange ref={voiceChangeRef} exercise={exercise} />;
                case 'tiemposverbales':
                    return <VerbalTime ref={verbalTimeRef} exercise={exercise} />;
                case 'completaroraciones':
                    return<CompleteSentence ref={completeSentenceRef} exercise={exercise}/>
                case 'crucigrama':
                    return <Crossword ref={crosswordRef} exercise={exercise} />;
                case 'asociacion':
                    return <ImageAsociation ref={imageAsociationRef} exercise={exercise} />;
                case 'traduccion':
                    return <ReverseTraduction ref={reverseTraductionRef} exercise={exercise} />;
                case 'palabrasrelacionadas':
                    return <RelatedWords ref={relatedWordsRef} exercise={exercise} />;
                case 'lectora':
                    return <Reading ref={readingRef} exercise={exercise}/>;
                case 'auditiva':
                    return <Listening ref={listeningRef} exercise={exercise} />;
                case 'pronunciacion':
                    return <Pronunciation ref={pronunciationRef} exercise={exercise} />;    
                }
        };

        

        return ( 
            <div className="flashcards-container">
                <div className='sticky-header'>

                    <button onClick={goBack} className='button-returnqueue'></button>
                
                <div className="filter-flashcards">
                    <select
                        className="filter-select"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option defaultValue="Date">Ascendant Date</option>
                        <option value="gramatica">Grammar</option>
                        <option value="vocabulario">Vocabulary</option>
                        <option value="comprension-lectora">Reading</option>
                        <option value="comprension-auditiva">Listening</option>
                        <option value="pronunciacion">Pronunciation</option>
                     
                        
                    </select>
                </div>
            </div>
                {filteredFlashcards.map((flashcard, index) => (
                    <div 
                        key={flashcard.flashCardID} 
                        //className={`flashcard ${expandedCard === flashcard ? 'flashcard-container-expanded' : ''}`} 
                        className={`flashcard ${flippedCard === flashcard.flashCardID ? 'flipped' : ''}`}
                        onMouseEnter={() => handleHover(flashcard)} 
                        onMouseLeave={handleLeave}
                        onClick={() => handleCardClick(flashcard)}
                    >
                    <button 
                        className="delete-button" 
                        onClick={(e) => {
                            e.stopPropagation(); // Detener la propagación para evitar el flip
                            handleDelete(index, flashcard); // Pasa "index" aquí
                        }}
                    >
                        X
                    </button>
                        <div className="flashcard-inner">
                            <div className="flashcard-front">
                                <h3>{flashcard.BigType || "Ejercicio de flashcard"}</h3>
                                {renderExerciseComponent(flashcard)}
                            </div>
                            <div className="flashcard-back">
                                {/* Dependiendo del tipo de ejercicio, mostrar contenido diferente */}
                            
                                {flashcard.tipoEjercicio === 'opcionmultiple' && (
                                    <div>
                                        <p className='flashcard-answers-gramatica'>ANSWER → {flashcard.opcionCorrecta}</p>
                                    </div>
                                )}
                                {flashcard.tipoEjercicio === 'ordenaroraciones' && (
                                    <div>

                                        <p className='flashcard-answers-gramatica'>ANSWER → {flashcard.oracion}</p>
                                    </div>
                                )}
                                {flashcard.tipoEjercicio === 'corregirerrores' && (
                                    <div>
                                        <p className='flashcard-answers-gramatica'>ANSWER → {flashcard.fragmentocorrecto}</p>
                                    </div>
                                )}
                                {flashcard.tipoEjercicio === 'completaroraciones' && (
                                    <div>   
                                        <p className='flashcard-answers-gramatica'>ANSWER → {flashcard.respuesta}</p>
                                    </div>
                                )}
                                {flashcard.tipoEjercicio === 'cambiodevoz' && (
                                    <div>
                                        <p className='flashcard-answers-gramatica'>ANSWER → {flashcard.oracion}</p>
                                    </div>
                                )}
                                {flashcard.tipoEjercicio === 'tiemposverbales' && (
                                    <div>
                                        <p className='flashcard-answers-gramatica'>ANSWER → {flashcard.respuesta}</p>
                                    </div>
                                )}{/*fin de gramatica*/}
                                    {/*inicio de vocabulario*/}
                                {flashcard.tipoEjercicio === 'crucigrama' && (
                                <div>
                                    {flashcard.respuestas && flashcard.respuestas.split(',').map((respuesta, index) => (
                                    <p key={index} className='flashcard-answers-vocabulario '>
                                        ANSWER {index + 1} → {respuesta.trim()}  {/*Trim para borrar espacios adicionales */}
                                    </p>
                                    ))}
                                </div>
                                )}
                                {flashcard.tipoEjercicio === 'asociacion' && (
                                    <div>
                                        <p className='flashcard-answers-vocabulario '>ANSWER → {flashcard.respuestaesperada}</p>
                                    </div>
                                )}
                                {flashcard.tipoEjercicio === 'traduccion' && (
                                    <div>
                                    {flashcard.caso1 && (
                                    <p className='flashcard-answers-vocabulario '>ANSWER 1 → {flashcard.caso1}</p>
                                    )}
                                    {flashcard.caso2 && (
                                    <p className='flashcard-answers-vocabulario '>ANSWER 2 → {flashcard.caso2}</p>
                                    )}
                                    {flashcard.caso3 && (
                                    <p className='flashcard-answers-vocabulario '>ANSWER 3 → {flashcard.caso3}</p>
                                    )}
                                    {flashcard.caso4 && (
                                    <p className='flashcard-answers-vocabulario '>ANSWER 4 → {flashcard.caso4}</p>
                                    )}
                                </div>
                                )}
                                {flashcard.tipoEjercicio === 'palabrasrelacionadas' && (
                                <div>
                                    {flashcard.caso1 && (
                                    <p className='flashcard-answers-vocabulario '>ANSWER 1 → {flashcard.caso1}</p>
                                    )}
                                    {flashcard.caso2 && (
                                    <p className='flashcard-answers-vocabulario '>ANSWER 2 → {flashcard.caso2}</p>
                                    )}
                                    {flashcard.caso3 && (
                                    <p className='flashcard-answers-vocabulario '>ANSWER 3 → {flashcard.caso3}</p>
                                    )}
                                    {flashcard.caso4 && (
                                    <p className='flashcard-answers-vocabulario '>ANSWER 4 → {flashcard.caso4}</p>
                                    )}
                                </div>
                                )}
                                {/* Fin de vocabulario*/}
                                {/* inicio del resto*/}
                                {flashcard.tipoEjercicio === 'lectora' && (
                                <div>
                                {flashcard.respuesta1 && (
                                <p className='flashcard-answers-lectura'>ANSWER 1 → {flashcard.respuesta1}</p>
                                )}
                                {flashcard.caso2 && (
                                <p className='flashcard-answers-lectura'>ANSWER 2 → {flashcard.respuesta2}</p>
                                )}
                                {flashcard.caso3 && (
                                <p className='flashcard-answers-lectura'>ANSWER 3 → {flashcard.respuesta3}</p>
                                )}
                                {flashcard.caso4 && (
                                <p className='flashcard-answers-lectura'>ANSWER 4 → {flashcard.respuesta4}</p>
                                )}
                            </div>
                            )}
                                {flashcard.tipoEjercicio === 'auditiva' && (
                                <div>
                                {flashcard.respuesta1 && (
                                <p className='flashcard-answers-auditiva'>ANSWER 1 → {flashcard.respuesta1}</p>
                                )}
                                {flashcard.respuesta2 && (
                                <p className='flashcard-answers-auditiva'>ANSWER 2 → {flashcard.respuesta2}</p>
                                )}
                                {flashcard.respuesta3 && (
                                <p className='flashcard-answers-auditiva'>ANSWER 3 → {flashcard.respuesta3}</p>
                                )}
                                {flashcard.respuesta4 && (
                                <p className='flashcard-answers-auditiva'>ANSWER 4 → {flashcard.respuesta4}</p>
                                )}
                            </div>
                            )}
                            {flashcard.tipoEjercicio === 'pronunciacion' && (
                                    <div>
                                        <p className='flashcard-answers-pronunciacion'>ANSWER → {flashcard.respuesta}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    export default Flashcards;
