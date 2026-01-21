import { Task } from "@/components/dashboard/TaskWidget";
import { EnergyBadge } from "./EnergyBadge";
import { ContextTag } from "./ContextTag";
import { Clock, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { isToday, isTomorrow, isBefore } from "date-fns";
import { CONTEXTS, ContextId } from "@/lib/contexts";

interface TaskCardProps {
    task: Task & { energyLevel?: "high_focus" | "low_energy", contextId?: string, statusFunnel?: string, dueDate?: string | Date };
    onToggle?: (task: Task) => void;
    onDelete?: (id: string) => void;
    className?: string;
    showEnergy?: boolean;
    showContext?: boolean;
}

export function TaskCard({ task, onToggle, onDelete, className, showEnergy = true, showContext = true }: TaskCardProps) {
    const isDone = task.status === 'done';

    // Urgency Logic
    const isUrgent = useMemo(() => {
        if (!task.dueDate) return false;
        const due = new Date(task.dueDate);
        return isToday(due) || isTomorrow(due) || isBefore(due, new Date()); // Today, Tomorrow, or Overdue
    }, [task.dueDate]);

    // Style Logic based on User Feedback
    // 1. Urgent takes priority (Red)
    // 2. Then Section Color (High Focus = Amber, Zombie = Green)
    // 3. Fallback to default

    let cardStyle = "bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500/30";

    if (isUrgent && !isDone) {
        cardStyle = "bg-red-50/90 border-red-200 dark:bg-red-900/20 dark:border-red-800/50 shadow-sm shadow-red-500/10";
    } else if (task.energyLevel === 'high_focus') {
        cardStyle = "bg-amber-50/50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-500/20 hover:border-amber-300";
    } else if (task.energyLevel === 'low_energy') {
        cardStyle = "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-500/20 hover:border-emerald-300";
    }

    return (
        <div className={cn(
            "group flex items-start gap-3 p-3 rounded-xl border transition-all shadow-sm",
            cardStyle,
            className
        )}>
            <button
                onClick={() => onToggle?.(task)}
                onPointerDown={(e) => e.stopPropagation()}
                className={cn(
                    "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer",
                    isDone ? "bg-blue-600 border-blue-600 text-white" :
                        isUrgent ? "border-red-400 dark:border-red-500 hover:border-red-600 text-transparent" :
                            task.energyLevel === 'high_focus' ? "border-amber-300 dark:border-amber-600 hover:border-amber-500 text-transparent" :
                                task.energyLevel === 'low_energy' ? "border-emerald-300 dark:border-emerald-600 hover:border-emerald-500 text-transparent" :
                                    "border-slate-300 dark:border-slate-600 hover:border-blue-500 text-transparent"
                )}
            >
                <Check size={12} strokeWidth={3} />
            </button>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium wrap-break-word ${isDone ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                        {task.title}
                    </p>
                    {onDelete && (
                        <button
                            onClick={() => onDelete(task.id)}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-2">
                    {showEnergy && task.energyLevel && (
                        <EnergyBadge level={task.energyLevel as any} />
                    )}
                    {showContext && task.contextId && (
                        <ContextTag contextId={task.contextId} />
                    )}
                    {isUrgent && !isDone && (
                        <div className="inline-flex items-center gap-1 text-[10px] font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded-md border border-red-100 dark:border-red-500/20">
                            <Clock size={10} />
                            {task.dueDate && isBefore(new Date(task.dueDate), new Date()) && !isToday(new Date(task.dueDate)) ? "Overdue" : "Urgent"}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
