import { EnergyFlowModule } from "@/components/energy-flow/EnergyFlowModule";

export default function EnergyFlowPage() {
    return (
        <div className="h-full p-4 flex flex-col">
            <div className="mb-4 shrink-0">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Energy Flow</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage your energy, not just your time.</p>
            </div>
            <div className="flex-1 min-h-0">
                <EnergyFlowModule />
            </div>
        </div>
    );
}
