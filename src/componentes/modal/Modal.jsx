// Modal.jsx
import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, closeModal, title, content }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h1>{title}</h1>
                <img
                    onClick={closeModal}
                    src='.././icons/deleteflashcard_icon.png'
                    alt="Cerrar"
                />
                <p className='modal-content'>{content}</p>
            </div>
        </div>
    );
};

export default Modal;
