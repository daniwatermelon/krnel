// Dashboard.jsx
import React, { useRef,useContext } from 'react';
import signOutUser from '../firebasestuff/auth_signout';
import { useNavigate, useLocation } from 'react-router-dom';
import './CreateG.css'
import { AuthContext } from '../firebasestuff/authContext';
import { getDataFromCollections } from '../firebasestuff/userDataQueries';

const CreateG = () => {
    const { state } = useLocation();
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

    const handleCreateOpenQ = () => {
            navigate('/open-question'); 
       
    };

    

        const handleCreateCompleteS = () => {
            navigate('/complete-sentence');
        };

        




    

    return (
        <body>
            
            <div className="profile-page">
            <header className="header">
                <nav className="navbarcreate">
                    <ul>
                        <li>
                            <img src="../icons/image.png" style={{ height: 30, marginTop: 10 }} alt="Logo" />
                        </li>
                    </ul>
                    <h1  className="username-pass">{usernamePass}</h1>
                </nav>
            </header>
            <div className="main-content">
                <div className="toolbarcreate">
                    <img className="tab-buttons" src='../icons/return_icon.png' onClick={goBack} alt="Return"/>
                    <div className="logout-button">
                        <img className="tab-buttons" src="../icons/logout_icon.png" onClick={handleSignOut} alt="Logout" />
                    </div>
                </div>
                <div className="createexercises-container">

                    <div className="open-question-div">
                        <button onClick={handleCreateOpenQ}>Closed question</button>
                    </div>
                    <div className="options-question-div">
                        <button  onClick={handleCreateCompleteS}>Complete the sentence</button>
                    </div>
                    </div>
                </div>
  
        </div>

</body>


    );
};

export default CreateG;
