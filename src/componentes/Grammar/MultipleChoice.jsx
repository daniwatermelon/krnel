import React from 'react';

const MultipleChoice = ({ exercise }) => {
    const { pregunta, opciones } = exercise;

    return (
        <div>
            <h4>{pregunta}</h4>
            <ul>
                {opciones.map((opcion, index) => (
                    <li key={index}>{opcion}</li>
                ))}
            </ul>
        </div>
    );
};

export default MultipleChoice;
