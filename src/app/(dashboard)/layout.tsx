import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // Contenedor principal: ocupa toda la altura de la pantalla (h-screen)
        // y usa flexbox para poner los elementos uno al lado del otro.
        <div className="flex h-screen bg-slate-950 overflow-hidden">

            {/* 1. El Sidebar (Izquierda) */}
            <Sidebar />

            {/* 2. El Contenido Principal (Derecha) */}
            {/* flex-1 hace que ocupe todo el espacio restante */}
            {/* overflow-y-auto permite hacer scroll si el contenido es muy largo */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>

        </div>
    );
}