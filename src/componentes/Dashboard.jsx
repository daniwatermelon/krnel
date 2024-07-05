// Dashboard.jsx
import React from 'react';
import signOutUser from '../firebasestuff/auth_signout';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'
const Dashboard = () => {

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
                    <nav className='nav-bar'>

                    </nav>

                
                </header>
                
                <div>
                     <h1>Bienvenido al Dashboard</h1>
           
                        <img className ='tab-buttons' src='../icons/logout_icon.png'  onClick={handleSignOut}></img>
                        <img className ='tab-buttons' src='../icons/settings_icon.png'></img>
                        <img className ='tab-buttons' src='../icons/flashcard_icon.png' ></img>
                        <img className ='tab-buttons' src='../icons/create_icon.png' ></img>
                        <img className ='tab-buttons' src='../icons/practice_icon.png' ></img>


                 </div>
            </div>
        </body>
       
    );
};

export default Dashboard;
