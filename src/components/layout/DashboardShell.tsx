'use client';

import { BottomNav } from './BottomNav';

interface DashboardContentProps {
    children: React.ReactNode;
    topbar: React.ReactNode;
    mobileHeader: React.ReactNode;
}

function DashboardContent({ children, topbar, mobileHeader }: DashboardContentProps) {
    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
            {/* Desktop Topbar */}
            {topbar}

            {/* Mobile Header */}
            {mobileHeader}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <BottomNav />
        </div>
    );
}

export function DashboardShell({
    children,
    topbar,
    mobileHeader,
}: {
    children: React.ReactNode;
    topbar: React.ReactNode;
    mobileHeader: React.ReactNode;
}) {
    return (
        <DashboardContent topbar={topbar} mobileHeader={mobileHeader}>
            {children}
        </DashboardContent>
    );
}