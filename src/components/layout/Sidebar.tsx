import Link from 'next/link';
import { LayoutDashboard, Settings, LogOut, User, CreditCard, FileText } from 'lucide-react';
import { auth, signOut } from '@/lib/auth';

export async function Sidebar() {

    // const session = await auth();
    // const user = session?.user;
    const user = { name: 'Test User', email: 'test@example.com', image: null };
    console.log('Sidebar rendering (dummy user):', user?.name);

    return (
        <aside className="w-72 bg-slate-950 border-r border-slate-800/50 flex flex-col h-full text-slate-400 font-medium relative overflow-hidden">
            {/* Background Gradient Effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-blue-900/5 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="p-6 mb-2 relative z-10">
                <div className="flex items-center gap-3 text-white mb-1">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
                        <LayoutDashboard size={18} className="text-white" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
                </div>
                <p className="text-xs text-slate-500 ml-11">Personal Workspace</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 relative z-10">
                <p className="px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 mt-4">Menu</p>

                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-2.5 bg-blue-600/10 text-blue-400 rounded-xl transition-all border border-blue-900/20 shadow-sm"
                >
                    <LayoutDashboard size={18} />
                    <span>Overview</span>
                </Link>

                <Link
                    href="/notes"
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-900/50 hover:text-slate-200 rounded-xl transition-all group"
                >
                    <FileText size={18} className="group-hover:text-blue-400 transition-colors" />
                    <span>Notes</span>
                </Link>

                <Link
                    href="/expenses"
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-900/50 hover:text-slate-200 rounded-xl transition-all group"
                >
                    <CreditCard size={18} className="group-hover:text-blue-400 transition-colors" />
                    <span>Expenses</span>
                </Link>

                <p className="px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 mt-8">System</p>

                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-900/50 hover:text-slate-200 rounded-xl transition-all group"
                >
                    <Settings size={18} className="group-hover:text-blue-400 transition-colors" />
                    <span>Settings</span>
                </Link>
            </nav>

            {/* User Profile & Logout */}
            <div className="p-4 m-4 rounded-2xl bg-slate-900/50 border border-slate-800/50 relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-700 shadow-sm">
                        {user?.image ? (
                            <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
                        ) : (
                            <User size={18} className="text-slate-400" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-200 truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email || 'No email'}</p>
                    </div>
                </div>

                <form
                    action={async () => {
                        'use server';
                        await signOut();
                    }}
                >
                    <button className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 w-full rounded-lg transition-all border border-transparent hover:border-red-900/30">
                        <LogOut size={14} />
                        <span>Sign Out</span>
                    </button>
                </form>
            </div>
        </aside>
    );
}