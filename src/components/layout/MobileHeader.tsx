'use client';

import { LayoutDashboard, User, LogOut } from 'lucide-react';
import { GamificationStats } from '../gamification/GamificationStats';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '../ui/button';
import { serverLogout } from '@/actions/auth';

interface MobileHeaderProps {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export function MobileHeader({ user }: MobileHeaderProps) {
    return (
        <header className="md:hidden flex w-full h-14 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 items-center justify-between px-4 shrink-0 sticky top-0 z-50">
            {/* Left: Logo */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
                    <LayoutDashboard size={18} className="text-white" />
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">Dashboard</span>
            </div>

            {/* Right: Stats + User */}
            <div className="flex items-center gap-3">
                <GamificationStats />

                {/* User Avatar with Menu */}
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-300 dark:border-slate-700 cursor-pointer">
                            {user?.image ? (
                                <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
                            ) : (
                                <User size={16} className="text-slate-400" />
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-56 p-2 bg-slate-50 dark:bg-slate-900">
                        <div className="px-2 py-1.5 mb-2 border-b border-slate-200 dark:border-slate-700">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                        <form action={serverLogout}>
                            <Button
                                type="submit"
                                variant="ghost"
                                className="w-full justify-start gap-2 text-red-500 dark:text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                                <LogOut size={14} />
                                Sign Out
                            </Button>
                        </form>
                    </PopoverContent>
                </Popover>
            </div>
        </header>
    );
}
