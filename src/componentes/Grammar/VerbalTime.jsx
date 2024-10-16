import React, { useState } from 'react';

const VerbalTime = ({ sentenceData }) => {
    const [selectedBlocks, setSelectedBlocks] = useState([]); // Bloques seleccionados por el usuario

    const handleSelectBlock = (block) => {
        setSelectedBlocks((prevBlocks) => [...prevBlocks, block]);
    };

    const handleClearSelection = () => {
        setSelectedBlocks([]);
    };

    const checkAnswer = () => {
        const answer = selectedBlocks.join('+');
        if (answer === sentenceData.respuesta) {
            alert("Respuesta Correcta!");
        } else {
            alert("Respuesta Incorrecta. Inténtalo de nuevo.");
        }
    };

    return (
        <div className="order-sentences-container">
            <h3>{sentenceData.oracion}</h3>

            <div className="blocks-container">
                {/* Muestra los bloques que se pueden seleccionar */}
                {Object.keys(sentenceData)
                    .filter((key) => key.startsWith('bloque'))
                    .map((key) => (
                        <button key={key} onClick={() => handleSelectBlock(sentenceData[key])}>
                            {sentenceData[key]}
                        </button>
                    ))}
            </div>

            <div className="selected-blocks">
                <h4>Orden seleccionado:</h4>
                <p>{selectedBlocks.join(' ')}</p>
            </div>

            <button onClick={handleClearSelection}>Limpiar selección</button>
            <button onClick={checkAnswer}>Verificar respuesta</button>
        </div>
    );
};

export default VerbalTime;