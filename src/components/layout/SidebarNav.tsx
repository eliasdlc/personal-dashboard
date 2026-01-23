"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, CreditCard, FileText, Zap, Download } from 'lucide-react';
import { useSidebar } from './SidebarContext';
import { GamificationStats } from '../gamification/GamificationStats';
import { usePWAInstall } from '@/hooks/use-pwa-install';

export function SidebarNav() {
    const pathname = usePathname();
    const { close } = useSidebar();

    const isActive = (path: string) => pathname === path;
    const { install, isInstallable } = usePWAInstall();

    return (
        <nav className="flex-1 px-4 space-y-1 relative z-10">
            <div className="px-2 mb-6 mt-2">
                <GamificationStats />
            </div>

            {isInstallable && (
                <div className="mb-6">
                    <p className="px-4 text-xs font-semibold text-slate-600 dark:text-slate-500 uppercase tracking-wider mb-2">App</p>
                    <button
                        onClick={install}
                        className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl transition-all group hover:bg-slate-100 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
                    >
                        <Download size={18} className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        <span>Install App</span>
                    </button>
                </div>
            )}

            <p className="px-4 text-xs font-semibold text-slate-600 dark:text-slate-500 uppercase tracking-wider mb-2 mt-4">Menu</p>

            <Link
                href="/"
                onClick={close}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group ${isActive('/')
                    ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/20 shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
            >
                <LayoutDashboard size={18} className={isActive('/') ? '' : 'group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'} />
                <span>Overview</span>
            </Link>

            <Link
                href="/energy-flow"
                onClick={close}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group ${isActive('/energy-flow')
                    ? 'bg-amber-600/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/20 shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
            >
                <Zap size={18} className={isActive('/energy-flow') ? '' : 'group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors'} />
                <span>Energy Flow</span>
            </Link>

            <Link
                href="/notes"
                onClick={close}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group ${isActive('/notes')
                    ? 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/20 shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
            >
                <FileText size={18} className={isActive('/notes') ? '' : 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors'} />
                <span>Notes</span>
            </Link>

            <Link
                href="/expenses"
                onClick={close}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group ${isActive('/expenses')
                    ? 'bg-purple-600/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/20 shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
            >
                <CreditCard size={18} className={isActive('/expenses') ? '' : 'group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors'} />
                <span>Expenses</span>
            </Link>

            <p className="px-4 text-xs font-semibold text-slate-600 dark:text-slate-500 uppercase tracking-wider mb-2 mt-8">System</p>

            <Link
                href="/settings"
                onClick={close}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group ${isActive('/settings')
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
            >
                <Settings size={18} className={isActive('/settings') ? '' : 'group-hover:text-slate-900 dark:group-hover:text-white transition-colors'} />
                <span>Settings</span>
            </Link>
        </nav>
    );
}
