import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export default function SlideOver({ isOpen, onClose, title, children, width = 'max-w-md' }: SlideOverProps) {
  // Prevent scrolling when slideover is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 overflow-hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* SlideOver Panel */}
        <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
          {/* SlideOver Content */}
          <div className={`w-screen ${width} transform transition-transform duration-300 ease-in-out`}>
            <div className="flex h-full flex-col bg-bg-primary shadow-[var(--shadow-elevated)]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <h2 className="text-lg font-bold text-text-primary">{title}</h2>
                <button
                  type="button"
                  className="p-2 bg-bg-elevated text-text-tertiary hover:text-text-primary rounded-full transition-colors focus:outline-none"
                  onClick={onClose}
                >
                  <span className="sr-only">Close panel</span>
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              
              {/* Body */}
              <div className="relative mt-2 flex-1 p-6 overflow-y-auto custom-scrollbar">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
