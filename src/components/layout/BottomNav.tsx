'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Zap, FileText, CreditCard, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/', label: 'Overview', icon: LayoutDashboard, color: 'blue' },
    { href: '/energy-flow', label: 'Energy', icon: Zap, color: 'amber' },
    { href: '/notes', label: 'Notes', icon: FileText, color: 'emerald' },
    { href: '/expenses', label: 'Expenses', icon: CreditCard, color: 'purple' },
    { href: '/settings', label: 'Settings', icon: Settings, color: 'slate' },
];

const colorClasses: Record<string, string> = {
    blue: 'text-blue-600 dark:text-blue-400',
    amber: 'text-amber-600 dark:text-amber-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    purple: 'text-purple-600 dark:text-purple-400',
    slate: 'text-slate-900 dark:text-white',
};

export function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/50 px-2 pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[60px]',
                                active
                                    ? `${colorClasses[item.color]} bg-slate-100 dark:bg-slate-800/50`
                                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
                            )}
                        >
                            <Icon size={22} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
