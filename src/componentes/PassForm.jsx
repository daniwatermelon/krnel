import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import sendPasswordResetEmail from './sendPasswordResetEmail'; // Importa la función para enviar el correo electrónico de restablecimiento de contraseña
import './PassForm.css'; // Asegúrate de tener el archivo de estilos si es necesario

const PassForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(email); // Llama a la función para enviar el correo electrónico de restablecimiento de contraseña
      setSuccess(true);
      setError(null); // Restablece el error si la solicitud fue exitosa
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Krnel</h1>
        <h2>Recuperar contraseña</h2>
        
        {success ? (
          <p>Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor='email' style={{ color: 'white' }}>Ingresa tu email:</label>
            <input 
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
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
