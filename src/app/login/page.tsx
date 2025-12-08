import { signIn } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
    return (
        <main className="flex items-center justify-center md:h-screen">
            <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
                <div className="flex w-full items-end rounded-lg bg-slate-900 p-3 md:h-36">
                    <div className="w-32 text-white md:w-36">
                        <h1 className="text-2xl font-bold">Personal Dashboard</h1>
                    </div>
                </div>
                <div className="flex-1 rounded-lg bg-slate-800 px-6 pb-4 pt-8">
                    <h1 className="mb-3 text-2xl text-white">
                        Please log in to continue.
                    </h1>
                    <div className="w-full">
                        <form
                            action={async () => {
                                'use server';
                                await signIn('github', { redirectTo: '/' });
                            }}
                        >
                            <Button className="mt-4 w-full bg-slate-950 text-white hover:bg-slate-900" aria-disabled={false}>
                                Log in with GitHub <span className="ml-auto h-5 w-5 text-gray-50" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}
