import { DashboardShell } from '@/components/layout/DashboardShell';
import { Topbar } from '@/components/layout/Topbar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { auth } from '@/lib/auth';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const user = session?.user;

    return (
        <DashboardShell
            topbar={<Topbar />}
            mobileHeader={<MobileHeader user={user} />}
        >
            {children}
        </DashboardShell>
    );
}