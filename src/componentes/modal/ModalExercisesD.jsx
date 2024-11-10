import React from 'react'
import './ModalExercisesD.css'
const ModalExercisesD = ({ isOpen, closeModal, title, content }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-ex-overlay" onClick={closeModal}>
    <div className="modal-ex" onClick={(e) => e.stopPropagation()}>
        <h1>{title}</h1>
        <img
            onClick={closeModal}
            src='.././icons/deleteflashcard_icon.png'
            alt="Cerrar"
        />
        <p className='modal-ex-content'>{content}</p>
    </div>
</div>
  )
}

export default ModalExercisesD