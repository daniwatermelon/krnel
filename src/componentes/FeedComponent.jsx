import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../firebasestuff/authContext.jsx';

const FeedComponent = ({ children }) => {
    const { user } = useContext(AuthContext);

    return user ? children : <Navigate to="/" />;
};

export default FeedComponent;
