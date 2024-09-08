import React, {  useContext, useState, useEffect } from 'react';
import { db } from '../firebaseConfig.js';
import signOutUser from '../firebasestuff/auth_signout';
import { useNavigate, useLocation } from 'react-router-dom';
import './Settings.css';
import axios from 'axios';

import { AuthContext } from '../firebasestuff/authContext';
import {  encryptPassword } from '../encryptPassword';
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

const Settings = () => {
    const { state } = useLocation();
    const { users: userData } = state.settingsdata;
    const { usernamePass } = useContext(AuthContext);

    const [exercisesTime, setExercisesTime] = useState('');
    const [feedbackTime, setFeedbackTime] = useState('');
    const [remindTime, setRemindTime] = useState('');
    const [notif, setNotif] = useState(true);
    const [notifRemind, setNotifRemind] = useState(true);
    const [notifFeedback, setNotifFeedback] = useState(true);
    const [notifExercises, setNotifExercises] = useState(true);
    const [emailSettings, setEmail] = useState('');
    const [usernameSettings, setUsername] = useState('');
    const [currentPassword, setCurrentPassword] = useState(''); 
    const [newPassword, setNewPassword] = useState(''); 
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState(null);
    const [errorColor, setMessageColor] = useState(''); // Para controlar el color del mensaje
    const [usernameTimes, setUsernameTimes] = useState();
    const [passwordTimes, setPasswordTimes] = useState();
    const [isEditing, setIsEditing] = useState(false);
    const [securityMessage, setSecurityMessage] = useState('');

    useEffect(() => {
        if (userData) {
            setExercisesTime(userData.config.exerciseTime || '');
            setFeedbackTime(userData.config.feedbackTime || '');
            setRemindTime(userData.config.remindTime || '');
            setNotif(!!userData.config.isActivatedNotif)
            setNotifRemind(!!userData.config.isActivatedReminds);
            setNotifFeedback(!!userData.config.isActivatedFeedback);
            setNotifExercises(!!userData.config.isActivatedExercices);
            setUsernameTimes(userData.config.timesUsername || 0);
            setPasswordTimes(userData.config.timesPassword || 0);
    
            setEmail(userData.email || '');
            setUsername(userData.username || '');
        }
    }, [userData]);

    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    const handleSignOut = () => {
        signOutUser().then(() => {
            navigate('/'); 
        }).catch((error) => {
            console.error('An error happened during sign-out:', error);
        });
    };
    function getCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
      }
      
    const startEditing = (field) => {
        if (!isEditing) {
            setIsEditing(field);
        } else {
            setError('Por favor, guarda o cancela el cambio actual antes de editar otro campo.');
        }
    };
    
    const cancelEditing = () => {
        setIsEditing(false);
        setEmail(userData.email);
        setUsername(userData.username);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setError(null);
    };

    const getPasswordSecurity = (password, username) => {
        if (password.length < 8) return 'Débil';
        if (password.includes(username)) return 'Débil';

        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[-.,_]/.test(password);
        const typesCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;
        
        
        if (password.length === 8 && typesCount >= 2) return 'Buena';
        if (password.length >= 8 && password.length <= 12 && typesCount > 2) return 'Fuerte';
        return 'Débil';
    };

    const sendChangeEmail = async () => {

        try {
          const response = await axios.post('http://localhost:3001/send-change-email', {
            to: emailSettings,
            subject: 'Un nuevo correo se ha asociado a tu cuenta, esta cuenta le pertenece a  ' + emailSettings + ' correo cambiado a las ' + getCurrentTime(),
          });
          console.log('Email sent:', response.data);
          setError(null);
        } catch (error) {
          console.error('Error sending email:', error);
          setError('Error sending email');
        }
    };

    const handlePasswordChange = (e) => {
        setNewPassword(e.target.value);
        const securityLevel = getPasswordSecurity(e.target.value, usernamePass);
        setSecurityMessage(`Nivel de seguridad de la contraseña: ${securityLevel}`);
    };

    const saveAll = async () => {
        if (isEditing === 'password' && (newPassword !== confirmNewPassword)) {
            setError('Las nuevas contraseñas no coinciden.');
            setMessageColor('red'); // Mensaje en rojo para el error
            return;
        }
    
        try {
            const usersRef = collection(db, 'usuario');
            const q = query(usersRef, where('username', '==', usernamePass));
            const querySnapshot = await getDocs(q);
    
            if (!querySnapshot.empty) {
                const userDocRef = querySnapshot.docs[0].ref;
                const configDocRef = doc(userDocRef, "config", "configDoc");
    
                const updates = {};
    
                if (isEditing === 'username' && usernameTimes > 0) {
                    updates.username = usernameSettings;
                    setUsernameTimes(prev => prev - 1);
                } 
    
                if (isEditing === 'email') {
                    updates.email = emailSettings;
                    await sendChangeEmail();
                }
    
                if (isEditing === 'password' && passwordTimes > 0) {
                    if (userData.stars >= 200) {
                        updates.password = encryptPassword(newPassword);
                        setPasswordTimes(prev => prev - 1);
                    } else {
                        setError('Necesitas al menos 200 estrellas para cambiar la contraseña.');
                        setMessageColor('red'); // Mensaje en rojo para el error
                        return;
                    }
                }
    
                await updateDoc(userDocRef, updates);
    
                setError('Se actualizaron los datos del usuario correctamente.');
                setMessageColor('green'); // Mensaje en verde para éxito
    
                await updateDoc(configDocRef, {
                    'isActivatedNotif': notif,
                    'isActivatedExercices': notifExercises,
                    'isActivatedFeedback': notifFeedback,
                    'isActivatedReminds': notifRemind,
                    'exerciseTime': exercisesTime,
                    'feedbackTime': feedbackTime,
                    'remindTime': remindTime,
                  });
    
                setError('Se actualizaron los datos de configuración correctamente.');
                setMessageColor('green'); // Mensaje en verde para éxito
    
            } else {
                setError('Error al actualizar los datos.');
                setMessageColor('red'); // Mensaje en rojo para el error
            }
    
            setIsEditing(false);
        } catch (error) {
            setError('Ocurrió un error al actualizar los datos.');
            setMessageColor('red'); // Mensaje en rojo para el error
        }
    };

    const handleCheckboxChange = (e, type) => {
        const isChecked = e.target.checked;
        switch(type) {
            case 'notif':
                setNotif(isChecked);
                break;
            case 'remind':
                setNotifRemind(isChecked);
                break;
            case 'feedback':
                setNotifFeedback(isChecked);
                break;
            case 'exercises':
                setNotifExercises(isChecked);
                break;
        }
    };

    const refreshData = async () => {
        // Lógica para refrescar los datos si es necesario
    };

    const passwordSecurity = getPasswordSecurity(newPassword, usernamePass);

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
            <div className="profile-page">
                <header className="header">
                    <nav className="navbarsettings">
                        <ul>
                            <li>
                                <img src="../icons/image.png" style={{ height: 30, marginTop: 10 }} alt="Logo" />
                            </li>
                        </ul>
                        <h1 className="username-pass">{usernamePass}</h1>
                    </nav>
                </header>
                <div className="main-content">
                    <div className="toolbarsettings">
                        <img className="tab-buttons" src='../icons/return_icon.png' onClick={goBack} alt="Return"/>
                        <div className="logout-button">
                            <img className="tab-buttons" src="../icons/logout_icon.png" onClick={handleSignOut} alt="Logout" />
                        </div>
                    </div>
                    <div className="user-infosettings">
                        <h1>Configuración</h1>
                        <hr className='hr-profile'/>

                        <h2>Perfil</h2>
                        <div className="user-details">
                            <div>
                                {userData ? (
                                    <>
                                        <p className='username-advertisement'>Te quedan { usernameTimes} cambios de nombre de usuario</p>
                                        <p className='username-advertisement'>Te quedan {passwordTimes} cambios de contraseña</p>

                                        <div className='changingdata-class'>
                        <p className="user-name">Nombre de usuario: </p>
                        <p className='user-data-firestore'>{userData.username}</p>

                        {/* Solo permitir cambiar si usernameTimes > 0 */}
                        {usernameTimes > 0 ? (
                            <>
                                <button onClick={() => startEditing('username')} className='user-buttonsettings' disabled={isEditing && isEditing !== 'username'}>Cambiar</button>
                                {isEditing === 'username' && (
                                    <>
                                        <input 
                                            type='text' 
                                            id='inputusername' 
                                            onChange={(e) => setUsername(e.target.value)} 
                                            value={usernameSettings} 
                                            className='inputs-data' 
                                        />
                                        <button onClick={cancelEditing} className='user-buttonsettings'>Cancelar</button>
                                    </>
                                )}
                            </>
                        ) : (
                            <p className="user-warning">No puedes cambiar el nombre de usuario más veces.</p>
                        )}
                    </div>
                                        
                                        <div className='changingdata-class'>
                                            <p className="user-email">Correo: </p>
                                            <p className='user-data-firestore'>{userData.email}</p>
                                            <button onClick={() => startEditing('email')} className='user-buttonsettings' disabled={isEditing && isEditing !== 'email'}>Cambiar</button>
                                            {isEditing === 'email' && (
                                                <>
                                                    <input type='text' id='inputemail' onChange={(e) => setEmail(e.target.value)} value={emailSettings} className='inputs-data' />
                                                    <button onClick={cancelEditing} className='user-buttonsettings'>Cancelar</button>
                                                </>
                                            )}
                                        </div>

                                        <div className='changingdata-class'>
                        <p className="user-password">Contraseña:</p>
                        <p className='user-data-firestore'> *************</p>

                        {/* Solo permitir cambiar si passwordTimes > 0 */}
                        {passwordTimes > 0 ? (
                            <>
                                <button onClick={() => startEditing('password')} className='user-buttonsettings' disabled={isEditing && isEditing !== 'password'}>Cambiar</button>
                                {isEditing === 'password' && (
                                    <>
                                    <div className='password-fields'>
                                        <input 
                                            type='password' 
                                            id='inputcurrentpassword' 
                                            placeholder='Ingresa tu contraseña actual' 
                                            onChange={(e) => setCurrentPassword(e.target.value)} 
                                            value={currentPassword} 
                                            className='inputs-data-password' 
                                        />
                                        <input 
                                            type='password' 
                                            id='inputnewpassword' 
                                            placeholder='Ingresa tu nueva contraseña' 
                                            onChange={handlePasswordChange} 
                                            value={newPassword} 
                                            className='inputs-data-password'
                                        />
                                        <input 
                                            type='password' 
                                            id='inputconfirmnewpassword' 
                                            placeholder='Confirma tu nueva contraseña' 
                                            onChange={(e) => setConfirmNewPassword(e.target.value)} 
                                            value={confirmNewPassword} 
                                            className='inputs-data-password'
                                        />
                                        <div className='security-message'style={{ color: messageColor }}>
                                            {securityMessage}
                                        </div>
                                    </div>
                                    <button onClick={cancelEditing} className='user-buttonsettings'>Cancelar</button>
                                    </>
                                )}
                            </>
                        ) : (
                            <p className="user-warning">No puedes cambiar la contraseña más veces.</p>
                        )}
                    </div>

                                        <div className='notif-config'>
                                            <h2>Notificaciones</h2>
                                            <label className="switch">
                                                <input type="checkbox" checked={notif} onChange={(e) => handleCheckboxChange(e, 'notif')} />
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                        {notif && (
                        <>
                            <div className='notif-config'>
                                <p>Ejercicios</p>
                                <label className="switch">
                                    <input type="checkbox" checked={notifExercises} onChange={(e) => handleCheckboxChange(e, 'exercises')} />
                                    <span className="slider round"></span>
                                </label>
                                <input
                                    type='time'
                                    className='inputtimenotif'
                                    value={exercisesTime}
                                    onChange={(e) => setExercisesTime(e.target.value)}
                                    style={{ fontFamily: 'Figtree', borderRadius: "20px" }}
                                    name='retrotime'
                                    hidden={!notifExercises}
                                />
                            </div>

                            <div className='notif-config'>
                                <p>Retroalimentaciones</p>
                                <label className="switch">
                                    <input type="checkbox" checked={notifFeedback} onChange={(e) => handleCheckboxChange(e, 'feedback')} />
                                    <span className="slider round"></span>
                                </label>
                                <input
                                    type='time'
                                    className='inputtimenotif'
                                    value={feedbackTime}
                                    onChange={(e) => setFeedbackTime(e.target.value)}
                                    style={{ fontFamily: 'Figtree', borderRadius: "20px" }}
                                    name='feedbacktime'
                                    hidden={!notifFeedback}
                                />
                            </div>

                            <div className='notif-config'>
                                <p>Recordatorios</p>
                                <label className="switch">
                                    <input type="checkbox" checked={notifRemind} onChange={(e) => handleCheckboxChange(e, 'remind')} />
                                    <span className="slider round"></span>
                                </label>
                                <input
                                    type='time'
                                    className='inputtimenotif'
                                    value={remindTime}
                                    onChange={(e) => setRemindTime(e.target.value)}
                                    style={{ fontFamily: 'Figtree', borderRadius: "20px" }}
                                    name='remindtime'
                                    hidden={!notifRemind}
                                />
                            </div>
                        </>
                    )}

                                    {error && <p style={{ color: errorColor, fontSize: '14px' }}>{error}</p>}

                                    </>
                                ) : (
                                    <p>Cargando datos...</p>
                                )}
                            </div>
                        </div>
                        <div className='privacepolicydiv'>
                            <a >Descarga la política de privacidad </a>
                            <a className="privatepolicy" href='./docs/Krnel_PrivatePolicy.pdf' download={"Krnel_PrivatePolicy.pdf"}>aquí</a>
                            <div className='button-container'>
                            <button onClick={saveAll} className="user-save">Guardar Cambios</button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        );
};

export default Settings;
