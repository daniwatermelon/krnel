import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css' //importamos bootstrap para los styles

ReactDOM.createRoot(document.getElementById('root')).render( /*
Es el encargado de renderizar toda la app ReactDOM*/
  <React.StrictMode> 
    <App />
  </React.StrictMode>,
)
