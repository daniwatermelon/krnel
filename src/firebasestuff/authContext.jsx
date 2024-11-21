import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [usernamePass, setUsernamePass] = useState('');
    const [userDocId, setUserDocId] = useState('');  // Definir el estado userDocId

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, usernamePass, setUsernamePass, userDocId, setUserDocId }}>
            {children}
        </AuthContext.Provider>
    );
};
