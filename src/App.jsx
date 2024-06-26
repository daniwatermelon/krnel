
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route,Routes} from 'react-router-dom';
import RegisterForm from "./componentes/RegisterForm.jsx";
import LoginForm from "./componentes/LoginForm.jsx";
import PassForm from "./componentes/PassForm.jsx";


const App = () => {
    return (
        <Router>
            <Routes>
                    <Route path="/register" element={<RegisterForm/>}/>
                    <Route path="/" element={<LoginForm/>}/>
                    <Route path="/forgot-password" element={<PassForm/>}/>
           </Routes>
        </Router>
    );
};

export default App;
