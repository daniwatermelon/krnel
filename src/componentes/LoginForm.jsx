import React, { useState, useEffect, useContext } from 'react';
import { db, auth } from '../firebaseConfig.js'; 
import { collection, getDocs, query, where, addDoc, setDoc, doc } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import './LoginForm.css';
import { decryptPassword } from '../encryptPassword';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../firebasestuff/authContext.jsx'; // Importa tu contexto de autenticación

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const provider = new GoogleAuthProvider();
    const navigate = useNavigate();
    const { setUser, usernamePass, setUsernamePass, setUserDocId } = useContext(AuthContext); 
    const [recomendation, setRecomendation] = useState('hopla');

    // Función para crear colecciones adicionales como en el RegisterForm
    const createCollectionsForUser = async (userId) => {
        const configTemplate = {
            timesUsername: 2,
            timesPassword: 2,
            isActivatedNotif: true,
            isActivatedFeedback: true,
            isActivatedExercices: true,
            isActivatedReminds: true,
            feedbackTime: '12:00',
            exerciseTime: '12:00',
            remindTime: '12:00'
        };
        const answeredTemplate = {
            answeredExercises: [],
        };
        const defaultTemplate = {
            defaultExercises: [],
        };
        const defaultFlashcard = {
            defaultFlashcards: [],
        };

        try {
            await setDoc(doc(db, 'usuario', userId, 'config', 'configDoc'), configTemplate);
            await setDoc(doc(db, 'usuario', userId, 'answered', 'answeredDoc'), answeredTemplate);
            await setDoc(doc(db, 'usuario', userId, 'community', 'communityDoc'), defaultTemplate);
            await setDoc(doc(db, 'usuario', userId, 'flashcards', 'flashcardDoc'), defaultFlashcard);

            console.log('All collections created for user');
        } catch (error) {
            console.error("Error creating collections for user:", error);
        }
    };


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setUser(user);
                const usersRef = collection(db, 'usuario');
                const q = query(usersRef, where('email', '==', user.email));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    setUsernamePass(userDoc.data().username);
                    // Guardar el ID del documento del usuario
                    setUserDocId(userDoc.id);
                }
            }
        });
        return () => unsubscribe();
    }, [setUser, setUsernamePass]);

    // Iniciar sesión con Google y crear el documento de Firestore
    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const usersRef = collection(db, 'usuario');
            const q = query(usersRef, where("email", "==", user.email));
            const querySnapshot = await getDocs(q);

            // Si el usuario no existe, lo creamos
            if (querySnapshot.empty) {
                const newUserRef = await addDoc(usersRef, {
                    email: user.email,
                    username: user.displayName || user.email.split('@')[0], // Si no tiene displayName, usamos el email
                    password: 'none', // Asignamos "none" como contraseña
                    stars: 0,
                    nivel: "B1",
                });

                // Creamos las colecciones asociadas al usuario
                await createCollectionsForUser(newUserRef.id);

                // Guardar el userDocId en el contexto
                setUserDocId(newUserRef.id);

                // Redirigir al usuario a su examen o dashboard
                navigate('/exam');
            } else {
                const userDoc = querySnapshot.docs[0];
                setUserDocId(userDoc.id); // Guardar el userDocId existente
                const userData = userDoc.data();

                // Verificamos el nivel y redirigimos
                if (!userData.nivel) {
                    navigate('/exam');
                } else {
                    navigate('/dashboard', { state: { recomendation } });
                }
            }
        } catch (error) {
            setError(error.message);
        }
    };

    // Iniciar sesión con nombre de usuario y contraseña
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const q = query(collection(db, "usuario"), where("username", "==", username));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError("Username not found");
                return;
            }

            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            
            // Asignar el userDocId
            setUserDocId(userDoc.id); // Aquí asignamos el ID del documento al contexto
            setUsernamePass(userData.username);

            // Comparar la contraseña desencriptada con la ingresada por el usuario
            if (decryptPassword(userData.password) === password) {
                console.log('Login successful:', userData);
                setUser(userData);
                
                // Redirigir dependiendo del nivel del usuario
                if (!userData.nivel) {
                    navigate('/exam');
                } else {
                    navigate('/dashboard', { state: { recomendation } });
                }
            } else {
                setError("Contraseña Incorrecta");
            }
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h1>Krnel</h1>
                <h2>Iniciar sesión</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username">Nombre de usuario</label>
                        <div className="input-container">
                            <input 
                                type="username" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                maxLength={50}
                                required
                            />
                            <p>{username.length}/50</p>
                        </div>
                    </div>
                    <div>
                        <label>Contraseña</label>
                        <div className="input-container">
                            <input 
                                type="password" 
                                id="password"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                            />
                            <p>{password.length}/50</p>
                        </div>
                    </div>

                    {error && <div style={{ color: 'red', fontFamily: "Figtree" }}>{error}</div>}
                    <div className="button-container">
                        <button type="submit">Entrar</button>
                        <button type="button" onClick={handleGoogleSignIn}>Registrarse con Google</button>
                    </div>
                </form>

                <a href="/forgot-password">¿Olvidaste tu contraseña?</a>
            </div>
            <div className="register-section">
                <p>¿Todavía no tienes cuenta? <a href="/register" className='custom-link'>¡Regístrate!</a></p>
                <p><img src='/icons/loginauthimage.svg' height={250} width={250}></img></p>
            </div>
        </div>
    );
};

export default LoginForm;
