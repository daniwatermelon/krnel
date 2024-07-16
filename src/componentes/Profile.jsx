// Dashboard.jsx
import React, { useRef,useContext } from 'react';
import signOutUser from '../firebasestuff/auth_signout';
import { useNavigate, useLocation } from 'react-router-dom';
import './Profile.css'
import { AuthContext } from '../firebasestuff/authContext';


const Profile = () => {
    const { state } = useLocation();
    const { users: userData } = state.data;
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
                <h1 >Perfil</h1>
                    <h2>Información de usuario</h2>
                    <div className="user-details">
                        <div>
                        {userData ? (
                <>
                  <p className="user-name">Nombre de usuario: {userData.username}</p>
                  <p className="user-email">Correo: {userData.email}</p>
                  <p className="user-level">Nivel: {userData.nivel}</p>
                  <p className="user-points">Total de estrellas: {userData.stars} ⭐</p>
                </>
              ) : (
                <p>No user data found.</p>
              )}
                        </div>
                    </div>
                    <div className="user-stats">
                        <p>Gramática: 0%</p>
                        <p>Vocabulario: 0%</p>
                        <p>Comprensión lectora: 0%</p>
                        <p>Comprensión auditiva: 0%</p>
                        <p>Pronunciación: 0%</p>
                    </div>
                    <div className="user-exercises">
                        <h3>Ejercicios contestados por mí:</h3>
                        <ul>
                        

                            <li></li>
                            
                        </ul>
                    </div>
                    <div className="user-buttonsprofile">
                        <button className="user-buttonprofile">Mis retroalimentaciones</button>
                        <button className="user-buttonprofile">Mis ejercicios</button>
                    </div>
                </div>
            </div>
        </div>

</body>


    );
};

export default Profile;
