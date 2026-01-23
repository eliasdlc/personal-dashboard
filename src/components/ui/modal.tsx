'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);

        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted) return null;
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            <div className="relative w-full max-w-lg transform rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl transition-all scale-100 opacity-100">
                <div className="flex items-center justify-between mb-5">
                    {title && (
                        <h3 className="text-lg font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-100">
                            {title}
                        </h3>
                    )}
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-full p-1 opacity-70 ring-offset-white transition-opacity hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:ring-offset-slate-950 dark:focus:ring-slate-800"
                    >
                        <X className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        <span className="sr-only">Close</span>
                    </button>
                </div>

                <div className="mt-2">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
