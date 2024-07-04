import React, { useState } from 'react';
import { db, auth } from '../firebaseConfig'; 
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import './LoginForm.css';
import { decryptPassword } from '../encryptPassword';

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const provider = new GoogleAuthProvider();

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log('Google sign-in successful:', user);

            // Verifica si el usuario ya existe en tu base de datos
            const usersRef = collection(db, 'usuario');
            const q = query(usersRef, where("email", "==", user.email));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                // Si el usuario no existe, crea un nuevo documento con su información
                await addDoc(usersRef, {
                    email: user.email,
                    username: user.displayName,
                    stars: 0,
                    nivel: "B1",
                    // Agrega cualquier otra información que desees almacenar sobre el usuario
                });
                console.log('User created in Firestore:', user.email);
            } else {
                console.log('User already exists in Firestore:', user.email);
                
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            // Consulta para encontrar el documento con el username
            const q = query(collection(db, "usuario"), where("username", "==", username));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError("Username not found");
                return;
            }

            // Supongamos que solo hay un documento que coincide con el username
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            if (decryptPassword(userData.password) === password) {
                console.log('Login successful:', userData);
                // Aquí puedes manejar lo que sucede después de un inicio de sesión exitoso
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
