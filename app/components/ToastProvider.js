'use client';

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toast, setToast] = useState(null);
    const [visible, setVisible] = useState(false);

    const showNotification = useCallback((message, type = "success") => {
        setToast({ message, type });
        setVisible(true);

        setTimeout(() => {
            setVisible(false);
        }, 2500); // začátek animace zmizení

        setTimeout(() => {
            setToast(null);
        }, 3000); // po animaci toast smažeme
    }, []);

    return (
        <ToastContext.Provider value={showNotification}>
            {children}

            {toast && (
                <div
                    className={`fixed bottom-5 right-5 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white bg-gray-900/90 backdrop-blur-sm transition-all duration-500 transform
            ${visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}
                >
                    {toast.type === "success" ? (
                        <CheckCircleIcon className="h-6 w-6 text-green-400" />
                    ) : (
                        <XCircleIcon className="h-6 w-6 text-red-400" />
                    )}
                    <span className="text-sm font-medium">{toast.message}</span>
                </div>
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}
