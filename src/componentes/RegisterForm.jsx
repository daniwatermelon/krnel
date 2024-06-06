import React, { useState } from 'react';
import { db, auth } from '../firebaseConfig.js'; 
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import './RegisterForm.css';
import { useNavigate } from 'react-router-dom';
import { encryptPassword } from '../encryptPassword.js'; // Importa la función de encriptación
const RegisterForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const usersRef = collection(db, 'usuario');
            const emailQuery = query(usersRef, where("email", "==", email));
            const usernameQuery = query(usersRef, where("username", "==", username));
            
            const emailSnapshot = await getDocs(emailQuery);
            const usernameSnapshot = await getDocs(usernameQuery);

            if (emailSnapshot.empty && usernameSnapshot.empty) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const encryptedPassword = encryptPassword(password);
                await addDoc(collection(db, 'usuario'), {
                    password: encryptedPassword,
                    email: email,
                    username: username,
                    stars: 0,
                    nivel: "B1",
                });

                setError('Registro exitoso.');
            } else {
                setError('El correo electrónico o el nombre de usuario ya están en uso.');
            }
        } catch (error) {
            setError(`Error: ${error.message}`);
        }
    };

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
                        <label>Contraseña</label>
                        <input 
                            type="password" 
                            id="password"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
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
                    {error && <div style={{ color: 'red', fontFamily: "Figtree" }}>{error}</div>}
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
