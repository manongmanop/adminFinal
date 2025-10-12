import React from "react";
import { X } from "lucide-react";
import "../css/ui.css";

/* ================== Button ================== */
export const Button = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  className = "", 
  ...props 
}) => (
  <button
    className={`btn btn--${variant} btn--${size} ${className}`}
    {...props}
  >
    {children}
  </button>
);

/* ================== Card ================== */
export const Card = ({ children, className = "", ...props }) => (
  <div className={`card ${className}`} {...props}>
    {children}
  </div>
);

/* ================== Badge ================== */
export const Badge = ({ children, variant = "blue", className = "" }) => (
  <span className={`badge badge--${variant} ${className}`}>
    {children}
  </span>
);

/* ================== Input / Textarea / Label ================== */
export const Input = ({ className = "", ...props }) => (
  <input className={`input ${className}`} {...props} />
);

export const Textarea = ({ className = "", ...props }) => (
  <textarea className={`textarea ${className}`} {...props} />
);

export const Label = ({ children, htmlFor, className = "", ...props }) => (
  <label htmlFor={htmlFor} className={`label ${className}`} {...props}>
    {children}
  </label>
);

/* ================== Modal ================== */
export const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  
  return (
    <div className="modal">
      <div className="modal__overlay" onClick={onClose} />
      <div className="modal__dialog">
        <div className="modal__header">
          <h3 className="modal__title">{title}</h3>
          <button 
            onClick={onClose} 
            className="modal__close"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="modal__body">
          {children}
        </div>
      </div>
    </div>
  );
};