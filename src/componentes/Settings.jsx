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
    const {empty} = '';
    const { state } = useLocation();
    const { users: userData } = state.settingsdata;
    const { usernamePass, userDocId, setUsernamePass } = useContext(AuthContext);

    const [exercisesTime, setExercisesTime] = useState('');
    const [feedbackTime, setFeedbackTime] = useState('');
    const [remindTime, setRemindTime] = useState('');
    const [notif, setNotif] = useState(true);
    const [notifRemind, setNotifRemind] = useState(true);
    const [notifFeedback, setNotifFeedback] = useState(true);
    const [notifExercises, setNotifExercises] = useState(true);
    const [firstEmail, setFirstEmail] = useState('');
    const [emailSettings, setEmail] = useState('');
    const [usernameSettings, setUsername] = useState('');
    const [currentPassword, setCurrentPassword] = useState(''); 
    const [newPassword, setNewPassword] = useState(''); 
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState(null);
    const [errorColor, setMessageColor] = useState(''); // Para controlar el color del mensaje
    const [usernameTimes, setUsernameTimes] = useState();
    const [typeData, setTypeData] = useState('');
    const [usernameTimesNew, setUsernameTimesNew] = useState();
    const [passwordTimes, setPasswordTimes] = useState();
    const [isEditing, setIsEditing] = useState(false);
    const [securityMessage, setSecurityMessage] = useState('');
    const [googleUser,setGoogleUser] = useState(false);
    const [instantFeedback, setInstantFeedback] = useState(false);
    const [instantExercise, setInstantExercise] = useState(false);



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
            setUsernameTimesNew(userData.config.timesUsername || 0);
            setFirstEmail(userData.email);
            setInstantFeedback(userData.config.feedbackInstantly);
            setInstantExercise(userData.config.exerciseInstantly);


            setPasswordTimes(userData.config.timesPassword || 0);
            setEmail(userData.email || '');
            setUsername(userData.username || '');

            console.log(userData);
            if(userData.password == 'none'){
                setGoogleUser(true);

            }
        }
    }, [userData]);

    const navigate = useNavigate();

    const goBack = () => {
        navigate('/dashboard',{state: {empty}});
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

    // Verificar si el correo o el nombre de usuario ya existen
const checkUniqueEmailAndUsername = async () => {
    try {
        const usernameQuery = query(
            collection(db, "usuario"),
            where("username", "==", usernameSettings)
        );
        const usernameSnapshot = await getDocs(usernameQuery);

        const emailQuery = query(
            collection(db, "usuario"),
            where("email", "==", emailSettings)
        );
        const emailSnapshot = await getDocs(emailQuery);

        if (!usernameSnapshot.empty && usernameSettings !== userData.username) {
            setError("Este nombre de usuario ya está en uso.");
            setMessageColor("red");
            return false;
        }

        if (!emailSnapshot.empty && emailSettings !== userData.email) {
            setError("Este correo electrónico ya está en uso.");
            setMessageColor("red");
            return false;
        }

        return true;
    } catch (error) {
        console.error("Error al verificar unicidad:", error);
        setError("Ocurrió un error al verificar la disponibilidad del correo o nombre de usuario.");
        setMessageColor("red");
        return false;
    }
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
              to: firstEmail,
              subject: 'Lo siento, este correo ya no te pertenece, ahora es de   ' + emailSettings + ' correo cambiado a las ' + getCurrentTime(),
            });
            console.log('Email sent:', response.data);
            setError(null);
          } catch (error) {
            console.error('Error sending email:', error);
            setError('Error sending email');
          }

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

    const sendChangeData = async () => {
        console.log('El usuario quiere cambiar sus datos');
        let dataForEmail = '';  
        switch(typeData) {
            case 'nombre de usuario':
                dataForEmail =  usernameSettings;
                break;
            case 'contraseña':
                dataForEmail =  newPassword;
                break;
            
        }
    
        try {
            const response = await axios.post('http://localhost:3001/send-change-data', {
                to: emailSettings,
                subject: 'Cambio de datos en tu cuenta',
                text: `El valor de tu ${typeData} ha sido actualizado. \n Nuevo valor: ${dataForEmail}`,
            });
            console.log('Email enviado:', response.data);
            console.log(`typpeData: ${typeData}`, '\n', `dataForEmail: ${dataForEmail}`);

            setError(null);
        } catch (error) {
            console.error('Error enviando el correo:', error);
            setError('Error al enviar el correo');
        }
    };
    

    

    const handlePasswordChange = (e) => {
        setNewPassword(e.target.value);
        const securityLevel = getPasswordSecurity(e.target.value, usernamePass);
        setSecurityMessage(`Nivel de seguridad de la contraseña: ${securityLevel}`);
    };

    const saveAll = async () => {
        const url = `https://emailvalidation.abstractapi.com/v1/?api_key=1eeeacce8186431f98675efb37e6e5ce&email=${emailSettings}`;

        if (isEditing === 'username' || isEditing === 'email') {
            const isUnique = await checkUniqueEmailAndUsername();
            if (!isUnique) {
                // Si el nombre de usuario o el correo ya están en uso, salir de la función
                return;
            }
        }

        if (isEditing === 'password' && (newPassword !== confirmNewPassword)) {
            setError('Las nuevas contraseñas no coinciden.');
            setMessageColor('red'); 
            return;
        }
    
        try {
            // Referencia del documento del usuario
            const userDocRef = doc(db, 'usuario', userDocId);
            const configDocRef = doc(userDocRef, "config", "configDoc");
    
            const updates = {};
    
            // **Actualización del nombre de usuario** 
            if (isEditing === 'username' && usernameTimes > 0) {
                updates.username = usernameSettings;
                setUsernameTimes(prevTimes => prevTimes - 1); // Reducir el contador localmente
                setUsernamePass(usernameSettings); // Actualizar el username en el AuthContext
                setTypeData('Nombre de usuario');

                // Asegurar que se actualice en la BD
                await updateDoc(configDocRef, {
                    'timesUsername': usernameTimes - 1, // Actualizar el contador en la BD
                });
            } 
    
            // **Actualización de la contraseña**
            if (isEditing === 'password' && passwordTimes > 0) {
                if(passwordTimes === 2 || (userData.stars >= 200 && passwordTimes === 1)) {
                    updates.password = encryptPassword(newPassword);
                    const newPasswordTimes = passwordTimes - 1;
                    setPasswordTimes(newPasswordTimes); // Reducir el contador localmente
                    setTypeData('Contraseña');
                    // Asegurar que se actualice en la BD
                    await updateDoc(configDocRef, {
                        'timesPassword': newPasswordTimes, // Actualizar el contador en la BD
                    });
                } else {
                    setError('Necesitas al menos 200 estrellas para cambiar la contraseña.');
                    setMessageColor('red');
                    return;
                }
            }
    
            // **Actualización del correo electrónico**
            if (isEditing === 'email') {
                try {
                    const response = await fetch(url);
                    const data = await response.json();
                    
                    if (data.is_valid_format.value && data.deliverability === "DELIVERABLE") {
                        console.log("El correo electrónico es válido.");
                    } else {
                        console.log("El correo electrónico no es válido.");
                        setError("El correo electrónico no es válido")
                        return;
                    }
                } catch (error) {
                    console.error("Error verificando el correo electrónico:", error);
                    setError("Error verificando el correo electrónico")
                    return;
                }

                updates.email = emailSettings;
                await sendChangeEmail();
            }

            if (isEditing === 'username' || isEditing === 'password') {
                await sendChangeData();
            }
    
            // Actualizar los datos del usuario en Firestore
            await updateDoc(userDocRef, updates);
    
            // Actualizar la configuración de notificaciones y tiempos en Firestore
            await updateDoc(configDocRef, {
                'isActivatedNotif': notif,
                'isActivatedExercices': notifExercises,
                'isActivatedFeedback': notifFeedback,
                'isActivatedReminds': notifRemind,
                'exerciseTime': exercisesTime,
                'feedbackTime': feedbackTime,
                'remindTime': remindTime,
                'exerciseInstantly': instantExercise,
                'feedbackInstantly': instantFeedback
            });
    
            setError('Se actualizaron los datos correctamente.');
            setMessageColor('green'); 
            setIsEditing(false); // Finalizar edición

        
        } catch (error) {
            setError('Ocurrió un error al actualizar los datos.');
            setMessageColor('red'); 
        }
    };
    
    const handleCheckboxInstant = (e,type) => {
        const isChecked = e.target.checked;
        switch(type) {
            case 'feedbackInstant':
                setInstantFeedback(isChecked);
                break;
            case 'exercisesInstant':
                setInstantExercise(isChecked);
                break;
        }

    }

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
                                        <p className='username-advertisement' hidden={googleUser}>Te quedan { usernameTimes} cambios de nombre de usuario</p>
                                        <p className='username-advertisement' hidden={googleUser}> Te quedan {passwordTimes} cambios de contraseña</p>

                                        <div className='changingdata-class'>
                        <p className="user-name">Nombre de usuario: </p>
                        <p className='user-data-firestore'>{userData.username}</p>

                        {usernameTimes > 0 ? (
                            <>
                                <button onClick={() => startEditing('username')} className='user-buttonsettings' hidden={googleUser}  disabled={isEditing && isEditing !== 'username'}>Cambiar</button>
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
                                            <button onClick={() => startEditing('email')} className='user-buttonsettings' hidden={googleUser} disabled={isEditing && isEditing !== 'email'}>Cambiar</button>
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
                                <button onClick={() => startEditing('password')} className='user-buttonsettings' hidden={googleUser} disabled={isEditing && isEditing !== 'password'}>Cambiar</button>
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
                                <p>Puntuaciones</p>
                                <div className='instant-div' >
                                    <p hidden={!notifExercises}>Al instante</p>
                                    <input type="checkbox" hidden={!notifExercises} checked={instantExercise} onChange={(e) => handleCheckboxInstant(e, 'exercisesInstant')} className='instant-checkboxes' />
                                </div>
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
                                    hidden={!notifExercises || instantExercise}
                                />
                            </div>

                            <div className='notif-config'>
                                <p>Retroalimentaciones</p>
                                <div className='instant-div'>
                                    <p hidden={!notifFeedback}>Al instante</p>
                                    <input hidden={!notifFeedback} type="checkbox" checked={instantFeedback} onChange={(e) => handleCheckboxInstant(e, 'feedbackInstant')} className='instant-checkboxes' />
                                </div>

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
                                    hidden={!notifFeedback || instantFeedback}
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
