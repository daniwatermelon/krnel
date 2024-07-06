import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../firebaseConfig'; // Importa tu configuración de auth

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [usernamePass, setUsernamePass] = useState('');


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, usernamePass, setUsernamePass }}>
            {children}
        </AuthContext.Provider>
    );
};
