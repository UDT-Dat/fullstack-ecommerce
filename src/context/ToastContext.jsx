import React, { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      4000,
    );
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-[9999] p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-toast ${toast.type === "error" ? "bg-red-500 text-white border border-red-600" : "bg-green-500 text-white border border-green-600"}`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {toast.type === "error" ? "error" : "check_circle"}
          </span>
          <span className="font-bold text-sm tracking-wide">
            {toast.message}
          </span>
        </div>
      )}
    </ToastContext.Provider>
  );
};
