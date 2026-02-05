'use client';

import { Task } from "@/components/dashboard/TaskWidget";
import { TaskCard } from "./TaskCard";
import { SortableTaskCard } from "./SortableTaskCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap, Coffee } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { StaggerContainer } from "@/components/ui/animations";

interface ExecutionColumnProps {
    id: string;
    title: string;
    subtitle: string;
    count: number;
    tasks: Task[];
    allTasks?: Task[];
    onToggle: (task: Task) => void;
    onDelete: (id: string) => void;
    onEdit: (task: Task) => void;
    icon: React.ReactNode;
    headerClass: string;
    iconClass: string;
    badgeClass: string;
    cardClass: string;
    emptyText: string;
    emptyIcon?: React.ReactNode;
    onToggleSubtask?: (subtask: any) => void;
    onDeleteSubtask?: (subtaskId: string) => void;
    onAddSubtask?: (parentId: string, title: string) => void;
    showTaskEnergy?: boolean;
}

export function ExecutionColumn({
    id,
    title,
    subtitle,
    count,
    tasks,
    allTasks,
    onToggle,
    onDelete,
    onEdit,
    icon,
    headerClass,
    iconClass,
    badgeClass,
    cardClass,
    emptyText,
    emptyIcon,
    onToggleSubtask,
    onDeleteSubtask,
    onAddSubtask,
    showTaskEnergy = true
}: ExecutionColumnProps) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className="flex-1 flex flex-col min-w-0">
            <div className={`flex items-center gap-2 mb-4 pb-2 border-b ${headerClass}`}>
                <div className={`p-1.5 rounded-lg ${iconClass}`}>
                    {icon}
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
                    <p className="text-xs text-slate-500">{subtitle}</p>
                </div>
                <span className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeClass}`}>
                    {count}
                </span>
            </div>

            <ScrollArea className="flex-1 -mr-3 pr-3">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    <StaggerContainer className="space-y-3 pb-4 min-h-[100px]">
                        {tasks.map(task => (
                            <SortableTaskCard
                                key={task.id}
                                task={task}
                                allTasks={allTasks}
                                onToggle={onToggle}
                                onDelete={onDelete}
                                onEdit={onEdit}
                                onToggleSubtask={onToggleSubtask}
                                onDeleteSubtask={onDeleteSubtask}
                                onAddSubtask={onAddSubtask}
                                className={cardClass}
                                showTaskEnergy={showTaskEnergy}
                            />
                        ))}
                        {tasks.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                {emptyIcon && (
                                    <div className="mb-3 text-slate-300 dark:text-slate-600">
                                        {emptyIcon}
                                    </div>
                                )}
                                <p className="text-slate-400 dark:text-slate-600 text-sm">
                                    {emptyText}
                                </p>
                            </div>
                        )}
                    </StaggerContainer>
                </SortableContext>
            </ScrollArea>
        </div>
    );
}
