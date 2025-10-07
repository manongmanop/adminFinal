import React from "react";
import { X } from "lucide-react";

/* ================== Button ================== */
export const Button = ({ children, variant = "primary", size = "md", className = "", ...props }) => {
  const baseClasses =
    "inline-flex items-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
  const variants = {
    primary:
      "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl focus:ring-emerald-500",
    secondary: "bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600 focus:ring-gray-500",
    ghost: "text-gray-300 hover:text-white hover:bg-gray-800 focus:ring-gray-500",
    danger: "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500",
  };
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };
  return (
    <button className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

/* ================== Card ================== */
export const Card = ({ children, className = "", ...props }) => (
  <div className={`bg-gray-800 rounded-2xl border border-gray-700 shadow-xl ${className}`} {...props}>
    {children}
  </div>
);

/* ================== Badge ================== */
export const Badge = ({ children, variant = "blue", className = "" }) => {
  const variants = {
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    success: "bg-emerald-50 text-emerald-600 ring-emerald-200",
    warning: "bg-amber-50 text-amber-600 ring-amber-200",
    gray: "bg-gray-100 text-gray-700 ring-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ring-1 ring-inset ${
        variants[variant] || variants.blue
      } ${className}`}
    >
      {children}
    </span>
  );
};

/* ================== Input / Textarea / Label ================== */
export const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full rounded-xl bg-gray-800 border border-gray-600 px-4 py-2.5 text-gray-200 placeholder-gray-400 shadow-inner focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors ${className}`}
    {...props}
  />
);

export const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`w-full rounded-xl bg-gray-800 border border-gray-600 px-4 py-2.5 text-gray-200 placeholder-gray-400 shadow-inner focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors resize-none ${className}`}
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
