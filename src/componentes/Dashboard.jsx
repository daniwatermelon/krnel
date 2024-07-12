// Dashboard.jsx
import React, { useRef,useContext } from 'react';
import signOutUser from '../firebasestuff/auth_signout';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'
import { AuthContext } from '../firebasestuff/authContext';
import { getDataFromCollections } from '../firebasestuff/userDataQueries';


const Dashboard = () => {
    const { usernamePass } = useContext(AuthContext); //Se usa el contexto de Auth para pasar el nombre de usuario
    const navigate = useNavigate(); //Se incluye todo de navegación

    const handleProfile = async() =>{
        try {
            const data = await getDataFromCollections(usernamePass);
            navigate('/profile', { state: { data } });
          } catch (error) {
            console.error('Error fetching user data:', error);
          }

    }

   const handleSettings = async() => {
    try {
        const settingsdata = await getDataFromCollections(usernamePass);
        navigate('/settings', { state: { settingsdata } });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }


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
    <div className="dashboard-container">
            <header className="header">
                <nav className="navbar">
                    <ul>
                        <li>
                            <img src="../icons/image.png" style={{ height: 30, marginTop: 10 }} alt="Logo" />
                        </li>
                        <li className="user-stuff">
                            <p>Bienvenid@, ¡{usernamePass}!</p>
                        </li>
                    </ul>
                    <button onClick={handleProfile} className="username-pass">{usernamePass}</button>
                </nav>
            </header>
            <div className="toolbar">
                <img className="tab-buttons" src="../icons/flashcard_icon.png" alt="Flashcard" />
                <img className="tab-buttons" src="../icons/create_icon.png" alt="Create" />
                <img className="tab-buttons" src="../icons/practice_icon.png" alt="Practice" />
                <img onClick={handleSettings} className="tab-buttons" src="../icons/settings_icon.png" alt="Settings" />
                <div className="logout-button">
                    <img className="tab-buttons" src="../icons/logout_icon.png" onClick={handleSignOut} alt="Logout" />
                </div>
            </div>
        </div>
</body>


    );
};

export default Dashboard;
