import { Task } from "@/components/dashboard/TaskWidget";
import { TaskCard } from "./TaskCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Archive, CheckCircle2 } from "lucide-react";

interface ArchiveViewProps {
    tasks: Task[];
    onToggle: (task: Task) => void;
    onDelete: (taskId: string) => void;
    onUpdateEnergy: (taskId: string, energy: 'high_focus' | 'low_energy') => void;
    onEdit: (task: Task) => void;
}

export function ArchiveView({ tasks, onToggle, onDelete, onUpdateEnergy, onEdit }: ArchiveViewProps) {
    const completedTasks = tasks.filter(t => t.status === 'done');

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    <Archive size={18} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Completed Tasks</h3>
                    <p className="text-xs text-slate-500">History of your productivity</p>
                </div>
                <span className="ml-auto px-2.5 py-0.5 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400">
                    {completedTasks.length}
                </span>
            </div>

            <ScrollArea className="flex-1 -mr-3 pr-3">
                <div className="space-y-3 pb-4">
                    {completedTasks.length > 0 ? (
                        completedTasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onToggle={onToggle}
                                onDelete={onDelete}
                                onEdit={onEdit}
                                className="opacity-75 hover:opacity-100 transition-opacity"
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-600">
                            <CheckCircle2 size={48} className="mb-4 opacity-20" />
                            <p className="text-sm">No completed tasks yet.</p>
                            <p className="text-xs mt-1 opacity-70">Finish some tasks to see them here!</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}