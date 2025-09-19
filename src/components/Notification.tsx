// packages/builder/src/components/Notification.tsx
"use client";

import { useEffect, useState } from 'react';

// Icônes SVG pour les différents états
const SuccessIcon = () => (
  <svg className="h-6 w-6 text-green-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="h-6 w-6 text-red-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Notification = ({ message, type, onClose }: NotificationProps) => {
  const [show, setShow] = useState(false);

  // Gère l'animation d'apparition et la disparition automatique
  useEffect(() => {
    // Apparition
    setShow(true);

    // Disparition après 4 secondes
    const timer = setTimeout(() => {
      setShow(false);
      // On attend la fin de l'animation de sortie avant de le "démonter"
      setTimeout(onClose, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  const Icon = type === 'success' ? SuccessIcon : ErrorIcon;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center p-4 rounded-lg shadow-2xl text-white transition-all duration-300 ease-in-out ${bgColor} ${show ? 'transform-none opacity-100' : 'translate-y-10 opacity-0'}`}
    >
      <div className="flex-shrink-0">
        <Icon />
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-green-50">{message}</p>
      </div>
      <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-black/20 focus:outline-none">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};