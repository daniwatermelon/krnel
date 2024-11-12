import React, { useState } from 'react';
import { db, auth } from '../firebaseConfig.js'; 
import { collection, addDoc, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import './RegisterForm.css';
import { useNavigate } from 'react-router-dom';
import { encryptPassword } from '../encryptPassword.js';
import axios from 'axios';

const RegisterForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [email, setEmail] = useState('');
    const [securityMessage, setSecurityMessage] = useState('');
    const [error, setError] = useState(null); // Para mostrar errores
    const [success, setSuccess] = useState(null); // Para mostrar mensajes de éxito
    const [hasSpaceInUsername, setHasSpaceInUsername] = useState(false); // Estado para detectar espacios en username
    const [hasInvalidChars, setHasInvalidChars] = useState(false);
    const navigate = useNavigate();

    const getPasswordSecurity = (password, username) => {
        if (password.length < 8) return 'Weak';
        if (password.includes(username)) return 'Weak';

        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[-.,_]/.test(password);
        const typesCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;
        
        if (password.length === 8 && typesCount >= 2) return 'Good';
        if (password.length >= 8 && password.length <= 12 && typesCount > 2) return 'Strong';
        return 'Weak';
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        const securityLevel = getPasswordSecurity(e.target.value, username);
        setSecurityMessage(`Password security Level: ${securityLevel}`);
    };

    // Verificar si el nombre de usuario contiene espacios
    const handleUsernameChange = (e) => {
        const value = e.target.value;
    
        const isValidUsername = /^[a-zA-Z0-9.,-]*$/.test(value);
    
        if (isValidUsername) {
            setUsername(value);
        }

        // Detectar si tiene caracteres inválidos
        setHasInvalidChars(!isValidUsername);
    };

    //CREAR COLECCIONES PARA LOS USUARIOS DE CONFIG Y EJERCICIOS CONTESTADOS
    const createCollectionsForUser = async (userId) => {
        const today = new Date(); // Fecha de creación de la cuenta

        const configTemplate = {
            timesUsername: 2,
            timesPassword: 2,
            isActivatedNotif: true,
            isActivatedFeedback: true,
            isActivatedExercices: true,
            isActivatedReminds: true,
            feedbackTime: '12:00',
            exerciseTime: '12:00',
            remindTime: '18:00',
            feedbackInstantly: true,
            exerciseInstantly: true,
            
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

        const emptyTemplate = {
        };

        const remindTemplate = {
            dates: [
                today.toISOString().split('T')[0],
                new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            ],
            answers: Array(7).fill(false)
        };

        try {
            await setDoc(doc(db, 'usuario', userId, 'config', 'remindDoc'), remindTemplate);
            await setDoc(doc(db, 'usuario', userId, 'config', 'configDoc'), configTemplate);
            await setDoc(doc(db, 'usuario', userId, 'community', 'communityDoc'), defaultTemplate);
            await setDoc(doc(db, 'usuario', userId, 'flashcards', 'flashcardDoc'), defaultFlashcard);
            await setDoc(doc(db, 'usuario', userId, 'answered', 'gramatica'), answeredTemplate);
            await setDoc(doc(db, 'usuario', userId, 'answered', 'pronunciacion'), answeredTemplate);
            await setDoc(doc(db, 'usuario', userId, 'answered', 'vocabulario'), answeredTemplate);
            await setDoc(doc(db, 'usuario', userId, 'answered', 'comprensionlectora'), answeredTemplate);
            await setDoc(doc(db, 'usuario', userId, 'answered', 'comprensionauditiva'), answeredTemplate);
            await setDoc(doc(db, 'usuario', userId, 'failed', 'failedEX'), emptyTemplate);
            await setDoc(doc(db, 'usuario', userId, 'answered', 'answeredEX'), emptyTemplate);
            
            console.log('All subcollections created for user:', userId);
        } catch (error) {
            console.error("Error creating collections for user " + { userId } + ":", error);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const url = `https://emailvalidation.abstractapi.com/v1/?api_key=1eeeacce8186431f98675efb37e6e5ce&email=${email}`;

        if (password !== passwordConfirmation) {
            setError('The passwords dont match.');
            setSuccess(null);
            return;
        }

        try {

            try {
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.is_valid_format.value && data.deliverability === "DELIVERABLE") {
                    console.log("The email is valid.");
                } else {
                    console.log("The email is not valid.");
                    setError("El correo electrónico no es válido")
                    return;
                }
            } catch (error) {
                console.error("Error verificando el correo electrónico:", error);
                setError("An error happened while verifying email")
                return;
            }

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
                setSuccess('your account has been registered.');
                try {
                    const response = await axios.post('http://localhost:3001/send-email-register', {
                      to: email,
                    });
                    console.log('Email sent:', response.data);
                  } catch (error) {
                    console.error('Error sending email:', error);
                    setError('Error sending email');
                  }
            } else {
                setError('The email or username is already in use.');
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
        case 'Good':
            messageColor = 'green';
            break;
        case 'Strong':
            messageColor = 'blue';
            break;
        default:
            messageColor = 'red';
    }

    return (
        <div className="login-container">
            <div className="login-form">
                <h1>Krnel</h1>
                <h2>Welcome to Krnel!</h2>
                <form onSubmit={handleRegister}>
                    <div>
                        <label htmlFor="username">Username</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={handleUsernameChange} 
                            required
                        />
                        {hasInvalidChars && <p className="error">Username can only contain letters, numbers, hyphens, commas and periods.</p>}

                        {hasSpaceInUsername && <div style={{ color: 'red' }}>The username cannot contain spaces.</div>}
                    </div>
                   
                    <div>
                        <label>Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required
                        />
                    </div>

                    <div>
                        <label>Password</label>
                        <input 
                            type="password" 
                            id="password"
                            value={password} 
                            onChange={handlePasswordChange} 
                            required
                        />
                    </div>

                    <div>
                        <label>Confirm your password</label>
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
                        <button type='submit' disabled={hasSpaceInUsername}>Register</button>
                        <button type='button' onClick={() => navigate(-1)}>Go back</button>
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
