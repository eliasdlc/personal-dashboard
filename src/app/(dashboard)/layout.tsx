import { DashboardShell } from '@/components/layout/DashboardShell';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (

        <DashboardShell sidebar={<Sidebar />}>
            {children}
        </DashboardShell>
    );
}