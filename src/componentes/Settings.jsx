import React, { useRef, useContext, useState } from 'react';
import { db } from '../firebaseConfig.js';
import signOutUser from '../firebasestuff/auth_signout';
import { useNavigate, useLocation, useAsyncError } from 'react-router-dom';
import './Settings.css'
import { AuthContext } from '../firebasestuff/authContext';
import { decryptPassword } from '../encryptPassword';
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
const Settings = () => {
    const { state } = useLocation();
    const { users: userData } = state.settingsdata;
    const { usernamePass } = useContext(AuthContext); //Se usa el contexto de Auth para pasar el nombre de usuario
    const [exercisesTime , setExercisesTime] = useState('');
    const [feedbackTime , setFeedbackTime] = useState('');
    const [remindsTime , setRemindTime] = useState('');

    const [emailSettings, setEmail] = useState('');
    const [usernameSettings, setUsername] = useState('');
    const [passwordSettings, setPassword] = useState('');

    
    const navigate = useNavigate(); //Se incluye todo de navegación


    const goBack = () => {
        navigate(-1);
    }

    const handleSignOut = () => {
        signOutUser().then(() => { //Esta función ejecuta SignOutUser
            navigate('/'); //Y lo regresa a la pestaña principal
        }).catch((error) => {
            console.error('An error happened during sign-out:', error); //Si por alguna razón no puede salirse, se ejecuta este error en la consola
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

    const saveAll = () => {
        const inputEmail = document.getElementById('inputemail');
        const inputPassword = document.getElementById('inputpassword');
        const inputUsername = document.getElementById('inputusername');
        
        setEmail(inputEmail.value);
        setPassword(inputPassword.value);
        setUsername(inputUsername.value);
        
        inputEmail.hidden = true;
        inputPassword.hidden = true;
        inputUsername.hidden = true;

        console.log("Usuario: " + usernameSettings + "\nContraseña: " + passwordSettings + "\nEmail: " + emailSettings);
        console.log("Reminds: " + remindsTime + "\n Exercises: " + exercisesTime + "\n Feedbacks: " + feedbackTime);

    }

    const handleTimeChange = (inputtype, newTime) => {
        console.log(`${inputtype} time: ${newTime}`);
    }

    return (
        <body>
            <div className="profile-page">
            <header className="header">
                <nav className="navbar">
                    <ul>
                        <li>
                            <img src="../icons/image.png" style={{ height: 30, marginTop: 10 }} alt="Logo" />
                        </li>
                    </ul>
                    <h1  className="username-pass">{usernamePass}</h1>
                </nav>
            </header>
            <div className="main-content">
                <div className="toolbar">
                    <img className="tab-buttons" src='../icons/return_icon.png' onClick={goBack} alt="Return"/>
                    <div className="logout-button">
                        <img className="tab-buttons" src="../icons/logout_icon.png" onClick={handleSignOut} alt="Logout" />
                    </div>
                </div>
                <div className="user-info">
                <h1>Configuración</h1>
                    <h2>Perfil</h2>
                    <div className="user-details">
                        <div>
                        {userData ? (
                <>
                  <div className='changingdata-class'>
                    <p className="user-name">Nombre de usuario: </p>
                    <p className='user-data-firestore'>{userData.username}</p>
                    <button onClick={changeUsername} className='user-button'>Cambiar</button>
                    <input type='text' id='inputusername' onChange={(e) => setUsername(e.target.value)} 
                        value={usernameSettings} className='inputs-data' hidden={true} />
                  </div>
                    <div className='changingdata-class'>
                    <p className="user-password">Contraseña:</p>
                    <p className='user-data-firestore'> {decryptPassword(userData.password)}</p>
                    <button onClick={changePassword} className='user-button'>Cambiar</button>
                    <input type='text' id='inputpassword' value={passwordSettings} onChange={(e) => setPassword(e.target.value)} 
className='inputs-data' hidden={true} />
                  </div>
                    <div className='changingdata-class'>
                    <p className="user-email">Correo: </p>
                    <p className='user-data-firestore'>{userData.email}</p>
                    <button onClick={changeEmail} value={emailSettings} className='user-button'>Cambiar</button>
                    <input type='text' id='inputemail' className='inputs-data' onChange={(e) => setEmail(e.target.value)} hidden={true} />
                   
                  </div>
                  <h2>Notificaciones</h2>
                  <div className='notif-config'>
                    <p>Ejercicios</p>
                    <label className="switch">
                        <input type="checkbox"/>
                        <span className="slider round"></span>
                        </label>
                    <input type='time' onChange={(e) => setExercisesTime(e.target.value)} style={{ fontFamily: 'Figtree',borderRadius:"20px"   }} name='retrotime'/>
                  </div>
                  <div className='notif-config'>
                    <p>Retroalimentaciones</p>
                  <label className="switch">
                    <input type="checkbox"/>
                    <span className="slider round"></span>
                    </label>
                  <input type='time' onChange={(e) => setFeedbackTime(e.target.value)} style={{ fontFamily: 'Figtree',borderRadius:"20px" }} name='punttime'/>
                  </div>
                    <div className='notif-config'>
                    <p>Recordatorios</p>
                    <label className="switch">
                            <input type="checkbox"/>
                            <span className="slider round"></span>
                            </label>
                            <input type='time' onChange={(e) => setRemindTime(e.target.value)} style={{ fontFamily: 'Figtree',borderRadius:"20px" }} name='rectime'/>
                    </div>
                </>
              ) : (
                <p>No user data found.</p>
              )}
                        </div>
                 </div>
                 <a href='./docs/Krnel_PrivatePolicy.pdf' download={"Krnel_PrivatePolicy.pdf"}>Politica de privacidad</a>
                  <button className='user-save' onClick={saveAll}>Guardar</button>
                </div>
            </div>
        </div>
</body>
    );
};

export default Settings;
