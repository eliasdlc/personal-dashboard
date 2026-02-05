'use client';

import { Task } from "@/components/dashboard/TaskWidget";
import { EnergyBadge } from "./EnergyBadge";
import { ContextTag } from "./ContextTag";
import { SubtaskList } from "./SubtaskList";
import { Clock, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { isToday, isTomorrow, isYesterday, isBefore, format, differenceInDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
// Confetti removed per user request

interface TaskCardProps {
    task: Task & {
        energyLevel?: "high_focus" | "low_energy" | null,
        contextId?: string | null,
        statusFunnel?: string | null,
        dueDate?: string | Date | null
    };
    allTasks?: Task[];
    onToggle?: (task: Task) => void;
    onDelete?: (id: string) => void;
    onEdit?: (task: Task) => void;
    onToggleSubtask?: (subtask: any) => void;
    onDeleteSubtask?: (subtaskId: string) => void;
    onAddSubtask?: (parentId: string, title: string) => void;
    className?: string;
    showEnergy?: boolean;
    showContext?: boolean;
}

// Helper to format relative dates with color coding
function formatRelativeDate(date: Date): { text: string; colorClass: string } {
    const now = new Date();

    if (isToday(date)) {
        return { text: "Today", colorClass: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20" };
    }
    if (isTomorrow(date)) {
        return { text: "Tomorrow", colorClass: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 border-yellow-100 dark:border-yellow-500/20" };
    }
    if (isYesterday(date)) {
        return { text: "Yesterday", colorClass: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20" };
    }
    if (isBefore(date, now)) {
        const daysAgo = differenceInDays(now, date);
        return { text: `${daysAgo}d overdue`, colorClass: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20" };
    }
    // Future date
    const daysUntil = differenceInDays(date, now);
    if (daysUntil <= 7) {
        return { text: `In ${daysUntil}d`, colorClass: "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-500/20" };
    }
    return { text: format(date, 'MMM d'), colorClass: "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-500/20" };
}

export function TaskCard({ task, allTasks = [], onToggle, onDelete, onEdit, onToggleSubtask, onDeleteSubtask, onAddSubtask, className, showEnergy = true, showContext = true }: TaskCardProps) {
    const isDone = task.status === 'done';

    // Check if this task has subtasks
    // Check if this task has subtasks
    const ownSubtasks = task.subtasks || [];
    // If no nested subtasks, OR if allTasks is provided (to catch optimistic updates), try to find them in allTasks
    const derivedSubtasks = allTasks
        ? allTasks.filter(t => t.parentId === task.id)
        : [];

    // Prefer derivedSubtasks if available (as they reflect the flat list state), otherwise fallback to ownSubtasks
    const subtasks = (derivedSubtasks.length > 0 ? derivedSubtasks : ownSubtasks) as any[];
    const hasSubtasks = subtasks.length > 0;


    const subtasksCompleted = subtasks.filter(t => t.status === 'done').length;
    const subtaskProgress = hasSubtasks ? (subtasksCompleted / subtasks.length) * 100 : 0;

    // Date display
    const dateInfo = useMemo(() => {
        if (!task.dueDate) return null;
        return formatRelativeDate(new Date(task.dueDate));
    }, [task.dueDate]);

    const isUrgent = dateInfo?.text === "Today" || dateInfo?.text?.includes("overdue");

    let cardStyle = "bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500/30";

    if (isUrgent && !isDone) {
        cardStyle = "bg-red-50/90 border-red-200 dark:bg-red-900/20 dark:border-red-800/50 shadow-sm shadow-red-500/10";
    } else if (task.energyLevel === 'high_focus') {
        cardStyle = "bg-amber-50/50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-500/20 hover:border-amber-300";
    } else if (task.energyLevel === 'low_energy') {
        cardStyle = "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-500/20 hover:border-emerald-300";
    }

    const [isExiting, setIsExiting] = useState(false);

    // Handler with delay for visual feedback
    const handleToggle = (t: Task) => {
        // Should we delay? The strikethrough needs to be seen.
        // If we don't delay, the optimistic update in parent might move it or re-render it instantly.
        // Let's rely on the fact that isDone will flip, and the component stays mounted. 
        // But if we want to ensure the "pop" happens first:
        onToggle?.(t);
    };

    const handleDelete = (id: string) => {
        setIsExiting(true);
        // Wait for exit animation (approx 300ms) before actual delete
        setTimeout(() => {
            onDelete?.(id);
        }, 300);
    };

    return (
        <div className={cn(
            "group flex flex-col p-3 rounded-xl border transition-all shadow-sm",
            cardStyle,
            className,
            isExiting && "opacity-0 scale-95 pointer-events-none duration-300" // Manual exit style
        )}>
            <div className="flex items-start gap-3">
                <motion.button
                    whileTap={{ scale: 0.8 }}
                    animate={{ scale: isDone ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        // No confetti
                        handleToggle(task);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className={cn(
                        "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 cursor-pointer",
                        isDone ? "bg-blue-600 border-blue-600 text-white" :
                            isUrgent ? "border-red-400 dark:border-red-500 hover:border-red-600 text-transparent" :
                                task.energyLevel === 'high_focus' ? "border-amber-300 dark:border-amber-600 hover:border-amber-500 text-transparent" :
                                    task.energyLevel === 'low_energy' ? "border-emerald-300 dark:border-emerald-600 hover:border-emerald-500 text-transparent" :
                                        "border-slate-300 dark:border-slate-600 hover:border-blue-500 text-transparent"
                    )}
                >
                    <motion.div
                        initial={false}
                        animate={{ scale: isDone ? 1 : 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        <Check size={12} strokeWidth={3} />
                    </motion.div>
                </motion.button>

                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit?.(task)}>
                    <div className="flex items-start justify-between gap-2">
                        <div className="relative">
                            <p className={cn(
                                "text-sm font-medium break-words transition-colors duration-300",
                                isDone ? "text-slate-400" : "text-slate-700 dark:text-slate-200"
                            )}>
                                {task.title}
                            </p>
                            {/* Strikethrough Animation */}
                            <motion.div
                                initial={false}
                                animate={{ width: isDone ? "100%" : "0%" }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="absolute top-1/2 left-0 h-0.5 bg-slate-400 pointer-events-none mt-[1px]"
                            />
                        </div>
                        {onDelete && (
                            <motion.button
                                whileTap={{ scale: 0.9, color: "#EF4444" }}
                                onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}
                                onPointerDown={(e) => e.stopPropagation()}
                                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                            >
                                <Trash2 size={14} />
                            </motion.button>
                        )}
                    </div>

                    {task.description && (
                        <p className={cn(
                            "text-xs mt-1 font-normal line-clamp-3 whitespace-pre-line",
                            isDone ? "text-slate-400" : "text-slate-500 dark:text-slate-400"
                        )}>
                            {task.description}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        {showEnergy && task.energyLevel && (
                            <EnergyBadge level={task.energyLevel as any} />
                        )}
                        {showContext && task.contextId && (
                            <ContextTag contextId={task.contextId} />
                        )}
                        {dateInfo && (
                            <div className={cn(
                                "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md border",
                                dateInfo.colorClass
                            )}>
                                {dateInfo.text}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Subtasks inline display */}
            {(hasSubtasks || true) && ( // Always render if we want to show input, but SubtaskList handles empty check
                <SubtaskList
                    parentTask={task}
                    subtasks={subtasks}
                    onToggleSubtask={(subtask) => {
                        // We need a specific handler passed from parent, or we dispatch a custom event/callback
                        // For now, let's assume onToggle handles it or we need a new prop.
                        // Actually, we need to pass a new prop `onToggleSubtask`.
                        // But for now, let's assume the parent component will handle it via onEdit if needed?
                        // Wait, onToggle is for the TASK.
                        // I need to add `onToggleSubtask` to TaskCard props or handling.
                        // Let's rely on the parent updating this.
                        if (onToggleSubtask) {
                            onToggleSubtask(subtask);
                        }
                    }}
                    onDeleteSubtask={onDeleteSubtask}
                    onAddSubtask={onAddSubtask}
                />
            )}
        </div>
    );
}
