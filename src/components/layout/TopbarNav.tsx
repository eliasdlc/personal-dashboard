'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Zap, FileText, CreditCard, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/', label: 'Overview', icon: LayoutDashboard, color: 'blue' },
    { href: '/energy-flow', label: 'Energy Flow', icon: Zap, color: 'amber' },
    { href: '/notes', label: 'Notes', icon: FileText, color: 'emerald' },
    { href: '/expenses', label: 'Expenses', icon: CreditCard, color: 'purple' },
    { href: '/settings', label: 'Settings', icon: Settings, color: 'slate' },
];

const colorClasses: Record<string, { active: string; hover: string }> = {
    blue: {
        active: 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-500',
        hover: 'hover:text-blue-600 dark:hover:text-blue-400',
    },
    amber: {
        active: 'bg-amber-600/10 text-amber-600 dark:text-amber-400 border-amber-500',
        hover: 'hover:text-amber-600 dark:hover:text-amber-400',
    },
    emerald: {
        active: 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-500',
        hover: 'hover:text-emerald-600 dark:hover:text-emerald-400',
    },
    purple: {
        active: 'bg-purple-600/10 text-purple-600 dark:text-purple-400 border-purple-500',
        hover: 'hover:text-purple-600 dark:hover:text-purple-400',
    },
    slate: {
        active: 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-500',
        hover: 'hover:text-slate-900 dark:hover:text-white',
    },
};

export function TopbarNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="flex items-center gap-1">
            {navItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                const colors = colorClasses[item.color];

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                            active
                                ? `${colors.active} border`
                                : `text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 ${colors.hover}`
                        )}
                    >
                        <Icon size={18} />
                        <span className="hidden lg:inline">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
