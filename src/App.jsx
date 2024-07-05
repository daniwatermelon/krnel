
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route,Routes} from 'react-router-dom';
import RegisterForm from "./componentes/RegisterForm.jsx";
import LoginForm from "./componentes/LoginForm.jsx";
import PassForm from "./componentes/PassForm.jsx";
import FeedComponent from "./componentes/FeedComponent.jsx";
import { AuthProvider } from './firebasestuff/authContext.jsx';
import Dashboard from './componentes/Dashboard.jsx';


const App = () => {
    return (
        <AuthProvider>
        <Router>
            <Routes>
                    <Route path="/register" element={<RegisterForm/>}/>
                    <Route path="/" element={<LoginForm/>}/>
                    <Route path="/forgot-password" element={<PassForm/>}/>
                    <Route path="/dashboard" element={<FeedComponent><Dashboard /></FeedComponent>} />

           </Routes>
        </Router>
        </AuthProvider>
    );
};

export default App;
