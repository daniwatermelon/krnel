// Dashboard.jsx
import React, { useRef,useContext } from 'react';
import signOutUser from '../firebasestuff/auth_signout';
import { useNavigate, useLocation } from 'react-router-dom';
import './Settings.css'
import { AuthContext } from '../firebasestuff/authContext';
import { decryptPassword } from '../encryptPassword';

const Settings = () => {
    const { state } = useLocation();
    const { users: userData } = state.settingsdata;
    const { usernamePass } = useContext(AuthContext); //Se usa el contexto de Auth para pasar el nombre de usuario
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

    }

    const changePassword = () => {

    }
    const changeUsername = () => {

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
                  <p className="user-name">Nombre de usuario: {userData.username}</p>
                  <button onClick={changeUsername} className='user-button'>Cambiar</button>
                  <p className="user-password">Contraseña: {decryptPassword(userData.password)}</p>
                  <button onClick={changePassword} className='user-button'>Cambiar</button>
                  <p className="user-email">Correo: {userData.email}</p>
                  <button onClick={changeEmail} className='user-button'>Cambiar</button>

                  
                  <h2>Notificaciones</h2>
                  Ejercicios<label className="switch">
                    <input type="checkbox"/>
                    <span className="slider round"></span>
                    </label>
                  <p> </p>
                  <input type='time'  name='retrotime'/>
                  <p></p>
                  Retroalimentaciones<label className="switch">
                    <input type="checkbox"/>
                    <span className="slider round"></span>
                    </label>
                  <p> </p>

                  <input type='time'  name='punttime'/>
                  <p></p>
                  Recordatorios<label className="switch">
                    <input type="checkbox"/>
                    <span className="slider round"></span>
                    </label>
                  <p> </p>
                  <input type='time'  name='rectime'/>

                </>
                
              ) : (
                <p>No user data found.</p>
              )}
                        </div>
                 </div>
                  <button className='user-save'>Guardar</button>

                </div>
               
            </div>
            
        </div>

</body>
    );
};

export default Settings;
