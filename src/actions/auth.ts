'use server';

import { signOut, signIn } from "@/lib/auth";

export async function serverLogout() {
    await signOut({ redirectTo: "/login" });
}

export async function socialLogin(provider: string) {
    await signOut({ redirect: false }); // Ensure clean slate
    await signIn(provider, { redirectTo: "/" });
}
