// Dashboard.jsx
import React, { useRef,useContext } from 'react';
import signOutUser from '../firebasestuff/auth_signout';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'
import { AuthContext } from '../firebasestuff/authContext';


const Dashboard = () => {
    const { usernamePass } = useContext(AuthContext);
    const navigate = useNavigate();
    const handleSignOut = () => {
        signOutUser().then(() => {
            navigate('/');
        }).catch((error) => {
            console.error('An error happened during sign-out:', error);
        });
    };

    return (
        <body>
            <div className='dashboard-container'>
                <header className='header'>
                <nav class="navbar">
        <ul>
            <img src='../icons/image.png' style={{height: 30, marginTop: 10}}></img>

            <div className='user-stuff'>
            <p>Bienvenid@, ¡{usernamePass}!</p>

            </div>
        </ul>
    </nav>

                
                </header>
            </div>
                <div class="toolbar">
                      
                        <img className ='tab-buttons' src='../icons/flashcard_icon.png' ></img>
                        <img className ='tab-buttons' src='../icons/create_icon.png' ></img>
                        <img className ='tab-buttons' src='../icons/practice_icon.png' ></img>
                        <img className ='tab-buttons' src='../icons/settings_icon.png'></img>

                    <div className='logout-button'>

                        <img className ='tab-buttons' src='../icons/logout_icon.png'  onClick={handleSignOut}></img>
                    </div>
                      

                </div>
                
                
            
        </body>

    );
};

export default Dashboard;
