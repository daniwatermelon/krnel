// Dashboard.jsx
import React, { useRef,useContext } from 'react';
import signOutUser from '../firebasestuff/auth_signout';
import { useNavigate, useLocation } from 'react-router-dom';
import './Profile.css'
import { AuthContext, } from '../firebasestuff/authContext';
import { getDataFromCollections } from '../firebasestuff/userDataQueries';


const Profile = () => {
    const { state } = useLocation();
    const {empty} = '';
    const { users: userData } = state.profiledata;
    const { usernamePass,userDocId } = useContext(AuthContext); //Se usa el contexto de Auth para pasar el nombre de usuario
    const navigate = useNavigate(); //Se incluye todo de navegación
    

    
    const goBack = () => {
        navigate('/dashboard',{state: {empty}});
    }

const handleMyExercises = async() => {
        try {
            const exercisesdata = await getDataFromCollections(userDocId);
            navigate('/myexercises', { state: { exercisesdata } });
          } catch (error) {
            console.error('Error fetching user data:', error);
          }

    }

    const handleMyFeedbacks = async() => {
        try {
            const feedbacksdata = await getDataFromCollections(userDocId);
            navigate('/myfeedbacks', { state: { feedbacksdata } });
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
            
            <div className="profile-page">
            <header className="header">
                <nav className="navbarprofile">
                    <ul>
                        <li>
                            <img src="../icons/image.png" style={{ height: 30, marginTop: 10 }} alt="Logo" />
                        </li>
                    </ul>
                    <h1  className="username-pass">{usernamePass}</h1>
                </nav>
            </header>
            <div className="main-content">
                <div className="toolbarprofile">
                    <img className="tab-buttons" src='../icons/return_icon.png' onClick={goBack} alt="Return"/>
                    <div className="logout-button">
                        <img className="tab-buttons" src="../icons/logout_icon.png" onClick={handleSignOut} alt="Logout" />
                    </div>
                </div>
                
                <div className="user-infoprofile">
                <h1 >Perfil</h1>
                <hr className='hr-profile'/>
                    <h3>Información de usuario</h3>
                    <div className="user-details">
                        <div>
                        {userData ? (
                <>
                
                  <p className="user-info-data">Nombre de usuario:   {userData.username}</p>
                  <p className="user-info-data">Correo:   {userData.email}</p>
                  <p className="user-info-data">Nivel:   {userData.nivel}</p>
                  <p className="user-info-data">Total de estrellas: {userData.stars} ⭐</p>

                  
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
                    <hr className='hr-profile'/>

                    <div className="user-exercises">
                        <h3>Ejercicios contestados por mí:</h3>
                        <ul className='scrolled-exercises-profile'>
                        

                        <li>
            <img src="ruta/al/avatar1.png" alt="Avatar" class="avatar"/>
            <div class="comment-content">
                <strong>Usuario 1</strong>
                <p>Este es un comentario de ejemplo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum.</p>
            </div>
        </li>
        <li>
            <img src="ruta/al/avatar2.png" alt="Avatar" class="avatar"/>
            <div class="comment-content">
                <strong>Usuario 2</strong>
                <p>Otro comentario de ejemplo. Cras quis nulla commodo, aliquam lectus sed, blandit augue.</p>
            </div>
        </li>

                            
                        </ul>
                    </div>
                    
                    <div className="user-buttonsprofile">
                        <button onClick={handleMyExercises} className="user-buttonprofile">Mis ejercicios</button>
                        <button onClick={handleMyFeedbacks}className="user-buttonprofile">Mis retroalimentaciones</button>
                    </div>
                </div>
            </div>
        </div>

</body>


    );
};

export default Profile;
