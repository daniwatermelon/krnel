// import React, { createContext, useState, useEffect } from 'react';
// import { auth, db } from '../firebaseConfig';
// import { doc, getDoc } from 'firebase/firestore'; 

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null); // Objeto de usuario de Firebase Auth
//     const [usernamePass, setUsernamePass] = useState(''); // Solo para mostrar el nombre de usuario
//     const [userDocId, setUserDocId] = useState(''); // ID del documento en Firestore

//     useEffect(() => {
//         const unsubscribe = auth.onAuthStateChanged(async (user) => {
//             if (user) {
//                 setUser(user); // Aquí setUser está definido correctamente
//                 // Obtén el documento del usuario desde Firestore
//                 const usersRef = doc(db, 'usuario', user.uid);
//                 const userDoc = await getDoc(usersRef);
//                 if (userDoc.exists()) {
//                     const userData = userDoc.data();
//                     setUsernamePass(userData.username); // Asigna el nombre de usuario
//                     setUserDocId(userDoc.id); // Guarda el ID del documento de Firestore
//                 }
//             }
//         });

//         return () => unsubscribe();
//     }, []);

//     return (
//         <AuthContext.Provider value={{ user, setUser, usernamePass, setUsernamePass, userDocId }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };
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
