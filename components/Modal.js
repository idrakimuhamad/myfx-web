import React from "react";

const Modal = ({ onClose }) => (
  <div className="modal is-active">
    <div className="modal-background" />
    <div className="modal-content">In modal</div>
    <button
      onClick={onClose}
      className="modal-close is-large"
      aria-label="close"
    />
  </div>
);

export default Modal;
