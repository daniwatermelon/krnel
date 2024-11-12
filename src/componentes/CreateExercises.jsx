import React, {useState, useContext} from "react";
import signOutUser from '../firebasestuff/auth_signout';
import { useNavigate, useLocation } from 'react-router-dom';
import './CreateExercises.css'
import { AuthContext } from '../firebasestuff/authContext';

const CreateExercises = () => {
    const {empty} = '';
    const { state } = useLocation();
    const { users: userData } = state.createexercisesdata;
    const { usernamePass } = useContext(AuthContext); //Se usa el contexto de Auth para pasar el nombre de usuario
    const navigate = useNavigate(); //Se incluye todo de navegación

    const goBack = () => {
        navigate('/dashboard',{state: {empty}});
    }

    const handleSignOut = () => {
        signOutUser().then(() => { //Esta función ejecuta SignOutUser
            navigate('/'); //Y lo regresa a la pestaña principal
        }).catch((error) => {
            console.error('An error happened during sign-out:', error); //Si por alguna razón no puede salirse, se ejecuta este error en la consola
        });
    };

    const handleCreateVocabulary = () => {
        navigate('/create/vocabulary')


    }

    const handleCreateReading = () => {
        navigate('/create/reading')
    }

    const handleCreateGrammar = () => {
        navigate('/create/grammar')
    }






return(
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

                    <div className="grammar-select">
                    <button onClick={handleCreateGrammar}>Grammar</button>
                    </div>
                    <div className="vocabulary-select">
                    <button onClick={handleCreateVocabulary} >Vocabulary</button>
                    </div>

                    <div className="reading-select">
                    <button onClick={handleCreateReading}>Reading</button>
                    </div>
                    

                    
                </div>
            </div>
        </div>

</body>





);

};
export default CreateExercises;
