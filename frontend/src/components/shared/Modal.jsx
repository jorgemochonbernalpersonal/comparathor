import React, { useEffect } from "react";

const Modal = ({ title, onClose, children, open = false }) => {

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape" && onClose) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, [onClose]);

    if (!open) return null;

    return (
        <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={(event) => event.stopPropagation()}
        >
            <div
                className="modal-dialog modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        {!onClose ? null : (
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        )}
                    </div>
                    <div className="modal-body">{children}</div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
