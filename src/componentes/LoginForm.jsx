import React, { useState, useEffect, useContext } from 'react';
import { db, auth } from '../firebaseConfig.js'; 
import { collection, getDocs, query, where, addDoc, setDoc, doc } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import axios from 'axios';
import './LoginForm.css';
import { decryptPassword } from '../encryptPassword';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../firebasestuff/authContext.jsx';


const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: 'select_account' 
    });
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
            await setDoc(doc(db, 'usuario', userId, 'community', 'communityDoc'), defaultTemplate);
            await setDoc(doc(db, 'usuario', userId, 'flashcards', 'flashcardDoc'), defaultFlashcard);
            await setDoc(doc(db, 'usuario', userId, 'answered', 'gramatica'), answeredTemplate);
            await setDoc(doc(db, 'usuario', userId, 'answered', 'pronunciacion'), answeredTemplate);
            await setDoc(doc(db, 'usuario', userId, 'answered', 'vocabulario'), answeredTemplate);
            await setDoc(doc(db, 'usuario', userId, 'answered', 'comprensionlectora'), answeredTemplate);
            await setDoc(doc(db, 'usuario', userId, 'answered', 'comprensionauditiva'), answeredTemplate);

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

                try {
                    const response = await axios.post('http://localhost:3001/send-email-register', {
                      to: user.email,
                    });
                    console.log('Email sent:', response.data);
                  } catch (error) {
                    console.error('Error sending email:', error);
                    setError('Error enviando email de registro');
                  }

                navigate('/exam');
            } else {
                const userDoc = querySnapshot.docs[0];
                setUserDocId(userDoc.id);
                const userData = userDoc.data();

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
                
                if(userData.admin)
                {
                    navigate('/admindashboard')
                }
                else{
                    if (!userData.nivel) {
                        navigate('/exam');
                    } else {
                        navigate('/dashboard', { state: { recomendation } });
                    }
                }
                
            } else {
                setError("Incorrect password");
            }
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h1>Krnel</h1>
                <h2>Sign In</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username">Username</label>
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
                        <label>Password</label>
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
                        <button type="submit">Sign In</button>
                        <button type="button" onClick={handleGoogleSignIn}>Sign in with Google</button>
                    </div>
                </form>

                <a href="/forgot-password">Forgot your password?</a>
            </div>
            <div className="register-section">
                <p>You don't have an account yet? <a href="/register" className='custom-link'>Register now!</a></p>
                <p><img src='/icons/loginauthimage.svg' height={250} width={250}></img></p>
            </div>
        </div>
    );
};

export default LoginForm;
