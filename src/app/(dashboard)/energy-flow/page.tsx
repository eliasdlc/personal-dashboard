import { EnergyFlowModule } from "@/components/energy-flow/EnergyFlowModule";
import { PageTransition } from "@/components/ui/animations";

export default function EnergyFlowPage() {
    return (
        <div className="h-full p-4 flex flex-col">

            <PageTransition className="flex-1 min-h-0">
                <EnergyFlowModule />
            </PageTransition>


        </div>
    );
}
