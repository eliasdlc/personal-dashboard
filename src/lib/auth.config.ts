import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
    pages: {
        signIn: '/login',
        error: '/auth/error',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnLogin = nextUrl.pathname.startsWith('/login');

            // Allow access to static assets and API routes (handled by middleware matcher usually, but good to be safe)
            if (nextUrl.pathname.startsWith('/api') || nextUrl.pathname.startsWith('/_next') || nextUrl.pathname.startsWith('/static')) {
                return true;
            }

            if (isOnLogin) {
                if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
                return true;
            }

            // Protect all other routes
            if (!isLoggedIn) {
                return false; // Redirect unauthenticated users to login page
            }

            return true;
        },
    },
    providers: [], // Providers will be added in the main auth configuration
} satisfies NextAuthConfig;
