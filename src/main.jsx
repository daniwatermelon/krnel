import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './firebaseConfig.js';
//import 'bootstrap/dist/css/bootstrap.min.css' //importamos bootstrap para los styles

ReactDOM.createRoot(document.getElementById('root')).render( /*
Es el encargado de renderizar toda la app React DOM*/
  <React.StrictMode> 
    <App />
  </React.StrictMode>,
)
