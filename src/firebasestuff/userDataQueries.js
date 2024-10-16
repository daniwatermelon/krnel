import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
// Función para obtener el documento de usuario y su configuración
const getUserWithConfig = async (userDocId) => {
  // Acceder directamente al documento por su ID
  const userDocRef = doc(db, 'usuario', userDocId);
  const userDocSnapshot = await getDoc(userDocRef);
  
  if (userDocSnapshot.exists()) {
    const userData = userDocSnapshot.data();

    // Obtener el documento `configDoc` de la subcolección `config`
    const configDocRef = doc(db, 'usuario', userDocId, 'config', 'configDoc');
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
const getDataFromCollections = async (userDocId) => {
  try {
    const [users] = await Promise.all([getUserWithConfig(userDocId)]);
    return { users };
  } catch (error) {
    console.error('Error getting documents: ', error);
    throw error;
  }
};

export { getDataFromCollections };
  