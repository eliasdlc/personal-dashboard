import { Task } from "@/components/dashboard/TaskWidget";
import { TaskCard } from "./TaskCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Archive, CheckCircle2, Calendar, CalendarDays, CalendarRange } from "lucide-react";
import { useState } from "react";
import { isToday, isSameWeek, isSameMonth, parseISO } from "date-fns";

interface ArchiveViewProps {
    tasks: Task[];
    onToggle: (task: Task) => void;
    onDelete: (taskId: string) => void;
    onEdit: (task: Task) => void;
}

type FilterType = 'today' | 'week' | 'month' | 'all';

export function ArchiveView({ tasks, onToggle, onDelete, onEdit }: ArchiveViewProps) {
    const [filter, setFilter] = useState<FilterType>('today');

    const completedTasks = tasks.filter(t => t.status === 'done' && !t.parentId);

    // Filter logic
    const filteredTasks = completedTasks.filter(task => {
        if (!task.completedAt) return false;

        // Handle both ISO strings and Date objects if necessary (assuming string from API)
        const completedDate = typeof task.completedAt === 'string'
            ? parseISO(task.completedAt)
            : new Date(task.completedAt);

        const now = new Date();

        switch (filter) {
            case 'today':
                return isToday(completedDate);
            case 'week':
                return isSameWeek(completedDate, now, { weekStartsOn: 1 }); // Monday start
            case 'month':
                return isSameMonth(completedDate, now);
            case 'all':
            default:
                return true;
        }
    });

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-md">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            <Archive size={18} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Archive</h3>
                            <p className="text-xs text-slate-500">History of your productivity</p>
                        </div>
                        <span className="ml-auto px-2.5 py-0.5 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400">
                            {filteredTasks.length}
                        </span>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-lg self-start">
                        <button
                            onClick={() => setFilter('today')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${filter === 'today'
                                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <Calendar size={12} />
                            Today
                        </button>
                        <button
                            onClick={() => setFilter('week')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${filter === 'week'
                                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <CalendarRange size={12} />
                            Week
                        </button>
                        <button
                            onClick={() => setFilter('month')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${filter === 'month'
                                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <CalendarDays size={12} />
                            Month
                        </button>
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${filter === 'all'
                                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            All
                        </button>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-3 pb-4">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onToggle={onToggle}
                                onDelete={onDelete}
                                onEdit={onEdit}
                                className="opacity-75 hover:opacity-100 transition-opacity bg-white dark:bg-slate-900/50"
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600">
                            <div className="p-4 rounded-full bg-slate-50 dark:bg-slate-900/50 mb-4">
                                <Archive size={32} className="opacity-20" />
                            </div>
                            <p className="text-sm font-medium">No archived tasks found</p>
                            <p className="text-xs mt-1 opacity-60">
                                {filter === 'today' ? "No tasks completed today" :
                                    filter === 'week' ? "No tasks completed this week" :
                                        filter === 'month' ? "No tasks completed this month" :
                                            "Your archive is empty"}
                            </p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}