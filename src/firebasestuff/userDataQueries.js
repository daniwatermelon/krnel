import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { AuthContext } from './authContext';


// Función para consultar la colección "users"
// const getUsers = async (username) => {
    
//   const usersCollection = collection(db, 'usuario');  
//   const q = query(usersCollection, where('username', '==', username));
//   const querySnapshot = await getDocs(q);
//   const users = querySnapshot.docs.map(doc => doc.data());
//   return users[0];
// };

const getUserWithConfig = async (username) => {
  const usersCollection = collection(db, 'usuario');
  const q = query(usersCollection, where('username', '==', username));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    // Obtener el documento `configDoc` de la subcolección `config`
    const configDocRef = doc(db, 'usuario', userDoc.id, 'config', 'configDoc');
    const configDocSnapshot = await getDoc(configDocRef);
    
    if (configDocSnapshot.exists()) {
      userData.config = configDocSnapshot.data();
    } else {
      userData.config = null; // Manejar el caso donde no existe `configDoc`
    }
    
    return userData;
  } else {
    throw new Error('Usuario no encontrado');
  }
};

// Función principal para obtener datos de varias colecciones
const getDataFromCollections = async (username) => {
  try {
    const [users] = await Promise.all([getUserWithConfig(username)]);
    return { users };
  } catch (error) {
    console.error('Error getting documents: ', error);
    throw error;
  }
};

export { getDataFromCollections};
