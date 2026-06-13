"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info, ShoppingCart } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'cart';

interface NotificationOptions {
  title: string;
  message: string;
  type?: NotificationType;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (options: NotificationOptions) => void;
  closeNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<NotificationOptions>({
    title: '',
    message: '',
    type: 'info'
  });

  const showNotification = (options: NotificationOptions) => {
    setConfig({
      type: 'info',
      ...options
    });
    setIsOpen(true);

    if (options.duration) {
      setTimeout(() => {
        setIsOpen(false);
      }, options.duration);
    }
  };

  const closeNotification = () => setIsOpen(false);

  const getIcon = () => {
    switch (config.type) {
      case 'success':
        return <CheckCircle2 className="w-12 h-12 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-600" />;
      case 'cart':
        return <ShoppingCart className="w-12 h-12 text-green-700" />;
      default:
        return <Info className="w-12 h-12 text-blue-600" />;
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification, closeNotification }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={closeNotification}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">
            <div className="p-8 flex flex-col items-center text-center gap-4">
              {/* Close Button */}
              <button
                onClick={closeNotification}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon Section */}
              <div className={`p-4 rounded-full ${config.type === 'error' ? 'bg-red-50' : 'bg-green-50'}`}>
                {getIcon()}
              </div>

              {/* Text Section */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold text-gray-900 font-['Outfit']">
                  {config.title}
                </h3>
                <p className="text-gray-500 text-sm font-medium font-['Inter'] leading-relaxed">
                  {config.message}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={closeNotification}
                className={`w-full py-4 mt-2 rounded-2xl font-bold text-white transition-all active:scale-95 shadow-lg ${
                  config.type === 'error' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-green-700 hover:bg-green-800 shadow-green-200'
                }`}
              >
                {config.type === 'error' ? 'Try Again' : 'Awesome!'}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
