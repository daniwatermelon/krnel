import { db, auth } from '../firebaseConfig'; 

const sendPasswordResetEmail = async (email) => {
  try {
    // Verifica si el correo electrónico existe en la base de datos Firestore
    const userRef = await db.collection('usuario').where('email', '==', email).get();
    if (userRef.empty) {
      throw new Error('El correo electrónico no está registrado en la base de datos.');
    }
    const userId = userRef.docs[0].id;
    
    // Envía el correo de restablecimiento de contraseña utilizando el correo electrónico proporcionado
    await auth.sendPasswordResetEmail(email);
    
    // Registro exitoso
    console.log('Email de restablecimiento de contraseña enviado');
    return true;
  } catch (error) {
    // Error al enviar el email de restablecimiento de contraseña
    console.error('Error al enviar el email de restablecimiento de contraseña:', error);
    return false;
  }
};

export default sendPasswordResetEmail;
