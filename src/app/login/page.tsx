import { signIn } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import dashboardImage from '@/assets/images/personal_dashboard.png';

export default function LoginPage() {
    return (
        <main className="flex h-screen w-screen">
            <div className="flex flex-row p-5 w-full">
                <div className="pr-2 p-4 flex rounded-3xl w-[40%] h-full items-center justify-center">
                    <div className="bg-slate-950 p-4 flex flex-col rounded-3xl w-full h-full items-center justify-center">
                        <div>
                            <h2 className="text-2xl font-light">
                                Welcome to your...
                            </h2>
                            <h2 className="text-4xl font-extrabold">
                                Personal Dashboard 🗒️
                            </h2>
                        </div>
                        <form
                            className='w-full'
                            action={async () => {
                                'use server';
                                await signIn('github', { redirectTo: '/' });
                            }}
                        >
                            <Button className="w-full mt-4 bg-slate-900 text-white hover:bg-slate-800" aria-disabled={false}>
                                Log in with GitHub
                            </Button>
                        </form>

                    </div>
                </div>
                <div className="pl-2 p-4 flex rounded-3xl w-[60%] h-full items-center justify-center">
                    <div className=" bg-white border-2 border-white rounded-3xl  w-full h-full overflow-hidden relative">
                        <Image
                            src={dashboardImage}
                            alt="Personal Dashboard"
                            fill
                            className="object-cover p-2 rounded-3xl"
                            placeholder="blur"
                        />
                    </div>
                </div>

            </div>


        </main>
    );
}
