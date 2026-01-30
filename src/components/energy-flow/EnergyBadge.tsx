import { Zap, BatteryMedium } from "lucide-react";

type EnergyLevel = "high_focus" | "low_energy";

interface EnergyBadgeProps {
    level: EnergyLevel;
    className?: string;
}

export function EnergyBadge({ level, className }: EnergyBadgeProps) {
    if (level === "high_focus") {
        return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 ${className}`}>
                <Zap size={12} className="fill-current" />
                High Focus
            </div>
        );
    }

    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 ${className}`}>
            <BatteryMedium size={12} />
            Zombie Mode
        </div>
    );
}
