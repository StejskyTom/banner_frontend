'use client';

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from "@heroicons/react/24/solid";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toast, setToast] = useState(null);
    const [visible, setVisible] = useState(false);

    const showNotification = useCallback((message, type = "success") => {
        setToast({ message, type });
        setVisible(true);

        setTimeout(() => {
            setVisible(false);
        }, 2500);

        setTimeout(() => {
            setToast(null);
        }, 3000);
    }, []);

    const getIconAndColor = () => {
        switch (toast?.type) {
            case "success":
                return {
                    icon: <CheckCircleIcon className="h-6 w-6 text-green-400" />,
                    bg: "bg-green-600/90"
                };
            case "error":
                return {
                    icon: <XCircleIcon className="h-6 w-6 text-red-400" />,
                    bg: "bg-red-600/90"
                };
            case "warning":
                return {
                    icon: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />,
                    bg: "bg-yellow-600/90"
                };
            case "info":
                return {
                    icon: <InformationCircleIcon className="h-6 w-6 text-blue-400" />,
                    bg: "bg-blue-600/90"
                };
            default:
                return {
                    icon: <CheckCircleIcon className="h-6 w-6 text-green-400" />,
                    bg: "bg-gray-900/90"
                };
        }
    };

    const { icon, bg } = toast ? getIconAndColor() : { icon: null, bg: "" };

    return (
        <ToastContext.Provider value={showNotification}>
            {children}

            {toast && (
                <div
                    className={`fixed bottom-5 right-5 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${bg} backdrop-blur-sm transition-all duration-500 transform z-50
            ${visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}
                >
                    {icon}
                    <span className="text-sm font-medium">{toast.message}</span>
                </div>
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}
