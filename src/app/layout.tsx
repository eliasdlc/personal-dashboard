import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: 'Personal Dashboard',
  description: 'Dashboard personal con tareas, notas y gastos rápidos',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Personal Dashboard',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}