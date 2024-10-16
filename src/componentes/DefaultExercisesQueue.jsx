import React, { useEffect, useContext, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './DefaultExercisesQueue.css';
import { AuthContext } from '../firebasestuff/authContext';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Importa los componentes de gramática
import MultipleChoice from './Grammar/MultipleChoice.jsx';
import OrderSentence from './Grammar/OrderSentence.jsx';
import VerbalTime from './Grammar/VerbalTime.jsx';
import VoiceChange from './Grammar/VoiceChange.jsx';
import CorrectMistake from './Grammar/CorrectMistake.jsx';

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

    // Crear refs para cada tipo de ejercicio
    const orderSentenceRef = useRef();
    const multipleChoiceRef = useRef();

    const goBack = () => {
        navigate(-1);
    };

    useEffect(() => {
        console.log("entrando al fetch...");

        const loadingDelay = setTimeout(() => {
            setShowLoading(true); // Asegúrate de que se muestre durante el retraso
        }, 10000); //duracion maxima de la pantalla de carga

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
            } catch (error) {
                console.error("Error al obtener el nivel del usuario: ", error);
            } finally {
                clearTimeout(loadingDelay); // Limpia el timeout si la carga finaliza antes del tiempo
                setLoading(false);
                setShowLoading(false);
                console.log("Carga completa.");
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
                        'ejerciciospredeterminados/gramática/tiposdegramatica/ordenaroraciones/ordenaroracionesEJ/'
                    ];  
                }
                else if(nivelUsuario == 'B2'){
                    exercisePaths = [
                        'ejerciciospredeterminadosB2/gramatica/tiposdegramatica/ordenaroraciones/ordenaroracionesEJ',
                        'ejerciciospredeterminadosB2/gramatica/tiposdegramatica/opcionmultiple/opcionmultipleEJ',
                        'ejerciciospredeterminadosB2/gramatica/tiposdegramatica/corregirerrores/corregirerroresEJ',
                        'ejerciciospredeterminadosB2/gramatica/tiposdegramatica/cambiodevoz/cambiodevozEJ',
                        'ejerciciospredeterminadosB2/gramatica/tiposdegramatica/cambiodetiemposverbales/tiemposverbalesEJ'
                    ];
                }
                    console.log("Exercise Paths:", exercisePaths);
                    setTitle('Ejercicios de Gramática');
                    break;  

                case 'vocabulario':
                    if(nivelUsuario == 'B1'){
                    exerciseBasePaths = [
                        '/ejerciciospredeterminados/vocabulario/tipos de vocabulario/asociacióndeimagenes/asociaciondeimagenesEJ0',
                        '/ejerciciospredeterminados/vocabulario/tipos de vocabulario/crucigrama/crucigramaEJ',
                        '/ejerciciospredeterminados/vocabulario/tipos de vocabulario/palabrasrelacionadas/palabrasrelacionadasEJ',
                        '/ejerciciospredeterminados/vocabulario/tipos de vocabulario/traduccióninversa/traduccioninversaEJ'
                    ];

                }
                    else if(nivelUsuario == 'B2'){
                        exerciseBasePaths = [
                        '/ejerciciospredeterminadosB2/vocabulario/tipos de vocabulario/asociacióndeimagenes/asociaciondeimagenesEJ0',
                        '/ejerciciospredeterminadosB2/vocabulario/tipos de vocabulario/crucigrama/crucigramaEJ',
                        '/ejerciciospredeterminadosB2/vocabulario/tipos de vocabulario/palabrasrelacionadas/palabrasrelacionadasEJ',
                        '/ejerciciospredeterminadosB2/vocabulario/tipos de vocabulario/traduccióninversa/traduccioninversaEJ'
                    ];
                }
                    setTitle('Ejercicios de Vocabulario');
                    console.log("Title set to:", 'Ejercicios de Gramática');
                    break;

                case 'comprension-auditiva':
                    if(nivelUsuario == 'B1'){
                    exerciseBasePaths = [
                        '/ejerciciospredeterminados/comprensión auditiva/tiposdeauditiva'
                    ];
                }
                    else if(nivelUsuario == 'B2'){
                        exerciseBasePaths = [
                        '/ejerciciospredeterminados/comprensión auditiva/tiposdeauditiva'
                    ];
                }
                    setTitle('Ejercicios de Comprensión Auditiva');
                    break;

                case 'comprension-lectora':
                    if(nivelUsuario == 'B1'){
                        exerciseBasePath = 'ejerciciospredeterminados/comprension-lectora';
                }
                    setTitle('Ejercicios de Comprensión Lectora');
                    break;
                case 'pronunciacion':
                    exerciseBasePath == 'ejerciciospredeterminados/pronunciacion';
                    setTitle('Ejercicios de Pronunciación');
                    break;
                case 'aleatorio':
                    setTitle('Ejercicios Aleatorios');
                    const allExercisesRef = collection(db, 'ejerciciospredeterminados');
                    const querySnapshot = await getDocs(allExercisesRef);

                    // Mezclar los ejercicios aleatoriamente
                    fetchedExercises = querySnapshot.docs
                        .map(doc => doc.data())
                        .sort(() => Math.random() - 0.5);  // Mezcla los ejercicios
                    setExercises(fetchedExercises);  // Establecer los ejercicios aleatorios
                    return;  // Salir del switch porque ya tenemos los ejercicios
                default:
                    exerciseBasePath = 'aleatorio';
                    setTitle('Otros Ejercicios');
                    break;
            }
            
          // Obtener ejercicios de todos los paths
          for (const path of exercisePaths) {
            const exercisesRef = collection(db, path);
            const querySnapshot = await getDocs(exercisesRef);

            querySnapshot.forEach((doc) => {
                const exerciseData = doc.data();
                let tipoEjercicio = '';
                
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
            switch (exercise.tipoEjercicio) {
                case 'ordenaoraciones':
                    pathType = 'gramatica/ordenaroraciones';
                    break;
                // Agregar más tipos si es necesario
                default:
                    console.log('Tipo de ejercicio no encontrado (Replace):', exercise.tipoEjercicio);
                    continue; // Saltar a la siguiente iteración
            }

            // Aqui asumimos que replacement.replacementId ahora es un array y tomamos el primer elemento.
            const replacementId = replacement.replacementId; // Obtener el primer elemento del array

            // Construir el path del ejercicio de reemplazo
            const replacementExercisePath = `ejercicios de reserva/${pathLevel}/tipos${pathLevel}/${pathType}`;

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
            const userLevelId = userDoc.data()

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
                // is NaN verifica si el valor de currentFails no es un numero
                // Si es un numero valido devuelve false y si es True lo rellena con 0
                // Si es valido lo convierte a numero y si ya es un numero no pasa nada :)
                currentFails = isNaN(currentFails) ? 0 : Number(currentFails);

                await updateDoc(failedRef, {
                    [FailedexerciseId]: currentFails + 1
                });
                } else {
                // Si el ejercicio no estaba registrado, agregarlo con valor [1]
                await updateDoc(failedRef, {
                    [FailedexerciseId]: 1
                });
                }
            }
            console.log(`Ejercicio ${FailedexerciseId} actualizado correctamente en failedEX`);
        } else {
            // Si no existe el documento, crearlo con el ejercicio fallido y un valor inicial de [1]
            await setDoc(failedRef, {
            [FailedexerciseId]: 1
            });
        }
        }
        
        } catch (error) {
        console.error("Error actualizando el ejercicio en failedEX:", error);
        }
    };

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

    switch (exercise.tipoEjercicio) {
       /* case 'opcionmultiple':
            return <MultipleChoice exercise={exercise} />;
        */case 'ordenaoraciones':
            return <OrderSentence ref={orderSentenceRef} exercise={exercise} />;
       /* case 'corregirerrores':
            return <CorrectMistake exercise={exercise} />;
        case 'cambiodevoz':
            return <VoiceChange exercise={exercise} />;
        case 'cambiodetiemposverbales':
            return <VerbalTime exercise={exercise} />;*/
        default:
            return <p>Error, no se encuentran componentes</p>;
    }
};

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
                    // Llamar a la funcion del componente OrderSentence
                    multipleChoiceRef.current.verificarRespuesta(); 
                }
                break;
            
            default:
                console.log('No se encontro el tipo de ejercicio al mandar la respuesta')
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

        // Eliminar el ejercicio del arreglo de ejercicios
        removeExerciseFromQueue()

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
        switch (currentExercise.tipoEjercicio){
            case 'ordenaoraciones':    
            if (orderSentenceRef.current) {
                console.log('Reiniciando ordenaoraciones.');
                console.log('orderSentenceRef es:', orderSentenceRef.current);
                orderSentenceRef.current.reiniciar();
            } else {
                console.log('orderSentenceRef.current es undefined o null');
            }break;

            default :
            console.log("NO se pudo reiniciar este ejercicio")
        }
    }

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
                const excerciseTipe = selectedExercise; // El tipo de ejercicio ya ha sido seleccionado
                console.log('ID del documento de usuario:', userDocId);

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

                    console.log('ID actual del ejercicio:', currentExercise.id); // Debería mostrar el ID '1'
                    
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
            } else {
                console.log('El usuario no existe');
            }
        } catch (error) {
            console.log('Error al agregar el id del ejercicio al doc del usuario en la BD:', error.message);
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
            <p>Cargando...</p>
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
                </div>
                
                <div className='button-queue-container'>
                    <button className='btn' onClick={handleSkip}>Saltar</button>
                    <button className='btn' onClick={handleEnviarRespuesta}>Enviar Respuesta</button>
                </div>
            </div>
        </div>
    );
}

export default DefaultExercisesQueue;
