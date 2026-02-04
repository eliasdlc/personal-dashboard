import { signIn } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import dashboardImage from '@/assets/images/personal_dashboard.png';
import { Github } from 'lucide-react';
import AuthForms from '@/components/auth/AuthForms';

export default function LoginPage() {
    return (
        <main className="flex h-screen w-screen bg-slate-50 dark:bg-slate-950 transition-colors">
            <div className="flex w-full h-full max-w-[1600px] mx-auto p-4 lg:p-6 gap-4 lg:gap-8">
                {/* Left Side - Login Form */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col w-full max-w-md">
                        <AuthForms />

                        <div className="px-8 space-y-4 -mt-4">
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

                            <form
                                action={async () => {
                                    'use server';
                                    await signIn('google', { redirectTo: '/' });
                                }}
                                className="space-y-4"
                            >
                                <Button
                                    className="w-full h-12 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-white rounded-xl text-base font-medium shadow-lg shadow-black/5 transition-all flex items-center justify-center gap-3 cursor-pointer"
                                >
                                    <svg className="w-5 h-5" aria-hidden="true" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Continue with Google
                                </Button>
                            </form>

                            <p className="text-xs text-center text-slate-400 dark:text-slate-500 pt-4">
                                By clicking continue, you agree to our <span className="underline cursor-pointer hover:text-slate-600 dark:hover:text-slate-300">Terms of Service</span> and <span className="underline cursor-pointer hover:text-slate-600 dark:hover:text-slate-300">Privacy Policy</span>.
                            </p>
                        </div>
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
