// Dashboard.jsx
import React, { useRef,useContext,useState } from 'react';
import signOutUser from '../firebasestuff/auth_signout';
import { useNavigate, useLocation } from 'react-router-dom';
import './DefaultExercises.css'
import { AuthContext } from '../firebasestuff/authContext';
import Modal from './modal/Modal';

const DefaultExercises = () => {
    
    const { state } = useLocation();
    const {empty} = '';
    const { users: userData } = state.defaultextdata;
    const { usernamePass } = useContext(AuthContext); //Se usa el contexto de Auth para pasar el nombre de usuario
    const navigate = useNavigate(); //Se incluye todo de navegación
    const [selectedExercise, setSelectedExercise] = useState('gramatica');
   

    


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

    const handlePracticeExercises = async() => {
        navigate('queue-default');
        console.log(selectedExercise);

    };

    return (
            
            <div className="profile-page">
            <header className="header">
                <nav className="navbartypeexercises">
                    <ul>
                        <li>
                            <img src="../icons/image.png" style={{ height: 30, marginTop: 10 }} alt="Logo" />
                        </li>
                    </ul>
                    <h1  className="username-pass">{usernamePass}</h1>
                </nav>
                
            </header>

            <div className="main-content">

                <div className="toolbartypeexercises">
                    <img className="tab-buttons" src='../icons/return_icon.png' onClick={goBack} alt="Return"/>
                    <div className="logout-button">
                        <img className="tab-buttons" src="../icons/logout_icon.png" onClick={handleSignOut} alt="Logout" />
                    </div>
                </div>
                
                <div className="typeexercises-container">
                    <div className='typeexercises-group'>
                        <h2 className='defaultex-title'>Ejercicios predeterminados</h2>               
                        <img className='practiceicon'src="../icons/practice_icon.png" />
                    </div>
                    <hr className='hr-profile'/>
                    <h3 className='filtertypes'>Filtra por: </h3>
                    <div className='filter-group'>
                        <form  onSubmit={handlePracticeExercises}>
                        <div className='typeexercises-group'>
                        <input 
                            type='radio'
                            name='exercise-type' // mismo name para agrupar
                            className='inputradio-filters'
                            value='gramatica'
                            checked={selectedExercise === 'gramatica'}
                            onChange={() => setSelectedExercise('gramatica')}
                        />
                        <p>Gramática</p>
                        </div>

                        <div className='typeexercises-group'>
                        <input 
                            type='radio'
                            name='exercise-type' // mismo name para agrupar
                            className='inputradio-filters'
                            value='vocabulario'
                            checked={selectedExercise === 'vocabulario'}
                            onChange={() => setSelectedExercise('vocabulario')}
                        />
                        <p>Vocabulario</p>
                        </div>

                        <div className='typeexercises-group'>
                        <input 
                            type='radio'
                            name='exercise-type' // mismo name para agrupar
                            className='inputradio-filters'
                            value='comprension-auditiva'
                            checked={selectedExercise === 'comprension-auditiva'}
                            onChange={() => setSelectedExercise('comprension-auditiva')}
                        />
                        <p>Comprensión auditiva</p>
                        </div>

                        <div className='typeexercises-group'>
                        <input 
                        type='radio'
                        name='exercise-type' // mismo name para agrupar
                        className='inputradio-filters'
                        value='comprension-lectora'
                        checked={selectedExercise === 'comprension-lectora'}
                        onChange={() => setSelectedExercise('comprension-lectora')}
                        />
                        <p>Comprensión lectora</p>
                        </div>

                        <div className='typeexercises-group'>
                        <input 
                        type='radio'
                        name='exercise-type' // mismo name para agrupar
                        className='inputradio-filters'
                        value='pronunciacion'
                        checked={selectedExercise === 'pronunciacion'}
                        onChange={() => setSelectedExercise('pronunciacion')}
                        />
                        <p>Pronunciación</p>
                        </div>

                        <div className='typeexercises-group'>
                        <input 
                        type='radio'
                        name='exercise-type' // mismo name para agrupar
                        className='inputradio-filters'
                        value='aleatorio'
                        checked={selectedExercise === 'aleatorio'}
                        onChange={() => setSelectedExercise('aleatorio')}
                        />
                        <p>Aleatorio</p>
                        </div>
                        
                        <button type='submit'className='start-button' src="../icons/play_icon.png"/>
                        </form>
                        
                    </div>

                    
                    

                    
                </div>

            </div>
        </div>



    );
};

export default DefaultExercises;
