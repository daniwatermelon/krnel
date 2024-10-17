import React, { useRef, useContext, useState, useEffect } from 'react';
import './AnswerCommunity.css'
import { useLocation, useNavigate } from 'react-router-dom';
import signOutUser from '../firebasestuff/auth_signout';
import { AuthContext } from '../firebasestuff/authContext';
import { getDataFromCollections} from '../firebasestuff/userDataQueries';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../firebaseConfig.js';
import CommunityEx from './lists/CommunityEx';
import { levenshteinDistance } from '../levenshtein.js';
const AnswerCommunity = (props) => {
    const { usernamePass } = useContext(AuthContext);
    const location = useLocation();
    const { type, author, image, question, text, answers, correctAnswerIndex,text1,text2 } = location.state;

    const renderComEx = () => {
    switch (type) {
      case "vocabulary":
        return (
          <div className='v-exercise'>
            <div className='hor-ex'>
              <p className='author-text'>{author}</p>
              <img className='exicon' src='../icons/vocabulary_icon.png' alt="icon" />
            </div>
            <div className='hor-ex'>
              <h1>{question}</h1>
              {image !== "../icons/default_image.png" && (
                <img className='image-answer-com' src={image} alt="exercise" />
              )}
            </div>
              <input className='answer-voc' type='text' maxLength={50} placeholder='Escribe aquí tu respuesta' />
              <button className='upload-answer-com' type='submit'>Contestar</button>
          </div>
        );
      case "reading":
        return (
          <div className='r-exercise'>
            <div className='hor-ex'>
            <p className='author-text'>{author}</p>
            <img className='exicon' src='../icons/reading_icon.png' alt="icon" />
            </div>
            <div className='hor-ex'>
                <div>
                    <h1>{question}</h1>
                    <p className='reading-text'>{text}</p>
                </div>
              
              {image !== "../icons/default_image.png" && (
                <img className='image-answer-com' src={image} alt="exercise" />
              )}
            </div>
            <input className='answer-voc' type='text' maxLength={50} placeholder='Escribe aquí tu respuesta'/>
            <button className='upload-answer-com'>Contestar</button>

          </div>
        );
        case "openQ":
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)']; // Letras para los incisos
  const [selectedAnswer, setSelectedAnswer] = useState(null); // Estado para la respuesta seleccionada

  const handleAnswerChange = (index) => {
    setSelectedAnswer(index); // Actualiza la respuesta seleccionada
  };

  return (
    <div className='oq-exercise'>
      <div className='hor-ex'>
      <p className='author-text'>{author}</p>
      <img className='exicon' src='../icons/options_icon.png' alt="icon" />
      </div>
      <div className='hor-ex'>
        <div>
          <h1>{question}</h1>
          <ul style={{ listStyleType: 'none', padding: 0 }}> {/* Sin viñetas para la lista */}
            {answers.map((answer, index) => (
              <li
                key={index}
                style={{
                  color: index === correctAnswerIndex ? 'green' : 'black', // Resalta la respuesta correcta
                  fontWeight: index === correctAnswerIndex ? 'bold' : 'normal', // Negrita para la correcta
                  marginBottom: '10px' // Espaciado entre las respuestas
                }}  
              >
                <label>
                  <input
                    type="radio"
                    name="answer"
                    value={index}
                    checked={selectedAnswer === index}
                    onChange={() => handleAnswerChange(index)}
                  />
                  <span>{letters[index]} {answer}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
        {image !== "../icons/default_image.png" && (
          <img className='image-answer-com' src={image} alt="exercise" />
        )}
      </div>
      <button
        className='upload-answer-com'
        type='submit'
        onClick={() => console.log("Selected Answer:", selectedAnswer)} // Aquí puedes manejar la respuesta seleccionada
      >
        Contestar
      </button>
    </div>
  );
      case "completeS":
        return (
          <div className='c-exercise'>
            <div className='hor-ex'>
            <p className='author-text'>{author}</p>
            <img className='exicon' src='../icons/completeT_icon.png' alt="icon" />
            </div>
            <div className='hor-ex'>
                <div>
                <p>{text1}</p>
              <input className='answer-comS' maxLength={50} placeholder='Escribe el texto que falta'/>
              <p>{text2}</p> 
                </div>
              
              {image !== "../icons/default_image.png" && (
                <img className='image-answer-com' src={image} alt="exercise" />
              )}
            </div>
            <button className='upload-answer-com' type='submit'>Contestar</button>

          </div>
        );
      default:
        return <p>No se ha seleccionado un ejercicio.</p>;
    }
  };

    const loadFeedbacks = async () => {
        // Lógica para cargar feedbacks, si es necesario.
    };

    const navigate = useNavigate();

    const goBack = () => {
        navigate('/dashboard', { state: { empty: true } });
    };

    const handleSignOut = () => {
        signOutUser()
            .then(() => {
                navigate('/');
            })
            .catch((error) => {
                console.error('An error happened during sign-out:', error);
            });
    };

    return (
        <div className="profile-page">
            <header className="header">
                <nav className="navbaranswercom">
                    <ul>
                        <li>
                            <img src="../icons/image.png" style={{ height: 30, marginTop: 10 }} alt="Logo" />
                        </li>
                    </ul>
                    <h1 className="username-pass">{usernamePass}</h1>
                </nav>
            </header>
            <div className="main-content">
                <div className="toolbaranswercom">
                    <img className="tab-buttons" src='../icons/return_icon.png' onClick={goBack} alt="Return" />
                    <div className="logout-button">
                        <img className="tab-buttons" src="../icons/logout_icon.png" onClick={handleSignOut} alt="Logout" />
                    </div>
                </div>
            </div>
            {renderComEx()}
        </div>
    );
};

export default AnswerCommunity;
