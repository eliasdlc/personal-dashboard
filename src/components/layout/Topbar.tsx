import { LayoutDashboard, LogOut, User, ChevronDown } from 'lucide-react';
import { auth, signOut } from '@/lib/auth';
import { TopbarNav } from './TopbarNav';
import { GamificationStats } from '../gamification/GamificationStats';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '../ui/button';

export async function Topbar() {
    const session = await auth();
    const user = session?.user;

    return (
        <header className="hidden md:flex w-full h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/50 items-center justify-between px-6 shrink-0 relative z-20">
            {/* Left: Logo + Navigation */}
            <div className="flex items-center gap-6">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
                        <LayoutDashboard size={18} className="text-white" />
                    </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-white hidden xl:inline">Dashboard</span>
                </div>

                {/* Navigation */}
                <TopbarNav />
            </div>

            {/* Right: Stats + User Menu */}
            <div className="flex items-center gap-4 ">
                {/* Gamification Stats */}
                <GamificationStats />

                {/* User Menu */}
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-300 dark:border-slate-700">
                                {user?.image ? (
                                    <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={16} className="text-slate-400" />
                                )}
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden lg:inline max-w-[120px] truncate">
                                {user?.name || 'User'}
                            </span>
                            <ChevronDown size={14} className="text-slate-400 hidden lg:inline" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-56 p-2 bg-slate-50 dark:bg-slate-900/50">
                        <div className="px-2 py-1.5 mb-2 border-b border-slate-200 dark:border-slate-700 ">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                        <form
                            action={async () => {
                                'use server';
                                await signOut();
                            }}
                        >
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