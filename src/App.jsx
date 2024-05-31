
import './App.css';

import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import LoginForm from "./componentes/LoginForm"

function App() {
  return( 
  <div className="App">
    <LoginForm/>
  </div>
  
) ; //Pasando props
   
}

export default App;
