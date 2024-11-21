import React, { useEffect, useContext, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './DefaultExercisesQueue.css';
import { AuthContext } from '../firebasestuff/authContext';
import { db } from '../firebaseConfig.js';
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, addDoc , deleteDoc} from 'firebase/firestore';
import Modal from './modal/Modal';

// Importa los componentes de gramática
import MultipleChoice from './Grammar/MultipleChoice.jsx';
import OrderSentence from './Grammar/OrderSentence.jsx';
import VerbalTime from './Grammar/VerbalTime.jsx';
import VoiceChange from './Grammar/VoiceChange.jsx';
import CorrectMistake from './Grammar/CorrectMistake.jsx';
import CompleteSentence from './Grammar/CompleteSentence.jsx'

import Crossword from './Vocabulary/Crossword.jsx';
import ImageAsociation from './Vocabulary/Imageasociation.jsx';
import ReverseTraduction from './Vocabulary/Reversetraduction.jsx';
import RelatedWords from './Vocabulary/Relatedwords.jsx';

import Reading from './Reading/Reading.jsx'

import Listening from './Listening/Listening.jsx'

import Pronunciation from './Pronunciation/Pronunciation.jsx'

const DefaultExercisesQueue = () => {
    const { state } = useLocation();
    const { selectedExercise } = state; // Aquí se recibe el tipo de ejercicio
    console.log("Selected Exercise:", selectedExercise);
    const { usernamePass } = useContext(AuthContext); // Se usa el contexto de Auth para pasar el nombre de usuario
    const navigate = useNavigate(); // Se incluye todo de navegación
    const [title, setTitle] = useState();
    const [instructions, setInstructions] = useState('INSTRUCCIONES SI SE OCUPAN');
    const [exercises, setExercises] = useState([]); // Estado para los ejercicios obtenidos
    const [nivelUsuario, setNivelUsuario] = useState(null); // Para almacenar el nivel del usuario
    const [saveExercise, setSaveExcercises] = useState(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
    const [isItCorrect, setIsCorrect] = useState(null); // Estado para que parpadee la pantalla y booleano para verificar respuesta
    const [loading, setLoading] = useState(false); // Estado de carga
    const [showLoading, setShowLoading] = useState(false);
    //cosas para la recomendacion de video de youtube
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [titleDashboard, setTitleDashboard] = useState('');
    const [contentDashboard, setContentDashboard] = useState('');

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
        navigate(-1);
    };

    useEffect(() => {
        console.log("entrando al fetch...");

        const loadingDelay = setTimeout(() => {
            setShowLoading(true); // Asegúrate de que se muestre durante el retraso
        }, 10000); //duracion maxima de la pantalla de carga

        const maxRetries = 5; // Num maximo de intentos
        let attempts = 0; // Contador de intentos

        const fetchNivelUsuario = async () => {
            try {
                setLoading(true);
                //q es la query para obtener el ID del documento relacionado al username
                const q = query(collection(db, 'usuario'), where('username', '==', usernamePass));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        console.log("Datos del usuario:", data);
                        const { nivel } = data;
                        console.log("Nivel del usuario:", nivel);
                        setNivelUsuario(nivel);
                    });
                } else {
                    console.log("El usuario no existe");
                }
                // Limpia el timeout al finalizar con exito
                clearTimeout(loadingDelay);
                setLoading(false);
                setShowLoading(false);
                console.log("Carga completa.");
            } catch (error) {
                console.error("Error al obtener el nivel del usuario: ", error);
    
                if (attempts < maxRetries) {
                    attempts++;
                    console.log(`Reintentando... intento ${attempts}`);
                    setTimeout(fetchNivelUsuario, 2000); // Espera antes de reintentar
                } else {
                    console.error("No se pudo obtener el nivel después de varios intentos");
                    clearTimeout(loadingDelay);
                    setLoading(false);
                    setShowLoading(false);
                    navigate(-1);
                }
            }
        };
    
        if (usernamePass) {
            fetchNivelUsuario();
        }
    
        return () => clearTimeout(loadingDelay);
    }, [usernamePass]);

    // Estructura principal para la lista de ejercicios
    useEffect(() => {
        const fetchExercises = async () => {
            let fetchedExercises = [];
            let exercisePaths = [];
            // Listas de Ids para descartar
            let answeredIds = [];

            // Obtener los ejercicios contestados por el usuario
            const fetchAnsweredExercises = async () => {
                try{
                    const q = query(collection(db,'usuario'), where('username', '==', usernamePass));
                    const querySnapshot = await getDocs(q);

                    if(!querySnapshot.empty){
                        const userDocId = querySnapshot.docs[0].id;
                        const answeredRef = doc(db,`usuario/${userDocId}/answered/${selectedExercise}`);
                        const answeredSnapshot = await getDoc(answeredRef);

                        if(answeredSnapshot.exists()){
                            const answeredData = answeredSnapshot.data();
                            // Poblar el arreglo o inicializarlo vacio
                            answeredIds = answeredData.answeredIds || [];
                            console.log('Ejercicios Contestados:', answeredIds);
                        } else{
                            console.log('El Doc de ejercicios contestados esta vacio o no se encontraron')
                        }
                    }
                } catch(error){
                    console.log('Huh hubo un error al recuperar los ejercicios constestados')
                }
            };

            const fetchReplacements = async () => {
                try {
                    const q = query(collection(db,'usuario'), where('username', '==', usernamePass));
                    const querySnapshot = await getDocs(q);
                    
                if(!querySnapshot.empty) {
                    const userDocId = querySnapshot.docs[0].id; // Id del usuario resultante de la query
                    const userLevelId = querySnapshot.docs[0].data().nivel;

                    const replacementRef = doc(db,`usuario/${userDocId}/replaced/replacedEX`);
                    const replacementDoc = await getDoc(replacementRef);
                    let replacements = [];

                    // Verificar si el documento existe
                    if(replacementDoc.exists()){
                        const data = replacementDoc.data(); // Obtener los datos del documento asociado al usuario

                    for(const originalId in data){
                        // Obtener el primer elemento como replacementId
                        const replacementId = data[originalId];
                        replacements.push({
                            originalId: originalId,
                            replacementId: replacementId
                        });
                    }    
                }
                        console.log('Ejercicios a reemplazar:', replacements);
                        return {replacements, userLevelId};
                    } else {
                        console.log('No se encontraron ejercicios a reemplazar.');
                        return {replacements: [], userLevelId: null};
                    }
                } catch (error) {
                    console.error('Error obteniendo ejercicios a reemplazar:', error);
                    return {replacements: [], userLevelId: null};
                }
            };

            // Obtener los ejercicios en función del nivel del usuario
            const fetchAvaliableExercises = async() => {
            switch (selectedExercise) {
                case 'gramatica':
                    if(nivelUsuario == 'B1'){
                    exercisePaths = [
                        'ejerciciospredeterminados/gramática/tiposdegramatica/ordenaroraciones/ordenaroracionesEJ/',
                        'ejerciciospredeterminados/gramática/tiposdegramatica/opcionmultiple/opcionmultipleEJ',
                        'ejerciciospredeterminados/gramática/tiposdegramatica/corregirerrores/corregirerroresEJ',
                        'ejerciciospredeterminados/gramática/tiposdegramatica/cambiodevoz/cambiodevozEJ',
                        'ejerciciospredeterminados/gramática/tiposdegramatica/cambiodetiemposverbales/tiemposverbalesEJ',
                        'ejerciciospredeterminados/gramática/tiposdegramatica/completaroraciones/completaroracionesEJ'
                    ];  
                }
                else if(nivelUsuario == 'B2'){
                    exercisePaths = [
                        'ejerciciospredeterminadosB2/gramatica/tiposdegramatica/ordenaroraciones/ordenaroracionesEJ',
                        'ejerciciospredeterminadosB2/gramatica/tiposdegramatica/opcionmultiple/opcionmultipleEJ',
                        'ejerciciospredeterminadosB2/gramatica/tiposdegramatica/corregirerrores/corregirerroresEJ',
                        'ejerciciospredeterminadosB2/gramatica/tiposdegramatica/cambiodevoz/cambiodevozEJ',
                        'ejerciciospredeterminadosB2/gramatica/tiposdegramatica/cambiodetiemposverbales/tiemposverbalesEJ',
                        'ejerciciospredeterminadosB2/gramática/tiposdegramatica/completaroraciones/completaroracionesEJ'
                    ];
                }
                    console.log("Exercise Paths:", exercisePaths);
                    break;  

                case 'vocabulario':
                    if(nivelUsuario == 'B1'){
                        exercisePaths = [
                       '/ejerciciospredeterminados/vocabulario/tipos de vocabulario/asociacióndeimagenes/asociaciondeimagenesEJ',
                       '/ejerciciospredeterminados/vocabulario/tipos de vocabulario/crucigrama/crucigramaEJ',
                       '/ejerciciospredeterminados/vocabulario/tipos de vocabulario/palabrasrelacionadas/palabrasrelacionadasEJ',
                       '/ejerciciospredeterminados/vocabulario/tipos de vocabulario/traduccióninversa/traduccioninversaEJ'
                    ];
                }
                    else if(nivelUsuario == 'B2'){
                        exercisePaths = [
                        '/ejerciciospredeterminadosB2/vocabulario/tipos de vocabulario/asociacióndeimagenes/asociaciondeimagenesEJ0',
                        '/ejerciciospredeterminadosB2/vocabulario/tipos de vocabulario/crucigrama/crucigramaEJ',
                        '/ejerciciospredeterminadosB2/vocabulario/tipos de vocabulario/palabrasrelacionadas/palabrasrelacionadasEJ',
                        '/ejerciciospredeterminadosB2/vocabulario/tipos de vocabulario/traduccióninversa/traduccioninversaEJ'
                    ];
                }
             
                    break;

                case 'comprension-auditiva':
                    if(nivelUsuario == 'B1'){
                    exercisePaths = [
                        '/ejerciciospredeterminados/comprensión auditiva/tiposdeauditiva'];
                }
                    else if(nivelUsuario == 'B2'){
                        exercisePaths = [
                        '/ejerciciospredeterminadosB2/comprensión auditiva/tiposdeauditiva'];
                }
                    break;

                case 'comprension-lectora':
                    if(nivelUsuario == 'B1'){
                        exercisePaths = ['ejerciciospredeterminados/comprensión lectora/tiposdelectora'];
                    }
                    else if(nivelUsuario == 'B2'){
                        exercisePaths = ['ejerciciospredeterminadosB2/comprensión lectora/tiposdelectora'];
                    }
                    break;

                case 'pronunciacion':
                    if(nivelUsuario == 'B1'){
                        exercisePaths = ['ejerciciospredeterminados/pronunciación/tiposdepronunciacion'];
                    }
                    else if(nivelUsuario == 'B2'){
                        exercisePaths = ['ejerciciospredeterminadosB2/pronunciación/tiposdepronunciacionB2'];
                    }
                    break;

                case 'aleatorio':
                    if(nivelUsuario == 'B1'){
                    exercisePaths = [
                        'ejerciciospredeterminados/gramática/tiposdegramatica/ordenaroraciones/ordenaroracionesEJ/',
                        'ejerciciospredeterminados/gramática/tiposdegramatica/opcionmultiple/opcionmultipleEJ',
                        'ejerciciospredeterminados/gramática/tiposdegramatica/corregirerrores/corregirerroresEJ',
                        'ejerciciospredeterminados/gramática/tiposdegramatica/cambiodevoz/cambiodevozEJ',
                        'ejerciciospredeterminados/gramática/tiposdegramatica/cambiodetiemposverbales/tiemposverbalesEJ',
                        'ejerciciospredeterminados/gramática/tiposdegramatica/completaroraciones/completaroracionesEJ',

                        '/ejerciciospredeterminados/vocabulario/tipos de vocabulario/asociacióndeimagenes/asociaciondeimagenesEJ',
                        '/ejerciciospredeterminados/vocabulario/tipos de vocabulario/crucigrama/crucigramaEJ',
                        '/ejerciciospredeterminados/vocabulario/tipos de vocabulario/palabrasrelacionadas/palabrasrelacionadasEJ',
                        '/ejerciciospredeterminados/vocabulario/tipos de vocabulario/traduccióninversa/traduccioninversaEJ',

                        '/ejerciciospredeterminados/comprensión auditiva/tiposdeauditiva',
                 
                        '/ejerciciospredeterminados/comprensión lectora/tiposdelectora',
                      
                        'ejerciciospredeterminados/pronunciación/tiposdepronunciacion',
                    ];
                    // Mezclar los ejercicios aleatoriamente
                    /*fetchedExercises = querySnapshot.docs
                        .map(doc => doc.data())
                        .sort(() => Math.random() - 0.5);  // Mezcla los ejercicios
                    setExercises(fetchedExercises);  // Establecer los ejercicios aleatorios
                    return;  // Salir del switch porque ya tenemos los ejercicios*/
                } else if(nivelUsuario == 'B2'){
                    exercisePaths = [
                    'ejerciciospredeterminadosB2/gramatica/tiposdegramatica/ordenaroraciones/ordenaroracionesEJ',
                    'ejerciciospredeterminadosB2/gramatica/tiposdegramatica/opcionmultiple/opcionmultipleEJ',
                    'ejerciciospredeterminadosB2/gramatica/tiposdegramatica/corregirerrores/corregirerroresEJ',
                    'ejerciciospredeterminadosB2/gramatica/tiposdegramatica/cambiodevoz/cambiodevozEJ',
                    'ejerciciospredeterminadosB2/gramatica/tiposdegramatica/cambiodetiemposverbales/tiemposverbalesEJ',
                    'ejerciciospredeterminadosB2/gramática/tiposdegramatica/completaroraciones/completaroracionesEJ',
                
                    '/ejerciciospredeterminadosB2/vocabulario/tipos de vocabulario/asociacióndeimagenes/asociaciondeimagenesEJ',
                    '/ejerciciospredeterminadosB2/vocabulario/tipos de vocabulario/crucigrama/crucigramaEJ',
                    '/ejerciciospredeterminadosB2/vocabulario/tipos de vocabulario/palabrasrelacionadas/palabrasrelacionadasEJ',
                    '/ejerciciospredeterminadosB2/vocabulario/tipos de vocabulario/traduccióninversa/traduccioninversaEJ',
                
                    '/ejerciciospredeterminadosB2/comprensión auditiva/tiposdeauditiva',

                    '/ejerciciospredeterminadosB2/comprensión lectora/tiposdelectora',

                    'ejerciciospredeterminadosB2/pronunciación/tiposdepronunciacionB2'
                ];
                }
                break;
                default:
                    setTitle('Something went wrong, try refreshing!');
                    break;
            }
            
          // Obtener ejercicios de todos los paths
          for (const path of exercisePaths) {
            const exercisesRef = collection(db, path);
            const querySnapshot = await getDocs(exercisesRef);

            querySnapshot.forEach((doc) => {
                const exerciseData = doc.data();
                let tipoEjercicio = '';
                
                switch (selectedExercise){
                
                case 'gramatica':
                // Determinar el tipo de ejercicio en funcion del path
                if(path.includes('ordenaroraciones')) {
                    tipoEjercicio = 'ordenaoraciones';
                } else if (path.includes('opcionmultiple')){
                    tipoEjercicio = 'opcionmultiple';
                } else if (path.includes('corregirerrores')){
                    tipoEjercicio = 'corregirerrores';
                } else if (path.includes('cambiodevoz')){
                    tipoEjercicio = 'cambiodevoz';
                } else if (path.includes('tiemposverbales')){
                    tipoEjercicio = 'tiemposverbales';
                } else if (path.includes('completaroraciones')){
                    tipoEjercicio = 'completaroraciones';
                }break;

                case 'vocabulario':
                if(path.includes('crucigrama')){
                    tipoEjercicio = 'crucigrama';
                } else if(path.includes('asociaciondeimagenes')){
                    tipoEjercicio = 'asociacion';
                } else if(path.includes('traduccioninversa')){
                    tipoEjercicio = 'traduccion';
                } else if(path.includes('palabrasrelacionadas')){
                    tipoEjercicio = 'palabrasrelacionadas';
                }break;

                case'comprension-lectora':
                tipoEjercicio = 'lectora';
                break;

                case'comprension-auditiva':
                tipoEjercicio = 'auditiva';
                break;

                case'pronunciacion':
                tipoEjercicio = 'pronunciacion';
                break;

                case'aleatorio':
                // Determinar el tipo de ejercicio en funcion del path
                //gramatica
                if(path.includes('ordenaroraciones')) {
                    tipoEjercicio = 'ordenaoraciones';
                } else if (path.includes('opcionmultiple')){
                    tipoEjercicio = 'opcionmultiple';
                } else if (path.includes('corregirerrores')){
                    tipoEjercicio = 'corregirerrores';
                } else if (path.includes('cambiodevoz')){
                    tipoEjercicio = 'cambiodevoz';
                } else if (path.includes('tiemposverbales')){
                    tipoEjercicio = 'tiemposverbales';
                } else if (path.includes('completaroraciones')){
                    tipoEjercicio = 'completaroraciones'
                }
                //vocabulario
                else if(path.includes('crucigrama')){
                    tipoEjercicio = 'crucigrama';
                } else if(path.includes('asociaciondeimagenes')){
                    tipoEjercicio = 'asociacion';
                } else if(path.includes('traduccioninversa')){
                    tipoEjercicio = 'traduccion';
                } else if(path.includes('palabrasrelacionadas')){
                    tipoEjercicio = 'palabrasrelacionadas';
                } else if(path.includes('lectora')){
                    tipoEjercicio = 'lectora';
                } else if(path.includes('auditiva')){
                    tipoEjercicio = 'auditiva';
                } else if(path.includes('pronunciacion')){
                    tipoEjercicio = 'pronunciacion';
                } break;
            }
                // Linea para añadir esto a cada ejercicio del arreglo
                fetchedExercises.push({
                    ...exerciseData,
                    id: exerciseData.id, // Obtener el Id de cada ejercicio
                    tipoEjercicio, // Campo a añadir
                });

                console.log('Datos del ejercicio:', exerciseData);
                console.log('ID del documento Firestore:', doc.id);
            });
        }

        // Filtrar ejercicios ya contestados y removerlos del arreglo
        fetchedExercises = fetchedExercises.filter(
            (exercise) => !answeredIds.includes(exercise.id)
        );

    };
        const { replacements, userLevelId} = await fetchReplacements();
        await fetchAnsweredExercises();
        await fetchAvaliableExercises();

        fetchedExercises = await remplazadorDeMancos(fetchedExercises, userLevelId, replacements);
    
        // Mezclar los ejercicios para variarlos
        // Solo hace falta mezclar si hay mas de un ejercicio
        if (fetchedExercises.length > 1) {
            fetchedExercises.sort(() => Math.random() - 0.5);
        }
        setExercises(fetchedExercises);
    };

    if (nivelUsuario) {
        fetchExercises();
    }

}, [selectedExercise, nivelUsuario]);

//ESTA FUNCION SE ENCARGA DE REMPLAZAR LOS QUE ESTAN EN EL DOC DEL USAURIO REPLACEMENTS
const remplazadorDeMancos = async(exercises, userLevelId, replacements) => {
    let updatedExercises = [];

    for (const exercise of exercises) {
        // Buscar el reemplazo correspondiente para el ejercicio actual
        const replacement = replacements.find(rep => rep.originalId === exercise.id);

        if (replacement) {
            console.log('REMPLAZANDO');
            console.log('Buscando reemplazo para ejercicio con ID:', exercise.id);
            console.log('Reemplazo encontrado:', replacement);

            let pathLevel = userLevelId;
            let pathType;

            // Determinar tipo de ejercicio
            switch(selectedExercise){
            
            case 'gramatica':
            switch (exercise.tipoEjercicio) {
                case 'ordenaoraciones':
                    pathType = 'gramatica/ordenaroraciones';
                    break;
                case 'opcionmultiple':
                    pathType = 'gramatica/opcionmultiple';
                    break;
                case 'corregirerrores':
                    pathType = 'gramatica/corregirerrores';
                    break;
                case 'cambiodevoz':
                    pathType = 'gramatica/cambiodevoz';
                    break;
                case 'tiemposverbales':
                    pathType = 'gramatica/tiemposverbales';
                    break;
                case 'completaroraciones':
                    pathType = 'gramatica/completaroraciones';
                    break;
            }   break;

            case 'vocabulario':
            switch (exercise.tipoEjercicio) {
                case 'asociacion':
                    pathType = 'vocabulario/asociacióndeimagenes';
                    break;
                case 'traduccion':
                    pathType = 'vocabulario/traduccióninversa';
                    break;
                case 'crucigrama':
                    pathType = 'vocabulario/crucigrama';
                    break;
                case 'palabrasrelacionadas':
                    pathType = 'vocabulario/palabrasrelacionadas';
                    break;
            }   break;

            case 'comprension-lectora':
                pathType = 'comprensión lectora';
                break;

            case 'pronunciacion':
                pathType = 'pronunciación';
                break;
                
            case 'comprension-auditiva':
                pathType = 'comprensión auditiva';
                break;
            
            default:
                console.log('Tipo de ejercicio no encontrado (Replace):', exercise.tipoEjercicio);
                continue; // Saltar a la siguiente iteracin
        }

            // Aqui asumimos que replacement.replacementId ahora es un array y tomamos el primer elemento.
            const replacementId = replacement.replacementId; // Obtener el primer elemento del array

            // Construir el path del ejercicio de reemplazo
            const replacementExercisePath = `ejercicios de reserva/${pathLevel}/tipos${pathLevel}/${pathType}`;
            console.log(' el path es: ', replacementExercisePath);
            // Referencia a la colección de ejercicios
            const replacementCollectionRef = collection(db, replacementExercisePath);

            // Consulta para obtener el documento que tenga el campo id igual a replacementId
            const q = query(replacementCollectionRef, where ('id', '==', String(replacementId)));

            // EJECUTADO porquelacopiatienemasvidaqueelcampeon
            const replacementQuerySnapshot = await getDocs(q);

            if (!replacementQuerySnapshot.empty) {

                const replacementDoc =  replacementQuerySnapshot.docs[0].data()

                // Agregar el ejercicio de reemplazo a la lista
                updatedExercises.push({
                    ...replacementDoc,
                    id: replacement.replacementId,
                    tipoEjercicio: exercise.tipoEjercicio
                });
            } else {
                console.log('No se encontró el ejercicio de reemplazo en el path:', replacementExercisePath);
                updatedExercises.push(exercise); // Mantener el ejercicio original si no se encuentra el reemplazo
            }
        } else {
            // Si no hay reemplazo, mantener el ejercicio original por ahora
            updatedExercises.push(exercise);
        }
    }
    return updatedExercises; // Devolver la lista de ejercicios actualizada
};

const incrementarErrores = async () => {
    try {

        const q = query(collection(db, 'usuario'), where('username', '==', usernamePass));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Obtener el primer documento (usuario)
            const userDoc = querySnapshot.docs[0];
            const userId = userDoc.id;
            const userLevelId = userDoc.data().nivel

        // Referencia al documento failedEX del usuario
        const failedRef = doc(db, `usuario/${userId}/failed/failedEX`);
    
        // Obtener el documento failedEX actual
        const failedDoc = await getDoc(failedRef);
        
        let FailedexerciseId;

        if (exercises && exercises[currentExerciseIndex]) {

            FailedexerciseId = exercises[currentExerciseIndex].id.toString(); 

            console.log('FailedexerciseId(String):', FailedexerciseId);

            // Si el documento existe, verificamos el ejercicio fallido
            if (failedDoc.exists()) {
                const failedData = failedDoc.data();
                
                // Verificar si el ejercicio ya está en el documento
                if (failedData.hasOwnProperty(FailedexerciseId)) {
                // Incrementar el contador de errores para ese ejercicio
                let currentFails = failedData[FailedexerciseId];
                console.log("Tipo de currentFails:", typeof currentFails, "Valor:", currentFails);
                // is NaN verifica si el valor de currentFails no es un numero
                // Si es un numero valido devuelve false y si es True lo rellena con 0
                // Si es valido lo convierte a numero y si ya es un numero no pasa nada :)
                currentFails = isNaN(currentFails) ? 0 : Number(currentFails);
                console.log("currentFails después de la conversión:", currentFails);

                if(currentFails + 1 === 2){
                    console.log("Entrando a buscarYReemplazarEjercicio");
                    // Si ha contestado mal 2 veces, buscamos el reemplazo
                    await buscarYReplaceEjercicio(userId, FailedexerciseId, userLevelId, exercises[currentExerciseIndex]);
                }

                await updateDoc(failedRef, {
                    [FailedexerciseId]: currentFails + 1
                });
                } else {
                // Si el ejercicio no estaba registrado, agregarlo con valor 1
                await updateDoc(failedRef, {
                    [FailedexerciseId]: 1
                });
                }
            }
      
            console.log(`Ejercicio ${FailedexerciseId} actualizado correctamente en failedEX`);
        } else {
            // Si no existe el documento, crearlo con el ejercicio fallido y un valor inicial de 1
            await setDoc(failedRef, {
            [FailedexerciseId]: 1
            });
        }
        }
        
        } catch (error) {
        console.error("Error actualizando el ejercicio en failedEX:", error);
        }
    };

    //ESTA FUNCION SE ENCARGA DE REMPLAZAR A LOS EJERCICIOS QUE FALLA EL USUARIO EN LA COLA ACTUAL Y BUSCA REMPLAZO
    const buscarYReplaceEjercicio = async (userId, failedExerciseId, userLevelId, exercise) => {
        try {
            // Obtener referencia a replacedEX del usuario
            const replacementRef = doc(db, `usuario/${userId}/replaced/replacedEX`);
            const replacementDoc = await getDoc(replacementRef);
            const replacements = replacementDoc.exists() ? replacementDoc.data() : {};
            console.log('Nivel del usuario:', userLevelId);
            let pathType = "";

            // Construir el path para los ejercicios de reserva
              // Determinar tipo de ejercicio
            switch(selectedExercise){
            
                case 'gramatica':
                switch (exercise.tipoEjercicio) {
                    case 'ordenaoraciones':
                        pathType = 'gramatica/ordenaroraciones';
                        break;
                    case 'opcionmultiple':
                        pathType = 'gramatica/opcionmultiple';
                        break;
                    case 'corregirerrores':
                        pathType = 'gramatica/corregirerrores';
                        break;
                    case 'cambiodevoz':
                        pathType = 'gramatica/cambiodevoz';
                        break;
                    case 'tiemposverbales':
                        pathType = 'gramatica/tiemposverbales';
                        break;
                    case 'completaroraciones':
                        pathType = 'gramatica/completaroraciones';
                        break;
                }   break;
    
                case 'vocabulario':
                switch (exercise.tipoEjercicio) {
                    case 'asociacion':
                        pathType = 'vocabulario/asociacióndeimagenes';
                        break;
                    case 'traduccion':
                        pathType = 'vocabulario/traduccióninversa';
                        break;
                    case 'crucigrama':
                        pathType = 'vocabulario/crucigrama';
                        break;
                    case 'palabrasrelacionadas':
                        pathType = 'vocabulario/palabrasrelacionadas';
                        break;
                }   break;
    
                case 'comprension-lectora':
                    pathType = 'comprensión lectora';
                    break;
    
                case 'pronunciacion':
                    pathType = 'pronunciación';
                    break;
                    
                case 'comprension-auditiva':
                    pathType = 'comprensión auditiva';
                    break;
                
                default:
                    console.log('Tipo de ejercicio no encontrado (buscarYReplace):', exercise.tipoEjercicio);
                    break;
            }

            const reserveExercisesRef = collection(db, `ejercicios de reserva/${userLevelId}/tipos${userLevelId}/${pathType}`);
            const reserveExercisesSnapshot = await getDocs(reserveExercisesRef);
    
            // Verificar si se obtuvieron documentos de reserva
        if (reserveExercisesSnapshot.empty) {
            console.log("No se encontraron ejercicios de reserva en el path:", `ejerciciosdereserva/${userLevelId}/tipos${userLevelId}/${pathType}`);
            return;
        }

        console.log(`Ejercicios obtenidos en ${pathType}:`, reserveExercisesSnapshot.size);

            let replacementExerciseId = null;
    
            // Buscar un ejercicio de reserva que no haya sido usado previamente
            reserveExercisesSnapshot.forEach(doc => {
                const exerciseData = doc.data(); // Acceder a los campos del documento
                console.log("Datos del ejercicio de reserva:", exerciseData);
                const exerciseId = exerciseData.id; // Obtener el campo 'id' del ejercicio
    
                // Verificar que no haya sido reemplazado previamente
                if (!replacements.hasOwnProperty(failedExerciseId) && !Object.values(replacements).includes(exerciseId)) {
                    replacementExerciseId = exerciseId;
                }
            });
    
            if (replacementExerciseId) {

                let replacementExerciseData = null;
                reserveExercisesSnapshot.forEach(doc => {
                    if (doc.data().id === replacementExerciseId) {
                        replacementExerciseData = doc.data(); // Obtener los datos completos del ejercicio
                    }
                });

                // Si se encuentra un ejercicio de reemplazo, agregarlo a replacedEX
                if (replacementDoc.exists()) {
                    // Actualizar el documento existente
                    await updateDoc(replacementRef, {
                        [failedExerciseId]: replacementExerciseId
                    });
                } else {
                    // Crear el documento si no existe
                    await setDoc(replacementRef, {
                        [failedExerciseId]: replacementExerciseId
                    });
                }
                console.log(`Ejercicio ${failedExerciseId} reemplazado por ${replacementExerciseId}`);
                // Actualizar la cola de ejercicios actual
                updateCurrentQueue(failedExerciseId, replacementExerciseData);
            } else {
                console.log("No se encontró un ejercicio de reserva disponible para el reemplazo. Recomendando video:");
                await recomendarVideoYouTube(userLevelId, exercise.tipoEjercicio, exercise.topic);
            }
        } catch (error) {
            console.error("Error al buscar y reemplazar el ejercicio:", error);
        }
    };
    
    const updateCurrentQueue = (failedExerciseId, replacementExerciseData) => {
        // Encontrar el índice del ejercicio fallido en la cola actual
        console.log('Datos del ejercicio de reemplazo:', replacementExerciseData);

        const index = exercises.findIndex(exercise => exercise.id.toString() === failedExerciseId);
    
        if (index !== -1) {
            // Crear una nueva lista de ejercicios con el ejercicio actualizado
            const updatedExercises = [...exercises];
            
            // Reemplazar el ejercicio fallido con el nuevo ejercicio de reserva
            updatedExercises[index] = {
                ...updatedExercises[index], // Mantener las propiedades originales
                id: replacementExerciseData.id, // Actualizar con el nuevo ID
                ...replacementExerciseData, // Aquí se pueden actualizar otros campos del ejercicio
            };
    
            // Actualizar el estado con la nueva lista de ejercicios
            setExercises(updatedExercises);
    
            console.log(`Ejercicio ${failedExerciseId} reemplazado en la cola por ${replacementExerciseData.id}`);
        } else {
            console.log(`Ejercicio ${failedExerciseId} no se encontró en la cola actual.`);
        }
    };

    // Funcion para recomendar un video de YouTube al usuario desde Firestore
    const recomendarVideoYouTube = async (userLevelId,tipoEjercicio, topic) => {
        try {
            // Consultar la coleccion de videos según el nivel y tipo de ejercicio
            const videosRef = collection(db, `videos/${userLevelId}/${tipoEjercicio}/topics/${topic}`);
            const videosSnapshot = await getDocs(videosRef);

            // Verificar si se encontraron videos para este nivel y tipo de ejercicio
            if (videosSnapshot.empty) {
                console.log("No se encontraron videos de YouTube para el tipo de ejercicio y nivel especificados.");
                return;
            }

            // Seleccionar un video aleatorio de los disponibles
            const videoDocs = videosSnapshot.docs;
            const randomIndex = Math.floor(Math.random() * videoDocs.length);
            const selectedVideo = videoDocs[randomIndex].data();

            const videoUrl = selectedVideo.url; 
            console.log("Recomendando video de YouTube al usuario:", videoUrl);

            setIsModalOpen(true);
            setTitleDashboard('We recomend you this video!');
            // Hace que el URL sea clickeable
            setContentDashboard(<a href={videoUrl} target="_blank" rel="noopener noreferrer">{videoUrl}</a>);  

        } catch (error) {
            console.error("Error obtaining the YouTube video:", error);
        }
    };

    const handleFinishReading = (allCorrect) => {
        if (allCorrect) {
            onCorrectAnswer(); 
        } else {
            onIncorrectAnswer(); 
        }
    };

    const handleFinishListening = (allCorrect) => {
        if (allCorrect) {
            onCorrectAnswer(); 
        } else {
            onIncorrectAnswer(); 
        }
    };

    const handleFinishPronunciation = (isCorrect) => {
        if (isCorrect) {
            onCorrectAnswer(); 
        } else {
            onIncorrectAnswer(); 
        }
    };

    /*const updateTitle = (exercise) => {
        setTitle(exercise.tipoEjercicio);
    };*/
    

    useEffect(() => {
       
            if (exercises[currentExerciseIndex]) {
                switch(exercises[currentExerciseIndex].tipoEjercicio){
                case 'opcionmultiple':
                    setTitle('Multiple Choice Question')
                    break;
                case 'ordenaoraciones':
                    setTitle('Order The Sentence')
                    break;
                case 'corregirerrores':
                    setTitle('Correct The Mistake')
                    break;
                case 'cambiodevoz':
                    setTitle('Voice Change');
                    break;
                case 'tiemposverbales':
                    setTitle('Verbal Time');
                    break;
                case 'completaroraciones':
                    setTitle('Complete The Sentence');
                    break;
                case 'crucigrama':
                    setTitle('Crossword');
                    break;
                case 'asociacion':
                    setTitle('Whats the image about?');
                    break;
                case 'traduccion':
                    setTitle('Traduction');
                    break;
                case 'palabrasrelacionadas':
                    setTitle('Synonim/Antonym');
                    break;
                case 'lectora':
                    setTitle('Reading');
                    break;
                case 'auditiva':
                    setTitle('Listening');
                    break;
                case 'pronunciacion':
                    setTitle('Pronunciation');
                    break;
                }
            //setTitle(exercises[currentExerciseIndex].tipoEjercicio);
        }
    }, [currentExerciseIndex, exercises]);

    // Renderizar el componente adecuado según el subtipo
    const renderExerciseComponent = (exercise) => {

    console.log("Current Exercise Index:", currentExerciseIndex);  // Verifica el índice actual
    console.log("Current Exercise:", exercises[currentExerciseIndex]);  // Verifica el ejercicio actual
    
    if (!exercise || !exercise.tipoEjercicio) {
        console.log("Ejercicio faltante o indefinido");
        return <p>Error, tipo de ejercicio no encontrado</p>;
    }

    // Log para ver que tipo de ejercicio
    console.log("Renderizando componente para el ejercicio:", exercise.tipoEjercicio); 
   
    switch(selectedExercise){

    case 'gramatica':
    switch (exercise.tipoEjercicio) {
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
        default:
            return <p>Error, no se encuentran componentes</p>;
    }

    case 'vocabulario':
    switch (exercise.tipoEjercicio) {
        case 'crucigrama':
            return <Crossword ref={crosswordRef} exercise={exercise} />;
        case 'asociacion':
            return <ImageAsociation ref={imageAsociationRef} exercise={exercise} />;
        case 'traduccion':
            return <ReverseTraduction ref={reverseTraductionRef} exercise={exercise} />;
        case 'palabrasrelacionadas':
            return <RelatedWords ref={relatedWordsRef} exercise={exercise} />;
        default:
            return <p>Error, no se encuentran componentes vocabulario</p>;
    }

    case ('comprension-lectora'):
        return <Reading ref={readingRef} exercise={exercise} onFinish={handleFinishReading}/>;

    case ('comprension-auditiva'):
        return <Listening ref={listeningRef} exercise={exercise} onFinish={handleFinishListening}/>;
        
    case 'pronunciacion':
        return <Pronunciation ref={pronunciationRef} exercise={exercise}  onFinish={handleFinishPronunciation}/>;
    default:
        return <p>Error, no se encuentran componentes lectura, listening o pronunciacion</p>;

    case 'aleatorio':
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
            return <Reading ref={readingRef} exercise={exercise} onFinish={handleFinishReading}/>;
        case    'auditiva':
            return <Listening ref={listeningRef} exercise={exercise} onFinish={handleFinishListening}/>;
        case 'pronunciacion':
            return <Pronunciation ref={pronunciationRef} exercise={exercise} onFinish={handleFinishPronunciation}/>;    
        }
    }
};

renderExerciseComponent(exercises[currentExerciseIndex]);

    // Verificar respuesta del ejercicio actual
    const handleEnviarRespuesta = () => {

        console.log("Current Exercise Index:", currentExerciseIndex);  // Verifica el índice actual
        console.log("Current Exercise:", exercises[currentExerciseIndex]);  // Verifica el ejercicio actual

        const currentExercise = exercises[currentExerciseIndex];

        // Verifica si currentExercise es válido
    if (!currentExercise) {
        console.log("No hay un ejercicio actual válido.");
        return; // Sale de la funcion si no hay un ejercicio valido
    }

    let isCorrect = false; // Variable para almacenar si la respuesta es correcta

    switch(selectedExercise){

        case 'gramatica':
        switch (currentExercise.tipoEjercicio) {
            case 'ordenaoraciones':
                if(orderSentenceRef.current) {
                    // Llamar a la funcion del componente OrderSentence
                    //orderSentenceRef.current.verificarRespuesta();
                    isCorrect = orderSentenceRef.current.verificarRespuesta();
                    console.log("Respuesta correcta (ordenaoraciones):", isCorrect);
                }
                break;
            case 'opcionmultiple':
                if(multipleChoiceRef.current) {
                    // Llamar a la funcion del componente MultipleChoice
                    isCorrect = multipleChoiceRef.current.verificarRespuesta();
                    console.log("Respuesta correcta (opcion multiple):", isCorrect);
                }
                break;
            case 'corregirerrores':
                if(correctMistakeRef.current) {
                    // Llamar a la funcion del componente CorrectMistake
                    isCorrect = correctMistakeRef.current.verificarRespuesta();
                    console.log("Respuesta correcta (corregir errores):", isCorrect);
                }
                break;
            case 'cambiodevoz':
                if(voiceChangeRef.current) {
                    // Llamar a la funcion del componente VoiceChance
                    isCorrect = voiceChangeRef.current.verificarRespuesta();
                    console.log("Respuesta correcta (cambio de voz):", isCorrect);
                }
                break;
            case 'tiemposverbales':
                if(verbalTimeRef.current) {
                    // Llamar a la funcion del componente VerbalTime
                    isCorrect = verbalTimeRef.current.verificarRespuesta();
                    console.log("Respuesta correcta (tiempos verbales):", isCorrect);
                }
            case 'completaroraciones':
                if(completeSentenceRef.current) {
                    isCorrect = completeSentenceRef.current.verificarRespuesta();
                    console.log("Respuesta correcta (completar oraciones):", isCorrect);
                }
                break;

            default:
                console.log('No se encontro el tipo de ejercicio al mandar la respuesta')
                break;
        }

        case 'vocabulario':
            switch(currentExercise.tipoEjercicio){
                case 'crucigrama':
                    if(crosswordRef.current) {
                        // Llamar a la funcion del componente crosswordRef
                        isCorrect = crosswordRef.current.verificarRespuesta();
                        console.log("Respuesta correcta (crucigrama):", isCorrect);
                    }break;
                case 'asociacion':
                    if(imageAsociationRef.current){
                        // Llamar a la funcion del componente imageAsociationRef
                        isCorrect = imageAsociationRef.current.verificarRespuesta();
                        console.log("Respuesta correcta (asociacionde imagenes):", isCorrect);
                    }break;
                case 'traduccion':
                    if(reverseTraductionRef.current){
                        // Llamar a la funcion del componente reverseTraduction
                        isCorrect = reverseTraductionRef.current.verificarRespuesta();
                        console.log("Respuesta correcta (Traduccion Inversa):", isCorrect);
                    }break;
                case 'palabrasrelacionadas':
                    if(relatedWordsRef.current){
                        // Llamar a la funcion del componente relatedWordsRef
                        isCorrect = relatedWordsRef.current.verificarRespuesta();
                        console.log("Respuesta correcta (Related Words):", isCorrect);
                    }break;
            }break;

            case 'comprension-lectora':
                if(readingRef.current){
                    // Llamar a la funcion del componente relatedWordsRef
                    isCorrect = readingRef.current.verificarRespuesta();
                    console.log("Respuesta correcta (Reading):", isCorrect);
                }break; 
            
            case 'comprension-auditiva':
                if(listeningRef.current){
                    // Llamar a la funcion del componente listeningRef
                    isCorrect = listeningRef.current.verificarRespuesta();
                    console.log("Respuesta correcta (Listening):", isCorrect);
                }break;
            
            case 'pronunciacion':
                if(pronunciationRef.current){
                    // Llamar a la funcion del componente pronunciationRef
                    console.log("Respuesta correcta (Pronunciation):", isCorrect)
                }break;
            // PARA ALEATORIO
            case 'aleatorio':
                switch (currentExercise.tipoEjercicio) {
                        case 'ordenaoraciones':
                            if(orderSentenceRef.current) {
                                // Llamar a la funcion del componente OrderSentence
                                //orderSentenceRef.current.verificarRespuesta();
                                isCorrect = orderSentenceRef.current.verificarRespuesta();
                                console.log("Respuesta correcta (ordenaoraciones):", isCorrect);
                            }
                            break;
                        case 'opcionmultiple':
                            if(multipleChoiceRef.current) {
                                // Llamar a la funcion del componente MultipleChoice
                                isCorrect = multipleChoiceRef.current.verificarRespuesta();
                                console.log("Respuesta correcta (opcion multiple):", isCorrect);
                            }
                            break;
                        case 'corregirerrores':
                            if(correctMistakeRef.current) {
                                // Llamar a la funcion del componente CorrectMistake
                                isCorrect = correctMistakeRef.current.verificarRespuesta();
                                console.log("Respuesta correcta (corregir errores):", isCorrect);
                            }
                            break;
                        case 'cambiodevoz':
                            if(voiceChangeRef.current) {
                                // Llamar a la funcion del componente VoiceChance
                                isCorrect = voiceChangeRef.current.verificarRespuesta();
                                console.log("Respuesta correcta (cambio de voz):", isCorrect);
                            }
                            break;
                        case 'tiemposverbales':
                            if(verbalTimeRef.current) {
                                // Llamar a la funcion del componente VerbalTime
                                isCorrect = verbalTimeRef.current.verificarRespuesta();
                                console.log("Respuesta correcta (tiempos verbales):", isCorrect);
                            }
                        case 'completaroraciones':
                            if(completeSentenceRef.current) {
                                isCorrect = verbalTimeRef.current.verificarRespuesta();
                                console.log("Respuesta correcta (completar oraciones):", isCorrect);
                            }
                            break;
                     
                            case 'crucigrama':
                                if(crosswordRef.current) {
                                    // Llamar a la funcion del componente crosswordRef
                                    isCorrect = crosswordRef.current.verificarRespuesta();
                                    console.log("Respuesta correcta (crucigrama):", isCorrect);
                                }break;
                            case 'asociacion':
                                if(imageAsociationRef.current){
                                    // Llamar a la funcion del componente imageAsociationRef
                                    isCorrect = imageAsociationRef.current.verificarRespuesta();
                                    console.log("Respuesta correcta (asociacionde imagenes):", isCorrect);
                                }break;
                            case 'traduccion':
                                if(reverseTraductionRef.current){
                                    // Llamar a la funcion del componente reverseTraduction
                                    isCorrect = reverseTraductionRef.current.verificarRespuesta();
                                    console.log("Respuesta correcta (Traduccion Inversa):", isCorrect);
                                }break;
                            case 'palabrasrelacionadas':
                                if(relatedWordsRef.current){
                                    // Llamar a la funcion del componente relatedWordsRef
                                    isCorrect = relatedWordsRef.current.verificarRespuesta();
                                    console.log("Respuesta correcta (Related Words):", isCorrect);
                                }break;
            
            
                        case 'comprension-lectora':
                            if(readingRef.current){
                                // Llamar a la funcion del componente relatedWordsRef
                                isCorrect = readingRef.current.verificarRespuesta();
                                console.log("Respuesta correcta (Reading):", isCorrect);
                            }break; 
                        
                        case 'comprension-auditiva':
                            if(listeningRef.current){
                                // Llamar a la funcion del componente listeningRef
                                isCorrect = listeningRef.current.verificarRespuesta();
                                console.log("Respuesta correcta (Listening):", isCorrect);
                            }break;
                        
                        case 'pronunciacion':
                            if(pronunciationRef.current){
                                // Llamar a la funcion del componente pronunciationRef
                               
                                console.log("Respuesta correcta (Pronunciation):", isCorrect)
                            }break;
        }
    }
        // Si la respuesta es correcta modificar el doc
        // En cualquier caso skip
        if(isCorrect){
            onCorrectAnswer();
            
        } else if(isCorrect === false){
            console.log('La respuesta es incorrecta o no se pudo verificar')
            onIncorrectAnswer();
            
        } else{
            console.log('APENAS ESTAN CARGANDO DALE CHANCE PLS')
        }
    };

    const onCorrectAnswer = () => {
        console.log("Respuesta correcta. Actualizando el documento de usuario.");
        
        // Parpadeo verde
        setIsCorrect(true);

        updateUserDoc(); // Solo actualizar si la respuesta es correcta

        addToFlashcards();

        // Eliminar el ejercicio del arreglo de ejercicios
        removeExerciseFromQueue();


         // Reiniciar el estado después de un corto tiempo
         setTimeout(() => {
            setIsCorrect(null);
        }, 500); // 500 ms para la duración del parpadeo
        
        clear();
    };

    const onIncorrectAnswer = () => {
        console.log("Respuesta incorrecta flashazo rojo");

        // Activar el parpadeo rojo
        setIsCorrect(false);

        incrementarErrores();

        // Reiniciar el estado después de un corto tiempo
        setTimeout(() => {
            setIsCorrect(null);
        }, 500); // Duración del parpadeo

        // Llamar al handleSkip después de remover el ejercicio
        setTimeout(() => {
            handleSkip();
        }, 200); 
    }

    const clear = () => {
        const currentExercise = exercises[currentExerciseIndex];

        switch(selectedExercise){

        case 'gramatica':
        switch (currentExercise.tipoEjercicio){
            case 'ordenaoraciones':    
                if (orderSentenceRef.current) {
                    console.log('Reiniciando ordenaoraciones.');
                    console.log('orderSentenceRef es:', orderSentenceRef.current);
                    orderSentenceRef.current.reiniciar();
                } else {
                console.log('orderSentenceRef.current es undefined o null');
            }break;
            
            case 'opcionmultiple':
                if (multipleChoiceRef.current) {
                    console.log('Reiniciando ordenaoraciones.');
                    console.log('multipleChoiceRef es:', multipleChoiceRef.current);
                    multipleChoiceRef.current.reiniciar();
                } else {
                    console.log('multipleChoiceRef.current es undefined o null');
                }break;

            case 'corregirerrores':
                if (correctMistakeRef.current) {
                    console.log('Reiniciando corregirErrores.');
                    console.log('correctMistakeRef es:', correctMistakeRef.current);
                    correctMistakeRef.current.reiniciar();
                } else {
                    console.log('correctMistakeRef.current es undefined o null');
                }break;  

            case 'cambiodevoz':
                if (voiceChangeRef.current) {
                    console.log('Reiniciando cambio de voz.');
                    console.log('VoiceChangeRef es:', voiceChangeRef.current);
                    voiceChangeRef.current.reiniciar();
                } else {
                    console.log('correctMistakeRef.current es undefined o null');
                }break;

            case 'tiemposverbales':
                if (verbalTimeRef.current) {
                    console.log('Reiniciando tiempos verbales.');
                    console.log('verbalTimeRef es:', verbalTimeRef.current);
                    verbalTimeRef.current.reiniciar();
                } else {
                    console.log('verbalTimeRef.current es undefined o null');
                }break;  
        }

        case 'vocabulario':
        switch(currentExercise.tipoEjercicio){
            case 'crucigrama':
                if(crosswordRef.current){
                    crosswordRef.current.reiniciar();
                } break;

            case 'asociacion':
                if(imageAsociationRef.current){
                    imageAsociationRef.current.reiniciar();
                } break;
            
            case 'traduccion':
                if(reverseTraductionRef.current){
                    reverseTraductionRef.current.reiniciar();
                } break;

            case 'palabrasrelacionadas':
                if(relatedWordsRef.current){
                    relatedWordsRef.current.reiniciar();
                } break;
        }
            case 'comprension-lectora':
                if(readingRef.current){
                    readingRef.current.reiniciar();
                } break;
            
            case 'comprension-auditiva':
                if(listeningRef.current){
                    listeningRef.current.reiniciar();
                } break;
                
            /*case 'pronunciacion':
                if(pronunciationRef.current){
                    pronunciationRef.current.reiniciar();
                } break;*/
        
            case 'aleatorio':
            switch(currentExercise.tipoEjercicio){
            case 'ordenaoraciones':    
                if (orderSentenceRef.current) {
                    console.log('Reiniciando ordenaoraciones.');
                    console.log('orderSentenceRef es:', orderSentenceRef.current);
                    orderSentenceRef.current.reiniciar();
                } else {
                console.log('orderSentenceRef.current es undefined o null');
            }break;
            
            case 'opcionmultiple':
                if (multipleChoiceRef.current) {
                    console.log('Reiniciando ordenaoraciones.');
                    console.log('multipleChoiceRef es:', multipleChoiceRef.current);
                    multipleChoiceRef.current.reiniciar();
                } else {
                    console.log('multipleChoiceRef.current es undefined o null');
                }break;

            case 'corregirerrores':
                if (correctMistakeRef.current) {
                    console.log('Reiniciando corregirErrores.');
                    console.log('correctMistakeRef es:', correctMistakeRef.current);
                    correctMistakeRef.current.reiniciar();
                } else {
                    console.log('correctMistakeRef.current es undefined o null');
                }break;  

            case 'cambiodevoz':
                if (voiceChangeRef.current) {
                    console.log('Reiniciando cambio de voz.');
                    console.log('VoiceChangeRef es:', voiceChangeRef.current);
                    voiceChangeRef.current.reiniciar();
                } else {
                    console.log('correctMistakeRef.current es undefined o null');
                }break;

            case 'tiemposverbales':
                if (verbalTimeRef.current) {
                    console.log('Reiniciando tiempos verbales.');
                    console.log('verbalTimeRef es:', verbalTimeRef.current);
                    verbalTimeRef.current.reiniciar();
                } else {
                    console.log('verbalTimeRef.current es undefined o null');
                }break;
    
            case 'crucigrama':
                if(crosswordRef.current){
                    crosswordRef.current.reiniciar();
                } break;

            case 'asociacion':
                if(imageAsociationRef.current){
                    imageAsociationRef.current.reiniciar();
                } break;
            
            case 'traduccion':
                if(reverseTraductionRef.current){
                    reverseTraductionRef.current.reiniciar();
                } break;

            case 'palabrasrelacionadas':
                if(relatedWordsRef.current){
                    relatedWordsRef.current.reiniciar();
                } break;

            case 'comprension-lectora':
                if(readingRef.current){
                    readingRef.current.reiniciar();
                } break;
            
            case 'comprension-auditiva':
                if(listeningRef.current){
                    listeningRef.current.reiniciar();
                } break;
                
            /*case 'pronunciacion':
                if(pronunciationRef.current){
                    pronunciationRef.current.reiniciar();
                } break;*/
            }
    }
}

const addToFlashcards = async () => {
    try {
        console.log('Agregando a flashcards...');

        // Obtener la referencia al documento del usuario usando el username
        const q = query(collection(db, 'usuario'), where('username', '==', usernamePass));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.error('Usuario no encontrado');
            return;
        }

        // Obtener el ID del documento del usuario
        const userDoc = querySnapshot.docs[0];
        const userDocId = userDoc.id;

        // Referencia a la colección de flashcards del usuario
        const flashcardRef = collection(db, `usuario/${userDocId}/flashcards`);

        // Obtener todos los documentos actuales en la colección flashcards del usuario
        const flashcardSnapshot = await getDocs(flashcardRef);
        
        // Encontrar el flashCardID mas alto actual
        let maxFlashCardID = 0;
        flashcardSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.flashCardID && data.flashCardID > maxFlashCardID) {
                maxFlashCardID = data.flashCardID;
            }
        });

        // Asignar un nuevo flashCardID que sea uno más que el máximo actual
        const newFlashCardID = maxFlashCardID + 1;
        const currentExercise = exercises[currentExerciseIndex];
        let traducedTitle = '';

        if (currentExercise) {
            switch(currentExercise.tipoEjercicio){
            case 'opcionmultiple':
                traducedTitle = 'Multiple Choice Question';
                break;
            case 'ordenaoraciones':
                traducedTitle = 'Order The Sentence';
                break;
            case 'corregirerrores':
                traducedTitle = 'Correct The Mistake';
                break;
            case 'cambiodevoz':
                traducedTitle = 'Voice Change';
                break;
            case 'tiemposverbales':
                traducedTitle = 'Verbal Time';
                break;
            case 'completaroraciones':
                traducedTitle = 'Complete The Sentence';
                break;
            case 'crucigrama':
                traducedTitle = 'Crossword';
                break;
            case 'asociacion':
                traducedTitle = 'Whats the image about?';
                break;
            case 'traduccion':
                traducedTitle = 'Traduction';
                break;
            case 'palabrasrelacionadas':
                traducedTitle = 'Synonim/Antonym';
                break;
            case 'lectora':
                traducedTitle = 'Reading';
                break;
            case 'auditiva':
                traducedTitle = 'Listening';
                break;
            case 'pronunciacion':
                traducedTitle = 'Pronunciation';
                break;
            }
        //setTitle(exercises[currentExerciseIndex].tipoEjercicio);
    }
        // Crear el nuevo ejercicio con el campo flashCardID
        const newExercise = {
            ...exercises[currentExerciseIndex],
            flashCardID: newFlashCardID,
            BigType: `${[traducedTitle]}`
        };

         // Eliminar campos undefined
         const filteredExercise = Object.fromEntries(
            Object.entries(newExercise).filter(([_, v]) => v !== undefined)
        );

        // Agregar el ejercicio con flashCardID a la subcolección flashcards
        await addDoc(flashcardRef, filteredExercise);

        console.log('Ejercicio agregado a flashcards con flashCardID:', newFlashCardID);
    } catch (error) {
        console.error('Error al agregar el ejercicio a flashcards:', error);
    }
};


    const updateUserDoc = async() => {
        try {
            // Verificar si usernamePass y selectedExercise existen
            console.log('usernamePass:', usernamePass);
            console.log('selectedExercise:', selectedExercise);
            console.log('currentExerciseIndex:', currentExerciseIndex);

            // Obtener el documento del usuario
            console.log('Actualizando documento de usuario...');
            const q = query(collection(db, 'usuario'), where('username', '==', usernamePass));
            const querySnapshot = await getDocs(q);
    
            if (!querySnapshot.empty) {
                // Acceder al primer documento encontrado con querySnapshot.docs[0]
                const userDocId = querySnapshot.docs[0].id;
                console.log('ID del documento de usuario:', userDocId);
                
                // Acceder al path que quiero modificar
                let excerciseTipe = selectedExercise; // El tipo de ejercicio ya ha sido seleccionado
                console.log('ID del documento de usuario:', userDocId);

                if(excerciseTipe == 'aleatorio'){
                    switch(exercises[currentExerciseIndex].tipoEjercicio){
                            //gramatica
                            case 'ordenaoraciones':
                                excerciseTipe = 'gramatica';
                                break;
                            case 'opcionmultiple':
                                excerciseTipe = 'gramatica';
                                break;
                            case 'corregirerrores':
                                excerciseTipe = 'gramatica';
                                break;
                            case 'cambiodevoz':
                                excerciseTipe = 'gramatica';
                                break;
                            case 'tiemposverbales':
                                excerciseTipe = 'gramatica';
                                break;
                            case 'completaroraciones':
                                excerciseTipe = 'gramatica';
                                break;
                            // vocabulario
                            case 'asociacion':
                                excerciseTipe = 'vocabulario';
                                break;
                            case 'traduccion':
                                excerciseTipe = 'vocabulario';
                                break;
                            case 'crucigrama':
                                excerciseTipe = 'vocabulario';
                                break;
                            case 'palabrasrelacionadas':
                                excerciseTipe = 'vocabulario';
                                break;

                        //
                        case 'lectora':
                            excerciseTipe = 'comprensionlectora';
                            break;
            
                        case 'pronunciacion':
                             excerciseTipe = 'pronunciacion';
                            break;
                            
                        case 'auditiva':
                             excerciseTipe ='comprensionauditiva';
                            break;
                        
                        default:
                            console.log('Tipo de ejercicio no encontrado (Replace):', exercise.tipoEjercicio);
                            break;
                    }
                }

                let actualType = selectedExercise;
                // Segundo switchcase para el modal de ejercicios completados
                switch(exercises[currentExerciseIndex].tipoEjercicio){
                    //gramatica
                    case 'ordenaoraciones':
                        actualType = 'gramatica';
                        break;
                    case 'opcionmultiple':
                        actualType = 'gramatica';
                        break;
                    case 'corregirerrores':
                        actualType = 'gramatica';
                        break;
                    case 'cambiodevoz':
                        actualType = 'gramatica';
                        break;
                    case 'tiemposverbales':
                        actualType = 'gramatica';
                        break;
                    case 'completaroraciones':
                        actualType = 'gramatica';
                        break;
                    // vocabulario
                    case 'asociacion':
                        actualType = 'vocabulario';
                        break;
                    case 'traduccion':
                        actualType = 'vocabulario';
                        break;
                    case 'crucigrama':
                        actualType = 'vocabulario';
                        break;
                    case 'palabrasrelacionadas':
                        actualType = 'vocabulario';
                        break;

                // otros
                case 'lectora':
                    actualType = 'comprension-lectora';
                    break;
    
                case 'pronunciacion':
                    actualType = 'pronunciacion';
                    break;
                    
                case 'auditiva':
                    actualType ='comprension-auditiva';
                    break;
                
                default:
                    console.log('Tipo de ejercicio no encontrado (Replace):', exercise.tipoEjercicio);
                    break;
            }

                const excerciseDocRef = doc(db, `usuario/${userDocId}/answered/${excerciseTipe}`);
                console.log('Referencia al documento del ejercicio:', excerciseDocRef.path);
                
                // Obtener el documento con el path que conseguí anteriormente
                const excerciseDocSnapshot = await getDoc(excerciseDocRef);
                console.log('¿Existe el documento del ejercicio?', excerciseDocSnapshot.exists());
                
                // Verificar si el documento existe o no para crearlo en caso de que falte
                if (excerciseDocSnapshot.exists()) {
                    const excerciseData = excerciseDocSnapshot.data();
                    // Obtener el arreglo de los Ids ya contestados o inicializarlo vacío
                    let answeredIds = excerciseData.answeredIds || [];
                    
                    const currentExercise = exercises[currentExerciseIndex]; // Ejercicio actual en el index
                    console.log('Ejercicio actual:', currentExercise);

                    if (!currentExercise || !currentExercise.id) {
                        console.error('El ejercicio actual es undefined o no tiene un ID válido.');
                        return;
                    }

                    console.log('ID actual del ejercicio:', currentExercise.id);
                    
                    const currentExerciseId = currentExercise.id; // Este debe ser el ID que quieres guardar
                    console.log('Este es el id actual:', currentExerciseId);

                     // Verificar si currentExercise existe y tiene un ID válido
                if (!currentExercise || !currentExercise.id) {
                    console.error('El ejercicio actual es undefined o no tiene un ID válido.');
                    return;
                }

                console.log('Ejercicio actual:', currentExercise.id);
    
                    if (!answeredIds.includes(currentExercise.id)) {
                        // Añadir el id del ejercicio actual a la lista
                        const updatedAnsweredIds = [...answeredIds, currentExercise.id];
    
                        await updateDoc(excerciseDocRef, {
                            answeredIds: updatedAnsweredIds
                        });
                        console.log('Se ha agregado el ejercicio a la lista de contestados');
                    } else {
                        console.log('El ID de este ejercicio ya está en la lista');
                    }
                } else {
                    // En caso de que el documento no exista, hacerlo e inicializarlo con el ejercicio actual
                    const currentExercise = exercises[currentExerciseIndex];

                    await setDoc(excerciseDocRef, {
                        answeredIds: [currentExercise.id]
                    });
                    console.log('Documento creado y se ha agregado a la lista de ejercicios');
                }

                   // Contar los elementos en todos los documentos de la subcoleccion answered
                    const answeredCollectionRef = collection(db, `usuario/${userDocId}/answered`);
                    const answeredDocsSnapshot = await getDocs(answeredCollectionRef);

                    let totalAnswered = 0;
                    const answeredCounts = {};
                    const excerciseTypeTranslated = {
                        comprensionauditiva: 'Listening',
                        comprensionlectora: 'Reading',
                        gramatica: 'Grammar',
                        pronunciacion: 'Pronunciation',
                        vocabulario: 'Vocabulary',
                    };

                    answeredDocsSnapshot.forEach(doc => {
                        const data = doc.data();
                        if (data.answeredIds) {
                            const count = data.answeredIds.length;
                            totalAnswered += count;
                            answeredCounts[doc.id] = count;
                        }
                    });

                    console.log('Total de ejercicios contestados:', totalAnswered);
                    console.log('Conteo de ejercicios por subcolección:', answeredCounts);

                    // Definir los totales requeridos para cada tipo de ejercicio
                    const requiredCounts = {
                        comprensionauditiva: 10,
                        comprensionlectora: 10,
                        gramatica: 60,
                        pronunciacion: 10,
                        vocabulario: 40,
                    };

                    // Normalizar el tipo de ejercicio eliminando guiones
                    const normalizedType = actualType.replace(/-/g, '');
                    const requiredCount = requiredCounts[normalizedType] || 0;

                    console.log('Progreso actual:', answeredCounts[selectedExercise]);
                    console.log('Progreso requerido:', requiredCounts[selectedExercise]);
                    console.log('Tipo actual:', actualType);
                    console.log('Tipo seleccionado:', selectedExercise);
                    
                if (answeredCounts[actualType] >= requiredCount) {
                    if (actualType === selectedExercise) {
                        const translatedType = excerciseTypeTranslated[normalizedType] || actualType || "Unknown Type";

                        // Mostrar el modal para este tipo de ejercicio
                        const progressMessage = `🥇 ${translatedType} COMPLETED! (${answeredCounts[actualType]}/${requiredCount}) 🥇`;
                        setTimeout(() => {
                            setIsModalOpen(true);
                            setTitleDashboard('Congratulations!');
                            setContentDashboard(progressMessage);
                        }, 500);

                        setTimeout(async() => {
                            navigate(-1);
                            },4000);
                    }
                }
        
                        const userDocRef = doc(db, `usuario/${userDocId}`);
                        const userDocSnapshot = await getDoc(userDocRef);

                        const userData = userDocSnapshot.data();

                        if (totalAnswered >= 130){
                            if (userData.nivel === 'B2') {
                                console.log('Usuario ya es nivel B2');
                                    setTimeout(async () => {
                                        // Mostrar el mensaje modal para usuarios nivel B2
                                        setIsModalOpen(true);
                                        setTitleDashboard('Congratulations!');
                                        setContentDashboard('You are already at Level B2! Progress has been reset.');
                                        console.log('Todos los documentos en answered han sido eliminados');
                                    }, 500);
                                       // Eliminar todos los documentos en la subcolección answered
                                    await Promise.all(
                                        answeredDocsSnapshot.docs.map((doc) => deleteDoc(doc.ref))
                                    );
    
                                    setTimeout(async() => {
                                    navigate(-1);
                                    },4000);
                        } else {
                            console.log('Nivel actualizado a B2');
                            setTimeout(async() => {
                                setIsModalOpen(true);
                                setTitleDashboard('Congratulations, you finished the exercises!');
                                setContentDashboard('You have achieved Level B2, new exercises added.');
                            }, 500);

                            await Promise.all(
                                answeredDocsSnapshot.docs.map((doc) => deleteDoc(doc.ref))
                            );

                            await updateDoc(userDocRef, { nivel: 'B2' });
                            setTimeout(async() => {
                                navigate(-1);
                                },4000);
                        }
                     
                        }
                } else {
                    console.log('El usuario no existe');
                }
            } catch (error) {
                console.log('Error al actualizar el documento del usuario:', error.message);
            }
    };

const handleSkip = () => {
    console.log('Ejercicios actuales antes de saltar:', exercises);
    console.log('Índice actual antes de saltar:', currentExerciseIndex);

    if (exercises.length > 0 && currentExerciseIndex >= 0 && currentExerciseIndex < exercises.length) {
     
        // Para agregar el ejercicio a la cola debemos guardar el ejercicio en una variable
        const currentExercise = exercises[currentExerciseIndex];
        console.log('Ejercicio actual para saltar:', currentExercise);

        
        if (!currentExercise) {
            console.log('currentExercise es undefined');
            return;
        }

        // Hay que eliminar el ejercicio actual del array
        /*Si el indice actual (index) no es igual al currentExerciseIndex, 
        la condicion sera true y ese ejercicio sera incluido en el nuevo arreglo.*/
        const remainingExercises = exercises.filter((_,index) => index !== currentExerciseIndex);
       
        // Colocar el ejercicio al final de la lista
        const updatedExercises = [...remainingExercises, currentExercise];
        console.log('Ejercicios actualizados después de saltar:', updatedExercises);

        // Calcular el nuevo índice: si el índice actual es el último, volver al inicio
        const newIndex = currentExerciseIndex >= remainingExercises.length ? 0 : currentExerciseIndex;
        console.log('Nuevo índice calculado:', newIndex);

        // Calcular el nuevo indice para que apunte al siguiente ejercicio, o al inicio si era el ultimo
        //const newIndex = (currentExerciseIndex + 1)% updatedExercises.length;
    
        // Actualizar el index y la lista de ejercicios con los nuevos
        setExercises(updatedExercises);
        // Actualizar estado setCurrentExercisesIndex
        // Llamar a setCurrentExerciseIndex dentro de un callback para garantizar que se ha actualizado exercises
        setCurrentExerciseIndex(newIndex);
        
        clear();

    } else {
        console.log('No hay ejercicios para saltar');
    }
};

const removeExerciseFromQueue = () => {
    setExercises((prevExercises) => {
        // Filtrar el ejercicio actual para eliminarlo
        const updatedExercises = prevExercises.filter((exercise, index) => index !== currentExerciseIndex);

        console.log('Ejercicio removido...........');
        console.log('updatedExercises:', updatedExercises);

        // Si todavía hay ejercicios, recalcular el índice
        if (updatedExercises.length > 0) {
            let newIndex = currentExerciseIndex;
            
            // Si el índice actual es mayor que el último índice de la lista actualizada, lo reseteamos a 0
            if (currentExerciseIndex >= updatedExercises.length) {
                newIndex = 0;
            }
            
            setCurrentExerciseIndex(newIndex);  // Actualizamos el índice correctamente
            return updatedExercises;  // Retornamos los ejercicios actualizados
        } else {
            // No quedan más ejercicios
            console.log("No hay más ejercicios disponibles.");
            setCurrentExerciseIndex(0);  // Reiniciamos el índice
            return [];  // Retornamos una lista vacía
        }
    });
};

console.log("Exercises loaded:", exercises);

if (showLoading || loading) {
    return (
        <div className="loading-screen">
            <div className="spinner"></div>
            <p>LOADING...</p>
        </div>
    );
} 

    return (
        <div className='fondo'>
            <div className="queue-container">
                <div className='header'>
                    <button onClick={goBack} className='button-returnqueue'></button>
                    <h2 className='titlequeue'>{title}</h2>
                </div>
                        
                <div className={`exercises-content ${isItCorrect === true ? 'flashVerde' : isItCorrect === false ? 'flashRojo' : ''}`}>
                    {exercises.length > 0 ? ( 
                        <div className = 'exercise-item'>
                                {renderExerciseComponent(exercises[currentExerciseIndex])}
                            </div>
                    ) : " "}
                    <Modal 
                        isOpen={isModalOpen} 
                        closeModal={() => setIsModalOpen(false)} 
                        title={titleDashboard} 
                        content={contentDashboard} 
                    />
                </div>
                
                <div className='button-queue-container'>
                    <button className='btn' onClick={handleSkip}>Skip →</button>
                    <button className='btn' onClick={handleEnviarRespuesta}>Send Answer ✓✔</button>
                </div>
            </div>
        </div>
    );
}

export default DefaultExercisesQueue;
