import { signIn } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import dashboardImage from '@/assets/images/personal_dashboard.png';
import { Github, LayoutDashboard } from 'lucide-react';

export default function LoginPage() {
    return (
        <main className="flex h-screen w-screen bg-slate-50 dark:bg-slate-950 transition-colors">
            <div className="flex w-full h-full max-w-[1600px] mx-auto p-4 lg:p-6 gap-4 lg:gap-8">
                {/* Left Side - Login Form */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-md space-y-8 p-8">
                        {/* Header */}
                        <div className="space-y-2">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 mb-6">
                                <LayoutDashboard className="text-white w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Welcome back
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-lg">
                                Sign in to your Personal Dashboard
                            </p>
                        </div>

                        {/* Login Form */}
                        <form
                            action={async () => {
                                'use server';
                                await signIn('github', { redirectTo: '/' });
                            }}
                            className="space-y-4"
                        >
                            <Button
                                className="w-full h-12 bg-[#24292F] hover:bg-[#24292F]/90 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl text-base font-medium shadow-lg shadow-black/5 dark:shadow-white/5 transition-all flex items-center justify-center gap-3 cursor-pointer"
                            >
                                <Github className="w-5 h-5" />
                                Continue with GitHub
                            </Button>
                        </form>

                        <p className="text-xs text-center text-slate-400 dark:text-slate-500">
                            By clicking continue, you agree to our <span className="underline cursor-pointer hover:text-slate-600 dark:hover:text-slate-300">Terms of Service</span> and <span className="underline cursor-pointer hover:text-slate-600 dark:hover:text-slate-300">Privacy Policy</span>.
                        </p>
                    </div>
                </div>

                {/* Right Side - Visual */}
                <div className="hidden lg:flex flex-1 relative rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="absolute inset-0 bg-linear-to-br from-blue-600/10 to-purple-600/10 dark:from-blue-900/20 dark:to-purple-900/20 z-10" />
                    <Image
                        src={dashboardImage}
                        alt="Personal Dashboard Preview"
                        fill
                        className="object-cover"
                        placeholder="blur"
                        priority
                    />
                </div>
            </div>
        </main>
    );
}
