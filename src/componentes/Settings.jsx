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
    const { usernamePass } = useContext(AuthContext); //Se usa el contexto de Auth para pasar el nombre de usuario
    const [exercisesTime, setExercisesTime] = useState(userData.config.exerciseTime);
    const [feedbackTime, setFeedbackTime] = useState(userData.config.feedbackTime);
    const [remindsTime, setRemindTime] = useState(userData.config.remindTime);
    
    const [notifRemind, setNotifRemind] = useState(userData.config.isActivatedReminds);
    const [notifFeedback, setNotifFeedback] = useState(userData.config.isActivatedFeedback);
    const [notifExercises, setNotifExercises] = useState(userData.config.isActivatedExercices);
    
    const [emailSettings, setEmail] = useState('');
    const [usernameSettings, setUsername] = useState('');
    const [passwordSettings, setPassword] = useState('');
    const [error, setError] = useState(null);

    const navigate = useNavigate(); //Se incluye todo de navegación

    const goBack = () => {
        navigate(-1);
    }

    const handleSignOut = () => {
        signOutUser().then(() => {
            navigate('/'); 
        }).catch((error) => {
            console.error('An error happened during sign-out:', error);
        });
    };

    const changeEmail = () => {
        const inputEmail = document.getElementById('inputemail');
        inputEmail.hidden = false;
    }

    const changePassword = () => {
        const inputPassword = document.getElementById('inputpassword');
        inputPassword.hidden = false;
    }

    const changeUsername = () => {
        const inputUsername = document.getElementById('inputusername');
        inputUsername.hidden = false;
    }

    const saveAll = async () => {
        const inputEmail = document.getElementById('inputemail');
        const inputPassword = document.getElementById('inputpassword');
        const inputUsername = document.getElementById('inputusername');
        
        setEmail(inputEmail.value);
        setPassword(inputPassword.value);
        setUsername(inputUsername.value);
        
        inputEmail.hidden = true;
        inputPassword.hidden = true;
        inputUsername.hidden = true;

        const usersRef = collection(db, 'usuario');
        const emailQuery = query(usersRef, where("email", "==", userData.email));
        const usernameQuery = query(usersRef, where("username", "==", usernamePass));
        
        const emailSnapshot = await getDocs(emailQuery);
        const usernameSnapshot = await getDocs(usernameQuery);
        if (emailSnapshot.empty && usernameSnapshot.empty)
            {
                // Busca el documento del usuario usando el usernamePass
                const usersCollection = collection(db, 'usuario');
                
                const q = query(usersCollection, where('username', '==', usernamePass));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const userDocRef = querySnapshot.docs[0].ref; // Obtén la referencia del documento
                    await updateDoc(userDocRef, {
                        email: emailSettings,
                        username: usernameSettings,
                        password: encryptPassword(passwordSettings), // Asegúrate de encriptar la contraseña si es necesario
                        
                        
                    });

                    const userDoc = await querySnapshot.getDocs(usernamePass);
                    const userDocid = userDoc.id;
                    const configDocRef = doc(db, 'usuario', userDocid, 'config', 'configDoc');
                    const configDocRefUser = configDocRef(usernamePass);

                    /*config: {
                        isActivatedReminds: notifRemind,
                        isActivatedFeedback: notifFeedback,
                        isActivatedExercices: notifExercises
                    }*/
                    await updateDoc(




                    );
                    console.log('User settings updated successfully.');
                } else {
                    console.error('User not found.');
                }

                setError('Registro exitoso.');
            }
            else {
                setError('El correo electrónico o el nombre de usuario ya están en uso.');
            }
    }

    const handleCheckboxChange = async (e, type) => {
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

        // Update Firestore
        const userDocRef = doc(db, 'usuario', userData.id); // Assuming userData has an id property
        await updateDoc(userDocRef, {
            config: {
                isActivatedReminds: notifRemind,
                isActivatedFeedback: notifFeedback,
                isActivatedExercices: notifExercises
            }
        });
    };

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
                    <h2>Perfil</h2>
                    <div className="user-details">
                        <div>
                            {userData ? (
                                <>
                                    <div className='changingdata-class'>
                                        <p className="user-name">Nombre de usuario: </p>
                                        <p className='user-data-firestore'>{userData.username}</p>
                                        <button onClick={changeUsername} className='user-buttonsettings'>Cambiar</button>
                                        <input type='text' id='inputusername' onChange={(e) => setUsername(e.target.value)} value={usernameSettings} className='inputs-data' hidden={true} />
                                    </div>
                                    <div className='changingdata-class'>
                                        <p className="user-password">Contraseña:</p>
                                        <p className='user-data-firestore'> {decryptPassword(userData.password)}</p>
                                        <button onClick={changePassword} className='user-buttonsettings'>Cambiar</button>
                                        <input type='text' id='inputpassword' value={passwordSettings} onChange={(e) => setPassword(e.target.value)} className='inputs-data' hidden={true} />
                                    </div>
                                    <div className='changingdata-class'>
                                        <p className="user-email">Correo: </p>
                                        <p className='user-data-firestore'>{userData.email}</p>
                                        <button onClick={changeEmail} value={emailSettings} className='user-buttonsettings'>Cambiar</button>
                                        <input type='text' id='inputemail' className='inputs-data' onChange={(e) => setEmail(e.target.value)} hidden={true} />
                                    </div>
                                    <h2>Notificaciones</h2>
                                    <div className='notif-config'>
                                        <p>Ejercicios</p>
                                        <label className="switch">
                                            <input type="checkbox" checked={notifExercises} onChange={(e) => handleCheckboxChange(e, 'exercises')} />
                                            <span className="slider round"></span>
                                        </label>
                                        <input type='time' onChange={(e) => setExercisesTime(e.target.value)} style={{ fontFamily: 'Figtree', borderRadius: "20px" }} name='retrotime' hidden={!notifExercises} />
                                    </div>
                                    <div className='notif-config'>
                                        <p>Retroalimentaciones</p>
                                        <label className="switch">
                                            <input type="checkbox" checked={notifFeedback} onChange={(e) => handleCheckboxChange(e, 'feedback')} />
                                            <span className="slider round"></span>
                                        </label>
                                        <input type='time' onChange={(e) => setFeedbackTime(e.target.value)} style={{ fontFamily: 'Figtree', borderRadius: "20px" }} name='punttime' hidden={!notifFeedback} />
                                    </div>
                                    <div className='notif-config'>
                                        <p>Recordatorios</p>
                                        <label className="switch">
                                            <input type="checkbox" checked={notifRemind} onChange={(e) => handleCheckboxChange(e, 'remind')} />
                                            <span className="slider round"></span>
                                        </label>
                                        <input type='time' onChange={(e) => setRemindTime(e.target.value)} style={{ fontFamily: 'Figtree', borderRadius: "20px" }} name='rectime' hidden={!notifRemind} />
                                    </div>
                                </>
                            ) : (
                                <p>No user data found.</p>
                            )}
                        </div>
                    </div>
                    <div className='privacepolicydiv'>
                    <a >Descarga la política de privacidad </a>
                    <a className ="privatepolicy" href='./docs/Krnel_PrivatePolicy.pdf' download={"Krnel_PrivatePolicy.pdf"}>aquí</a>

                    </div>
                    <button className='user-save' onClick={saveAll}>Guardar</button>
                    {error && <div style={{ color: 'red', fontFamily: "Figtree" }}>{error}</div>}

                </div>
            </div>
        </div>
    );
};

export default Settings;
