// Dashboard.jsx
import React, { useRef,useContext, useState } from 'react';
import signOutUser from '../firebasestuff/auth_signout';
import { useNavigate, useLocation } from 'react-router-dom';
import './CreateV.css'
import { AuthContext } from '../firebasestuff/authContext';
import { getDataFromCollections } from '../firebasestuff/userDataQueries';

const CreateV = () => {
    const [error, setError] = useState('');
    const { usernamePass } = useContext(AuthContext); //Se usa el contexto de Auth para pasar el nombre de usuario
    const navigate = useNavigate(); //Se incluye todo de navegación
    const [userWord,setUserWord] = useState('');
    const [userMeaning, setUserMeaning] = useState('');
    
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

    const handleCheck = (e) => {
        e.preventDefault(); // Previene el comportamiento por defecto del formulario
        if (userMeaning && userWord) {
            const newExercise = {
                correctanswer: userMeaning,
                author: usernamePass,
                question: userWord,
                type: 'vocabulary'
            };
            navigate('/upload-ex', { state: { newExercise } });
        } else {
            setError('You must fill both fields to proceed');
        }
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
                    <h1 className="username-pass">{usernamePass}</h1>
                </nav>
            </header>
            <div className="main-content">
                <div className="toolbarcreate">
                    <img className="tab-buttons" src='../icons/return_icon.png' onClick={goBack} alt="Return" />
                    <div className="logout-button">
                        <img className="tab-buttons" src="../icons/logout_icon.png" onClick={handleSignOut} alt="Logout" />
                    </div>
                </div>
                <div className="createexercises-container-open">
                    <div className='question-div-vocabulary'>
                        <form onSubmit={handleCheck}>
                        <h3>Type the word:</h3>
                        <div className='flexdiv-row'>
                            <input
                                type="text"
                                id='word'
                               value={userWord}
                                onChange={(e) => setUserWord(e.target.value)}
                                maxLength={50}

                            />
                            <p>{userWord.length}/50</p>
                           
                        </div>
                        <h3 className='answerh3-complete'>Type the meaning of the word:</h3>

                        <div className='flexdiv-row'>
                            <input
                                type="text"
                                id='meaning'
                                value={userMeaning}
                                onChange={(e) => setUserMeaning(e.target.value)}
                                maxLength={50}
                                
                            />
                            <p>{userMeaning.length}/50</p>

                          
                        </div>
                        <p className='error'>{error}</p>
                        <button type='submit' className='upload_vocabulary'>Verify</button>

                        </form>
                    </div>
                    
                    <div className='answers-open-div'>
                        
                      
                    </div>
                    
                </div>
                

            </div>

        </div>

</body>


    );
};

export default CreateV;
