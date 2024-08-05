import React, { useState, useEffect, useContext } from 'react';
import { db, auth } from '../firebaseConfig'; 
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
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
    const { setUser, usernamePass, setUsernamePass } = useContext(AuthContext); // Usa el contexto de autenticación

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                setUser(user);
                setUsernamePass(usernamePass);
                navigate('/dashboard'); // Redirige al usuario a la ventana de inicio después del inicio de sesión
            }
        });
        return () => unsubscribe();
    }, [navigate, setUser, setUsernamePass]);

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log('Google sign-in successful:', user);

            const usersRef = collection(db, 'usuario');
            const q = query(usersRef, where("email", "==", user.email));
            const querySnapshot = await getDocs(q);
             setUsernamePass(user.displayName) ;
            if (querySnapshot.empty) {
                await addDoc(usersRef, {
                    email: user.email,
                    username: user.displayName,
                    stars: 0,
                    nivel: "B1",
                    
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
            const q = query(collection(db, "usuario"), where("username", "==", username));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError("Username not found");
                return;
            }

            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            setUsernamePass(userData.username);

            if (decryptPassword(userData.password) === password) {
                console.log('Login successful:', userData);
                console.log(userData.username);
                setUser(userData); // Actualiza el contexto con la información del usuario
                navigate('/dashboard'); // Redirige al usuario a la ventana de inicio
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
                        <button type="button" className='buttongoogle' onClick={handleGoogleSignIn}>Registrarse con Google</button>
                    </div>
                </form>

                <a className="forgotpassword"href="/forgot-password">¿Olvidaste tu contraseña?</a>
            </div>
            <div className="register-section">
                <p>¿Todavía no tienes cuenta? <a href="/register" className='custom-link'>¡Regístrate!</a></p>
                <p><img src='/icons/loginauthimage.svg' height={250} width={250}></img></p>
            </div>
        </div>
    );
};

export default LoginForm;
