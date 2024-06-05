import React, { useState } from 'react';
import { db, auth } from '../firebaseConfig'; 
import { collection, addDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import './RegisterForm.css';
import { useNavigate } from 'react-router-dom';

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
            const q = query(usersRef, where("email", "==", user.email));
            const qu = query(usersRef, where("username", "==", username))
            const querySnapshot = await getDocs(q,qu);

            if (querySnapshot.empty)
                {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    await sendEmailVerification(userCredential.user);

                     await addDoc(collection(db, 'usuario'), {
                      password: user.pass,
                      email: user.email,
                      username: user.username,
                     stars: 0,
                      nivel: "B1",
          });
                }
          

          
          setError('Registro exitoso. Por favor, verifica tu correo electrónico.');
        } catch (error) {
          setError(`Error: ${error}`);
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
                            type="username" 
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
                    <button onClick={() => navigate(-1)}>Regresar</button>
                    </div>
                </form>
                
                
            </div>
            <div className="register-section">
                 <p className='image-loginp'><img src='/icons/registerimage.svg'height={250} width={240} /> </p>
            </div>
        </div>
    );

   
};

export default RegisterForm;