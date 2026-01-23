import NextAuth, { NextAuthConfig } from 'next-auth';
import GitHub from "next-auth/providers/github";

if (!process.env.AUTH_SECRET) {
    console.warn("Warning: AUTH_SECRET is not set. Authentication will likely fail.");
}
if (!process.env.AUTH_GITHUB_ID || !process.env.AUTH_GITHUB_SECRET) {
    console.warn("Warning: AUTH_GITHUB_ID or AUTH_GITHUB_SECRET is not set.");
}

export const authConfig:
    NextAuthConfig = {
    providers: [
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID!,
            clientSecret: process.env.AUTH_GITHUB_SECRET!,
        }),
    ],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            // Development bypass: Always allow access in dev mode
            if (process.env.NODE_ENV === 'development') return true;

            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname === '/';
            // console.log('Authorized callback:', { pathname: nextUrl.pathname, isLoggedIn, isOnDashboard });
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                // console.log('Redirecting to login');
                return false; // Redirect unauthenticated users to login page
            }
            return true;
        },
        async jwt({ token, account, profile }) {
            if (account && profile) {
                // Use the stable GitHub ID as the user ID
                token.sub = String(profile.id);
                console.log('JWT Callback - Setting stable ID:', token.sub);
            }
            return token;
        },
        async session({ session, token }) {
            console.log('Session Callback - Token:', token);
            if (session.user && token.sub) {
                (session.user as any).id = token.sub;
            }
            console.log('Session Callback - Session User ID:', (session.user as any).id);
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
};

const { auth: originalAuth, handlers, signIn, signOut } = NextAuth(authConfig);

export { handlers, signIn, signOut };

export const auth = async (...args: any[]) => {
    // Mock session for development
    if (process.env.NODE_ENV === 'development') {
        return {
            user: {
                name: "Dev User",
                email: "dev@example.com",
                image: "", // Empty for now, or use a placeholder
                id: "dev-user-mock-id"
            },
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        } as any;
    }
    return (originalAuth as any)(...args);
};