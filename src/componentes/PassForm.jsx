import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PassForm.css'; // Asegúrate de tener el archivo de estilos si es necesario
import axios from 'axios';
const PassForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    try {
      const response = await axios.post('http://localhost:3001/send-email', {
        to: email,
        subject: 'Aquí está el código para recuperar tu contraseña',
        text: 'Código: 782421',
      });
      console.log('Email sent:', response.data);
      setSuccess(true);
      setError(null);
    } catch (error) {
      console.error('Error sending email:', error);
      setError('Error sending email');
      setSuccess(false);
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
