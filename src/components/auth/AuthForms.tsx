'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { authenticate, createUser } from '@/actions/auth-actions';
import { LayoutDashboard, Mail, Lock, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AuthForms() {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [loginState, loginAction, isLoginPending] = useActionState(authenticate, undefined);
    const [registerState, registerAction, isRegisterPending] = useActionState(createUser, undefined);

    const toggleMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
    };

    return (
        <div className="w-full max-w-md space-y-8 p-8">
            {/* Header */}
            <div className="space-y-2">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 mb-6">
                    <LayoutDashboard className="text-white w-6 h-6" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {mode === 'login' ? 'Welcome back' : 'Create an account'}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                    {mode === 'login'
                        ? 'Sign in to your Personal Dashboard'
                        : 'Get started with your Personal Dashboard'}
                </p>
            </div>

            {/* Form */}
            <div className="space-y-4">
                {mode === 'login' ? (
                    <form action={loginAction} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>
                            {loginState?.errors?.email && (
                                <p className="text-sm text-red-500">{loginState.errors.email}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    required
                                    minLength={6}
                                />
                            </div>
                            {loginState?.errors?.password && (
                                <p className="text-sm text-red-500">{loginState.errors.password}</p>
                            )}
                        </div>

                        {loginState?.message && (
                            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20">
                                {loginState.message}
                            </p>
                        )}

                        <Button
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-base font-medium shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                            disabled={isLoginPending}
                        >
                            {isLoginPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Sign in
                        </Button>
                    </form>
                ) : (
                    <form action={registerAction} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <input
                                    name="name"
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>
                            {registerState?.errors?.email && (
                                <p className="text-sm text-red-500">{registerState.errors.email}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="Create a password (min 6 chars)"
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    required
                                    minLength={6}
                                />
                            </div>
                            {registerState?.errors?.password && (
                                <p className="text-sm text-red-500">{registerState.errors.password}</p>
                            )}
                        </div>

                        {registerState?.message && (
                            <p className={cn(
                                "text-sm p-3 rounded-lg border",
                                registerState.message.includes('successful')
                                    ? "text-green-600 bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20"
                                    : "text-red-500 bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20"
                            )}>
                                {registerState.message}
                            </p>
                        )}


                        <Button
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-base font-medium shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                            disabled={isRegisterPending}
                        >
                            {isRegisterPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Create Account
                        </Button>
                    </form>
                )}
            </div>

            {/* Toggle */}
            <div className="text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={toggleMode}
                        type="button"
                        className="text-blue-600 font-medium hover:underline focus:outline-none"
                    >
                        {mode === 'login' ? 'Sign up' : 'Sign in'}
                    </button>
                </p>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-50 dark:bg-slate-950 px-2 text-slate-500 dark:text-slate-400">
                        Or continue with
                    </span>
                </div>
            </div>
        </div>
    );
}
