import React from "react";
import { X } from "lucide-react";

/* ================== Button ================== */
export const Button = ({ children, variant = "primary", size = "md", className = "", ...props }) => {
  const base = "inline-flex items-center gap-2 rounded-xl font-semibold transition-all duration-150 focus:outline-none";
  const variants = {
    primary: "bg-primary text-white shadow-sm hover:shadow-md",
    secondary: "bg-surface-2 text-text border border-gray-200 hover:bg-surface",
    ghost: "bg-transparent text-primary hover:bg-surface-2",
    danger: "bg-rose-500 text-white hover:bg-rose-600",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };
  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

/* ================== Card ================== */
export const Card = ({ children, className = "", ...props }) => (
  <div className={`card-surface p-4 ${className}`} {...props}>
    {children}
  </div>
);

/* ================== Badge ================== */
export const Badge = ({ children, variant = "blue", className = "" }) => {
  const variants = {
    blue: "bg-primary/10 text-primary ring-primary/10",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    gray: "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${variants[variant] || variants.blue} ${className}`}>
      {children}
    </span>
  );
};

/* ================== Input / Textarea / Label ================== */
export const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full rounded-lg bg-surface-2 border border-gray-200 px-4 py-2 text-sm text-text placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary ${className}`}
    {...props}
  />
);

export const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`w-full rounded-lg bg-surface-2 border border-gray-200 px-4 py-2 text-sm text-text placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none ${className}`}
    {...props}
  />
);

export const Label = ({ children, htmlFor, className = "", ...props }) => (
  <label
    htmlFor={htmlFor}
    className={`block text-sm font-medium text-gray-300 mb-2 ${className}`}
    {...props}
  >
    {children}
  </label>
);

/* ================== Modal ================== */
export const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
