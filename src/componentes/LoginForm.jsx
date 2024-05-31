
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Asegúrate de importar auth desde tu archivo de configuración

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const userCredential = await signInWithEmailAndPassword(auth, username, password);
            console.log('Login successful:', userCredential.user);
            // aqui va el inicio de sesion exitoso
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <form className='card card-body' onSubmit={handleSubmit}>
            <div>
                <label htmlFor="username">Username</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <button type="submit">Login</button>
        </form>
    );
};

export default LoginForm;
