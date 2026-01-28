import { EnergyFlowModule } from "@/components/energy-flow/EnergyFlowModule";

export default function EnergyFlowPage() {
    return (
        <div className="h-full p-4 flex flex-col">

            <div className="flex-1 min-h-0">
                <EnergyFlowModule />
            </div>

            {/* Inspirational Quote / Footer - Subtle Psychology touch */}
            <div className="mt-4 text-center">
                <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium uppercase tracking-widest opacity-60">
                    Controlling your energy flow is key to success.
                </p>
            </div>
        </div>
    );
}
