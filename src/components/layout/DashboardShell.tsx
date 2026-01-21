'use client';

import { Menu } from 'lucide-react';
import { SidebarProvider, useSidebar } from './SidebarContext';

function DashboardContent({
    children,
    sidebar,
}: {
    children: React.ReactNode;
    sidebar: React.ReactNode;
}) {
    const { isOpen, close, open } = useSidebar();

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
            {/* Mobile Sidebar Overlay - Closes sidebar when clicked */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
                    onClick={close}
                />
            )}
            {/* Sidebar Container */}
            <div
                className={`
                    fixed inset-y-0 left-0 z-50 w-72 h-full transform transition-transform duration-300 ease-in-out
                    md:relative md:translate-x-0
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {sidebar}
            </div>
            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <div className="md:hidden p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 bg-white dark:bg-slate-950">
                    <button
                        onClick={open}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="font-semibold text-slate-900 dark:text-white">Dashboard</span>
                </div>
                {/* Page Content */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

export function DashboardShell({
    children,
    sidebar,
}: {
    children: React.ReactNode;
    sidebar: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <DashboardContent sidebar={sidebar}>{children}</DashboardContent>
        </SidebarProvider>
    );
}