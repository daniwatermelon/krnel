import React, { useState } from 'react';
import { db, auth } from '../firebaseConfig.js'; 
import { collection, addDoc, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import './RegisterForm.css';
import { useNavigate } from 'react-router-dom';
import { encryptPassword } from '../encryptPassword.js';

const RegisterForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [email, setEmail] = useState('');
    const [securityMessage, setSecurityMessage] = useState('');
    const [error, setError] = useState(null); // Para mostrar errores
    const [success, setSuccess] = useState(null); // Para mostrar mensajes de éxito
    const navigate = useNavigate();

    const getPasswordSecurity = (password, username) => {
        if (password.length < 8) return 'Débil';
        if (password.includes(username)) return 'Débil';

        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[-.,_]/.test(password);
        const typesCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;
        
        if (password.length === 8 && typesCount >= 2) return 'Buena';
        if (password.length >= 8 && password.length <= 12 && typesCount > 2) return 'Fuerte';
        return 'Débil';
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        const securityLevel = getPasswordSecurity(e.target.value, username);
        setSecurityMessage(`Nivel de seguridad de la contraseña: ${securityLevel}`);
    };

    //CREAR COLECCIONES PARA LOS USUARIOS DE CONFIG Y EJERCICIOS CONTESTADOS
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
            console.log('All subcollections created for user:', userId);
        } catch (error) {
            console.error("Error creating collections for user " + { userId } + ":", error);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== passwordConfirmation) {
            setError('Las contraseñas no coinciden.');
            setSuccess(null);
            return;
        }

        try {
            const usersRef = collection(db, 'usuario');
            const emailQuery = query(usersRef, where("email", "==", email));
            const usernameQuery = query(usersRef, where("username", "==", username));
            
            const emailSnapshot = await getDocs(emailQuery);
            const usernameSnapshot = await getDocs(usernameQuery);

            if (emailSnapshot.empty && usernameSnapshot.empty) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const encryptedPassword = encryptPassword(password);
                const newUserRef = await addDoc(collection(db, 'usuario'), {
                    password: encryptedPassword,
                    email: email,
                    username: username,
                    stars: 0,
                    nivel: "",
                });

                await createCollectionsForUser(newUserRef.id);
                
                setError(null);
                setSuccess('Registro exitoso.');
            } else {
                setError('El correo electrónico o el nombre de usuario ya están en uso.');
                setSuccess(null);
            }
        } catch (error) {
            setError(error.message);
            setSuccess(null);
        }
    };

    const passwordSecurity = getPasswordSecurity(password, username);

    let messageColor;
    switch (passwordSecurity) {
        case 'Buena':
            messageColor = 'green';
            break;
        case 'Fuerte':
            messageColor = 'blue';
            break;
        default:
            messageColor = 'red';
    }

    return (
        <div className="login-container">
            <div className="login-form">
                <h1>Krnel</h1>
                <h2>Bienvenid@ a Krnel</h2>
                <form onSubmit={handleRegister}>
                    <div>
                        <label htmlFor="username">Nombre de usuario</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required
                        />
                    </div>
                   
                    <div>
                        <label>Correo</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required
                        />
                    </div>

                    <div>
                        <label>Contraseña</label>
                        <input 
                            type="password" 
                            id="password"
                            value={password} 
                            onChange={handlePasswordChange} 
                            required
                        />
                    </div>

                    <div>
                        <label>Confirma tu contraseña</label>
                        <input 
                            type="password" 
                            id="passwordconfirmation"
                            value={passwordConfirmation} 
                            onChange={(e) => setPasswordConfirmation(e.target.value)} 
                            required
                        />
                    </div>

                    <div style={{ color: messageColor }}>
                        {securityMessage}
                    </div>
                    
                    {error && <div style={{ color: 'red', fontFamily: "Figtree" }}>{error}</div>}
                    {success && <div style={{ color: 'green', fontFamily: "Figtree" }}>{success}</div>}
                    
                    <div className='button-container'>
                        <button type='submit'>Registrarse</button>
                        <button type='button' onClick={() => navigate(-1)}>Regresar</button>
                    </div>
                </form>
            </div>
            <div className="register-section">
                <p className='image-loginp'><img src='/icons/registerimage.svg' height={250} width={240} alt="Register" /></p>
            </div>
        </div>
    );
};

export default RegisterForm;
