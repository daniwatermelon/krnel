import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig.js';
import { collection, getDocs, query, where, runTransaction, doc } from "firebase/firestore";
import axios from 'axios';
import './PassForm.css'; 
import { encryptPassword } from '../encryptPassword.js'; // Importa la función de encriptación


const PassForm = () => {
  const navigate = useNavigate();
  const [securityMessage,setSecurityMessage] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordAgain, setNewPasswordAgain] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const getPasswordSecurity = () => {
    if (newPassword.length < 8) return 'Débil';
    if (newPassword.includes(username)) return 'Débil';

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecialChar = /[-.,_]/.test(newPassword);
    const typesCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;
    
    if (newPassword.length === 8 && typesCount >= 2) return 'Buena';
    if (newPassword.length >= 8 && newPassword.length <= 12 && typesCount > 2) return 'Fuerte';

    
};

const getUserName = async () => {
  try {
    const userRef = collection(db, 'usuario');
    const q = query(userRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        setUsername(doc.data().username); // Asumiendo que el campo de nombre se llama 'name'
      });
      setError(null);
    } else {
      setError('Email no encontrado');
      setName('');
    }
  } catch (error) {
    console.error('Error obteniendo el nombre:', error);
    setError('Error obteniendo el nombre');
    setName('');
  }
};

  useEffect(() => {
    let timer;
    if (success) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime > 0) {
            return prevTime - 1;
          } else {
            // Reset timer and send a new code
            sendEmail();
            return 600; // Reset to 10 minutes
          }
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [success]);

  const sendEmail = async () => {

      try {
        const response = await axios.post('http://localhost:3001/send-email', {
          to: email,
          subject: 'Aquí está el código para recuperar tu contraseña ' + getCurrentTime(),
        });
        console.log('Email sent:', response.data);
        setSuccess(true);
        setError(null);
        setIsPasswordChanged(false);
        setTimeLeft(600); // Reset the timer whenever an email is sent
      } catch (error) {
        console.error('Error sending email:', error);
        setError('Error sending email');
        setSuccess(false);
      }
  };

  function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/verify-code', { code: inputCode });
      if (response.status === 200) {
        console.log('Code verified successfully');
        getUserName()
        setIsCodeVerified(true); // Set the code verification state to true
      } else {
        setError('Invalid code');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setError('Error verifying code');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    try {
      const userRef = collection(db, 'usuario');
      const q = query(userRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Enviar el correo si el correo existe
        await sendEmail();
      } else {
        console.error('Email does not exist');
        setError('Email does not exist');
        setSuccess(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error checking email or sending email');
      setSuccess(false);
    }
  };

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
    const securityLevel = getPasswordSecurity(e.target.value, username);
    setSecurityMessage(`Nivel de seguridad de la contraseña: ${securityLevel}`);
};




  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== newPasswordAgain) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    try {
      const userRef = collection(db, 'usuario');
      const q = query(userRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (document) => {
          await runTransaction(db, async (transaction) => {
            const docRef = doc(db, 'usuario', document.id);
            const docSnapshot = await transaction.get(docRef);
            if (!docSnapshot.exists()) {
              throw "El documento no existe!";
            }
            transaction.update(docRef, { password: encryptPassword(newPassword) });
            setIsPasswordChanged(true);
          });
          console.log("Nombre de usuario actualizado con éxito");
        });
        setError(null);
      } else {
        console.error('Email no encontrado');
        setError('Email no encontrado');
      }
    } catch (error) {
      console.error('Error actualizando el nombre de usuario:', error);
      setError('Error actualizando el nombre de usuario');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const passwordSecurity = getPasswordSecurity(newPassword, username);

  let messageColor;
  switch (passwordSecurity) {
      case 'Buena':
          messageColor = 'green';
          break;
      case 'Fuerte':
          messageColor = 'blue';
          break;
      default:
          messageColor = 'red';
  }
  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Krnel</h1>
        <h2>Recuperar contraseña</h2>
        
        {isPasswordChanged ? (
          <div>
            <h3 style={{ color: 'green' }}>Contraseña cambiada con éxito</h3>
            <button onClick={() => navigate('/')}>Volver al inicio</button>
          </div>
        ) :
        isCodeVerified ? (
          
          <form onSubmit={handleChangePassword}>
            <div>
                <label htmlFor='new-password' style={{ color: 'black' }}>Ingresa tu nueva contraseña:</label>
                <input 
                  type='password'
                  value={newPassword}
                  onChange={handlePasswordChange}
                />
            </div>
            
            <div>
                <label htmlFor='new-password-confirm' style={{ color: 'black' }}>Ingresa tu nueva contraseña:</label>
                <input 
                  type='password'
                  value={newPasswordAgain}
                  onChange={(e) => setNewPasswordAgain(e.target.value)}
                />
            </div>
            
            <div className='button-container'>
              <button type='submit'>Cambiar Contraseña</button>
              <button type='button' onClick={() => navigate(-1)}>Cancelar</button>
            </div>
            <div style={{ color: messageColor }}>
                        {securityMessage}
                    </div>
            {error && <div style={{ color: 'red', fontFamily: 'Figtree' }}>{error}</div>}
            
          </form>
        ) : success ? (
          <form onSubmit={handleCodeSubmit}>
            <label htmlFor='code' style={{ color: 'black' }}>Ingresa el código enviado a tu email:</label>
            <input 
              type='text'
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
            />
            <div className='button-container'>
              <button type='submit'>Verificar Código</button>
              <button type='button' onClick={() => navigate(-1)}>Regresar</button>
            </div>
            <div className='button-container'>
              <button style={{color: 'white', minWidth: '300'}} type= 'button' onClick={sendEmail}>Volver a enviar código</button>
            </div>
            {error && <div style={{ color: 'red', fontFamily: 'Figtree' }}>{error}</div>}
            <div style={{ color: 'blue', marginTop: '10px' }}>Tiempo restante: {formatTime(timeLeft)}</div>
          </form>
        ) : (
          
          <form onSubmit={handleSubmit}>
            <div>
            <label htmlFor='email' style={{ color: 'white' }}>Ingresa tu email:</label>
            <input 
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={50}
            />
            <p style={{textAlign: 'right'}}>{email.length} /50</p>
            </div>
            <div className='button-container'>
              <button type='submit'>Enviar Código</button>
              <button type='button' onClick={() => navigate(-1)}>Regresar</button>
            </div>
            {error && <div style={{ color: 'red', fontFamily: 'Figtree' }}>{error}</div>}
          </form>
        )}
      </div>
      <div className="register-section">
        <p className='image-loginp'><img src='/icons/forgotpasswordimage.svg' height={250} width={240} alt="Register" /></p>
      </div>
    </div>
  );
};

export default PassForm;