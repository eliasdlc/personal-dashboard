import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function AuthErrorPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const searchParams = await props.searchParams;
    const error = searchParams.error as string;

    let errorMessage = "An unknown error occurred.";

    if (error === "Configuration") {
        errorMessage = "There is a problem with the server configuration. Check logs.";
    } else if (error === "AccessDenied") {
        errorMessage = "Access denied. You do not have permission to access these resources.";
    } else if (error === "Verification") {
        errorMessage = "The verification link may have expired or has already been used.";
    } else if (error === "OAuthSignin") {
        errorMessage = "Error initializing OAuth sign in.";
    } else if (error === "OAuthCallback") {
        errorMessage = "Error handling the response from the identity provider.";
    } else if (error === "OAuthCreateAccount") {
        errorMessage = "Could not create OAuth provider user in the database.";
    } else if (error === "EmailCreateAccount") {
        errorMessage = "Could not create email provider user in the database.";
    } else if (error === "Callback") {
        errorMessage = "Error during the authentication callback.";
    } else if (error === "OAuthAccountNotLinked") {
        errorMessage =
            "To confirm your identity, sign in with the same account you used originally.";
    } else if (error === "EmailSignin") {
        errorMessage = "Check your email address.";
    } else if (error === "CredentialsSignin") {
        errorMessage =
            "Sign in failed. Check your password or email address.";
    } else if (error === "SessionRequired") {
        errorMessage = "Please sign in to access this page.";
    }

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="flex w-full max-w-md flex-col items-center space-y-6 rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-xl">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
                </div>

                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Authentication Error
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {errorMessage}
                    </p>
                </div>

                <div className="w-full">
                    <Button asChild className="w-full h-12 rounded-xl text-base">
                        <Link href="/login">Back to Login</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
