
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route,Routes} from 'react-router-dom';
import RegisterForm from "./componentes/RegisterForm.jsx";
import LoginForm from "./componentes/LoginForm.jsx";
import PassForm from "./componentes/PassForm.jsx";
import FeedComponent from "./componentes/FeedComponent.jsx";
import { AuthProvider } from './firebasestuff/authContext.jsx';
import Dashboard from './componentes/Dashboard.jsx';
import Profile from './componentes/Profile.jsx';
import Settings from './componentes/Settings.jsx';
import Flashcards from './componentes/Flashcards.jsx';
import MyExercises from './componentes/MyExercises.jsx';
import MyFeedbacks from './componentes/MyFeedbacks.jsx';
import CreateExercises from './componentes/CreateExercises.jsx';
import CreateV from './componentes/CreateV.jsx';
import CreateR from './componentes/CreateR.jsx';
import CreateG from './componentes/CreateG.jsx';
import CreateGOpenQ from './componentes/CreateGOpenQ.jsx';
import CreateGCompleteS from './componentes/CreateGCompleteS.jsx';
const App = () => {
    return (
        <AuthProvider>
        <Router>
            <Routes>
                    <Route path="/register" element={<RegisterForm/>}/>
                    <Route path="/" element={<LoginForm/>}/>
                    <Route path="/forgot-password" element={<PassForm/>}/>
                    <Route path="/dashboard" element={<FeedComponent><Dashboard /></FeedComponent>} />
                    <Route path='/profile' element={<FeedComponent><Profile /></FeedComponent>}/>
                    <Route path='/settings' element={<FeedComponent><Settings /></FeedComponent>}/>
                    <Route path='/flashcards' element={<FeedComponent><Flashcards/></FeedComponent>}/>
                    <Route path='/myexercises' element={<FeedComponent><MyExercises/> </FeedComponent>}/>
                    <Route path='/myfeedbacks' element={<FeedComponent><MyFeedbacks/> </FeedComponent>}/>
                    <Route path='/createexercises' element={<FeedComponent><CreateExercises/></FeedComponent>}/>
                    <Route path='/create/reading' element={<FeedComponent><CreateR/></FeedComponent>}/>
                    <Route path='/create/vocabulary' element={<FeedComponent> <CreateV/> </FeedComponent>}/>
                    <Route path='/create/grammar' element={<FeedComponent><CreateG/></FeedComponent>}/>
                    <Route path='/open-question' element={<FeedComponent><CreateGOpenQ/></FeedComponent>}/>
                    <Route path='/complete-sentence' element={<FeedComponent><CreateGCompleteS/></FeedComponent>}/>
           </Routes>
        </Router>
        </AuthProvider>
    );
};

export default App;
