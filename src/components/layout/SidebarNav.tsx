"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, CreditCard, FileText } from 'lucide-react';

export function SidebarNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="flex-1 px-4 space-y-1 relative z-10">
            <p className="px-4 text-xs font-semibold text-slate-600 dark:text-slate-500 uppercase tracking-wider mb-2 mt-4">Menu</p>

            <Link
                href="/"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group ${isActive('/')
                    ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/20 shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
            >
                <LayoutDashboard size={18} className={isActive('/') ? '' : 'group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'} />
                <span>Overview</span>
            </Link>

            <Link
                href="/notes"
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
