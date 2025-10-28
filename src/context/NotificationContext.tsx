// src/context/NotificationContext.tsx
"use client";

import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useCallback,
    useMemo,
} from "react";
import { Notification } from "../components/Notification";

/**
 * Types de notifications possibles
 */
export type NotificationType = "success" | "error";

/**
 * État interne d'une notification
 */
interface NotificationState {
    message: string;
    type: NotificationType;
    isVisible: boolean;
}

/**
 * Type du contexte de notification
 */
interface NotificationContextType {
    showNotification: (message: string, type: NotificationType) => void;
}

/**
 * Props du provider de notification
 */
interface NotificationProviderProps {
    children: ReactNode;
}

/**
 * Contexte de notification partagé
 */
const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined,
);

/**
 * Provider du contexte de notification
 * Affiche des notifications temporaires de succès ou d'erreur
 */
export const NotificationProvider = ({
    children,
}: NotificationProviderProps) => {
    const [notification, setNotification] = useState<NotificationState | null>(
        null,
    );

    /**
     * Affiche une notification
     * @param message - Message à afficher
     * @param type - Type de notification (success ou error)
     */
    const showNotification = useCallback(
        (message: string, type: NotificationType) => {
            setNotification({ message, type, isVisible: true });
        },
        [],
    );

    /**
     * Ferme la notification active
     */
    const handleClose = useCallback(() => {
        setNotification(null);
    }, []);

    /**
     * Valeur mémorisée du contexte
     */
    const contextValue = useMemo(
        () => ({ showNotification }),
        [showNotification],
    );

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={handleClose}
                />
            )}
        </NotificationContext.Provider>
    );
};

/**
 * Hook pour accéder au contexte de notification
 * @returns {NotificationContextType} Le contexte de notification
 * @throws {Error} Si utilisé hors d'un NotificationProvider
 */
export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error(
            "useNotification must be used within a NotificationProvider",
        );
    }
    return context;
};
