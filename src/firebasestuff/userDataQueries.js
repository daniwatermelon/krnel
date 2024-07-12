import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { AuthContext } from './authContext';


// Función para consultar la colección "users"
const getUsers = async (username) => {
    
  const usersCollection = collection(db, 'usuario');
  const q = query(usersCollection, where('username', '==', username));
  const querySnapshot = await getDocs(q);
  const users = querySnapshot.docs.map(doc => doc.data());
  return users[0];
};

// // Función para consultar la colección "posts"
// const getPosts = async () => {
//   const postsCollection = collection(db, 'posts');
//   const q = query(postsCollection, where('published', '==', true));
//   const querySnapshot = await getDocs(q);
//   const posts = querySnapshot.docs.map(doc => doc.data());
//   return posts;
// };

// Función principal para obtener datos de varias colecciones
const getDataFromCollections = async (username) => {
  try {
    const [users] = await Promise.all([getUsers(username)]);
    return { users };
  } catch (error) {
    console.error('Error getting documents: ', error);
    throw error;
  }
};

export { getDataFromCollections};
