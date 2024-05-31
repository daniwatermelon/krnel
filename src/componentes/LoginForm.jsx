import React, { useState } from 'react';
import { db } from '../firebaseConfig'; //importar archivo de config
import { collection, query, where, getDocs } from "firebase/firestore";

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            //consulta para encontrar el documento con el username
            const q = query(collection(db, "usuario"), where("username", "==", username));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError("Username not found");
                return;
            }

            //Supongamos que solo hay un documento que coincide con el username
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            if (userData.password === password) {
                console.log('Login successful:', userData);
                //QUE PASA SI EL LOGIN ES EXITOSO
            } else {
                setError("Incorrect password");
            }
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
