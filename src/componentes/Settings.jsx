import React, { useRef, useContext, useState, useEffect } from 'react';
import { db } from '../firebaseConfig.js';
import signOutUser from '../firebasestuff/auth_signout';
import { useNavigate, useLocation } from 'react-router-dom';
import './Settings.css';
import { AuthContext } from '../firebasestuff/authContext';
import { decryptPassword, encryptPassword } from '../encryptPassword';
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

const Settings = () => {
    const { state } = useLocation();
    const { users: userData } = state.settingsdata;
    const { usernamePass } = useContext(AuthContext);

    const [exercisesTime, setExercisesTime] = useState('');
    const [feedbackTime, setFeedbackTime] = useState('');
    const [remindTime, setRemindTime] = useState('');
    const [notifRemind, setNotifRemind] = useState(true);
    const [notifFeedback, setNotifFeedback] = useState(true);
    const [notifExercises, setNotifExercises] = useState(true);
    const [emailSettings, setEmail] = useState('');
    const [usernameSettings, setUsername] = useState('');
    const [currentPassword, setCurrentPassword] = useState(''); // Nueva variable para la contraseña actual
    const [newPassword, setNewPassword] = useState(''); // Nueva variable para la nueva contraseña
    const [confirmNewPassword, setConfirmNewPassword] = useState(''); // Nueva variable para confirmar la nueva contraseña
    const [error, setError] = useState(null);
    const [usernameTimes, setUsernameTimes] = useState();
    const [isEditing, setIsEditing] = useState(false);
    const [securityMessage, setSecurityMessage] = useState('');

    useEffect(() => {
        if (userData) {
            setExercisesTime(userData.config.exerciseTime);
            setFeedbackTime(userData.config.feedbackTime);
            setRemindTime(userData.config.remindTime);
            setNotifRemind(userData.config.isActivatedReminds);
            setNotifFeedback(userData.config.isActivatedFeedback);
            setNotifExercises(userData.config.isActivatedExercices);
            setUsernameTimes(userData.config.timesUsername);

            setEmail(userData.email);
            setUsername(userData.username);
            setCurrentPassword(decryptPassword(userData.password));
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
        setCurrentPassword(decryptPassword(userData.password));
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

    const handlePasswordChange = (e) => {
        setNewPassword(e.target.value);
        const securityLevel = getPasswordSecurity(e.target.value, usernamePass);
        setSecurityMessage(`Nivel de seguridad de la contraseña: ${securityLevel}`);
    };

  

    const saveAll = async () => {
        if (isEditing === 'password' && (newPassword !== confirmNewPassword)) {
            setError('Las nuevas contraseñas no coinciden.');
            return;
        }
    
        if (isEditing) {
           
    
            setIsEditing(false);
    
            const usersRef = collection(db, 'usuario');
            const emailQuery = query(usersRef, where("email", "==", userData.email));
            const usernameQuery = query(usersRef, where("username", "==", usernamePass));
            
            const emailSnapshot = await getDocs(emailQuery);
            const usernameSnapshot = await getDocs(usernameQuery);
            
            if (emailSnapshot.empty && usernameSnapshot.empty) {
                const q = query(usersRef, where('username', '==', usernamePass));
                const querySnapshot = await getDocs(q);
                
               

                if (!querySnapshot.empty) {
                    
                    if (usernamePass !== usernameSettings) {
                        if (usernameTimes > 0) {
                            setUsernameTimes(prev => prev - 1);
                        } else {
                            setError('Ya no tienes más cambios de nombre de usuario.');
                            return;
                        }
                    }

                    const userDocRef = querySnapshot.docs[0].ref;
                    await updateDoc(userDocRef, {
                        email: emailSettings,
                        username: usernameSettings,
                        password: isEditing === 'password' ? encryptPassword(newPassword) : encryptPassword(currentPassword),
                    });
    
                    const userDoc = await getDocs(usernameQuery);
                    const userDocid = userDoc.docs[0].id;
                    const configDocRef = doc(db, 'usuario', userDocid, 'config', 'configDoc');
                    
                    await updateDoc(configDocRef, {
                        exerciseTime: exercisesTime,
                        feedbackTime: feedbackTime,
                        remindTime: remindTime,
                        isActivatedReminds: notifRemind,
                        isActivatedFeedback: notifFeedback,
                        isActivatedExercices: notifExercises,
                        timesUsername: usernameTimes, 
                    });
    
                    console.log('User settings updated successfully.');
                    setError('Registro exitoso.');
                } else {
                    console.error('User not found.');
                }
            } else {
                setError('El correo electrónico o el nombre de usuario ya están en uso.');
            }
        }
    };
    

    const handleCheckboxChange = (e, type) => {
        const isChecked = e.target.checked;
        switch(type) {
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
                                    <p className='username-advertisement'>Te quedan { usernameTimes} cambios de nombre de usuario</p>
                                    <div className='changingdata-class'>
                                        <p className="user-name">Nombre de usuario: </p>
                                        <p className='user-data-firestore'>{userData.username}</p>
                                        <button onClick={() => startEditing('username')} className='user-buttonsettings' disabled={isEditing && isEditing !== 'username'}>Cambiar</button>
                                        {isEditing === 'username' && (
                                            <>
                                                <input type='text' id='inputusername' onChange={(e) => setUsername(e.target.value)} value={usernameSettings} className='inputs-data' />
                                                <button onClick={cancelEditing} className='user-buttonsettings'>Cancelar</button>
                                            </>
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
                                    </div>

                                    <h2>Notificaciones</h2>
                                    
                                    <div className='notif-config'>
                                        <p>Ejercicios</p>
                                        <label className="switch">
                                            <input type="checkbox" checked={notifExercises} onChange={(e) => handleCheckboxChange(e, 'exercises')} />
                                            <span className="slider round"></span>
                                        </label>
                                        <input type='time' value={exercisesTime} onChange={(e) => setExercisesTime(e.target.value)} style={{ fontFamily: 'Figtree', borderRadius: "20px" }} name='retrotime' hidden={!notifExercises} />
                                    </div>

                                    <div className='notif-config'>
                                        <p>Retroalimentaciones</p>
                                        <label className="switch">
                                            <input type="checkbox" checked={notifFeedback} onChange={(e) => handleCheckboxChange(e, 'feedback')} />
                                            <span className="slider round"></span>
                                        </label>
                                        <input type='time' value={feedbackTime} onChange={(e) => setFeedbackTime(e.target.value)} style={{ fontFamily: 'Figtree', borderRadius: "20px" }} name='feedbacktime' hidden={!notifFeedback} />
                                    </div>

                                    <div className='notif-config'>
                                        <p>Recordatorios</p>
                                        <label className="switch">
                                            <input type="checkbox" checked={notifRemind} onChange={(e) => handleCheckboxChange(e, 'remind')} />
                                            <span className="slider round"></span>
                                        </label>
                                        <input type='time' value={remindTime} onChange={(e) => setRemindTime(e.target.value)} style={{ fontFamily: 'Figtree', borderRadius: "20px" }} name='remindtime' hidden={!notifRemind} />
                                    </div>

                                    {error && <p style={{color:'red', fontSize: '14px'}}>{error}</p>}

                                    <button onClick={saveAll} className="user-save">Guardar Cambios</button>
                                </>
                            ) : (
                                <p>Cargando datos...</p>
                            )}
                        </div>
                    </div>
                    <div className='privacepolicydiv'>
                        <a >Descarga la política de privacidad </a>
                        <a className="privatepolicy" href='./docs/Krnel_PrivatePolicy.pdf' download={"Krnel_PrivatePolicy.pdf"}>aquí</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;

