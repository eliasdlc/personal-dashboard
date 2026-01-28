import { Task } from "@/components/dashboard/TaskWidget";
import { TaskCard } from "./TaskCard";
import { SortableTaskCard } from "./SortableTaskCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap, Coffee, RefreshCw, AlertCircle } from "lucide-react";
import { DndContext, DragOverlay, useDroppable, DragEndEvent, DragStartEvent, useSensors, useSensor, MouseSensor, TouchSensor } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ExecutionViewProps {
    tasks: Task[];
    onToggle: (task: Task) => void;
    onDelete: (taskId: string) => void;
    onUpdateEnergy: (taskId: string, energy: 'high_focus' | 'low_energy') => void;
    onReorder: (tasksToUpdate: { id: string, position: number }[]) => void;
    onCleanSlate?: () => void;
    onEdit: (task: Task) => void;
}

export function ExecutionView({ tasks, onToggle, onDelete, onUpdateEnergy, onReorder, onCleanSlate, onEdit }: ExecutionViewProps) {
    const todayTasks = tasks.filter(t => t.statusFunnel === 'today');
    const highFocusTasks = todayTasks.filter(t => t.energyLevel === 'high_focus' && t.status === 'todo');
    const lowEnergyTasks = todayTasks.filter(t => t.energyLevel === 'low_energy' && t.status === 'todo');
    const [activeId, setActiveId] = useState<string | null>(null);

    // Progress Logic
    const completedCount = todayTasks.filter(t => t.status === 'done').length;
    const totalCount = todayTasks.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    // Clean Slate Logic
    const pendingCount = todayTasks.length - completedCount;
    const showCleanSlate = pendingCount > 5;

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    );

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const taskId = active.id as string;
        const overId = over.id as string;

        const isHighFocus = highFocusTasks.find(t => t.id === taskId);
        const isLowEnergy = lowEnergyTasks.find(t => t.id === taskId);

        if (active.id !== over.id) {
            if (isHighFocus && highFocusTasks.find(t => t.id === overId)) {
                const oldIndex = highFocusTasks.findIndex(t => t.id === active.id);
                const newIndex = highFocusTasks.findIndex(t => t.id === over.id);
                const reorderedTasks = arrayMove(highFocusTasks, oldIndex, newIndex);

                const updates = reorderedTasks.map((t, index) => ({
                    id: t.id,
                    position: index
                }));
                onReorder(updates);
            } else if (isLowEnergy && lowEnergyTasks.find(t => t.id === overId)) {
                const oldIndex = lowEnergyTasks.findIndex(t => t.id === active.id);
                const newIndex = lowEnergyTasks.findIndex(t => t.id === over.id);
                const reorderedTasks = arrayMove(lowEnergyTasks, oldIndex, newIndex);

                const updates = reorderedTasks.map((t, index) => ({
                    id: t.id,
                    position: index
                }));
                onReorder(updates);
            }
        }

        if (isHighFocus && (overId === 'low-energy-droppable' || lowEnergyTasks.find(t => t.id === overId) && !highFocusTasks.find(t => t.id === overId))) {
            onUpdateEnergy(taskId, 'low_energy');
        } else if (isLowEnergy && (overId === 'high-focus-droppable' || highFocusTasks.find(t => t.id === overId) && !lowEnergyTasks.find(t => t.id === overId))) {
            onUpdateEnergy(taskId, 'high_focus');
        }
    }

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex flex-col gap-6 h-full">

                {/* Gamification Dashboard */}
                <div className="flex flex-col gap-4 shrink-0">
                    {/* Progress Bar */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-xs text-slate-500 font-medium uppercase tracking-wider">
                            <span>Daily Progress</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-linear-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Clean Slate Button */}
                    {showCleanSlate && onCleanSlate && (
                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                <AlertCircle size={18} />
                                <span className="text-sm font-medium">Overwhelmed?</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    if (confirm('This will move all pending tasks to the backlog. Are you sure?')) {
                                        onCleanSlate();
                                    }
                                }}
                                className="h-8 gap-2 bg-white dark:bg-transparent border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <RefreshCw size={14} />
                                Clean Slate
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex flex-col md:flex-row flex-1 min-h-0 gap-6">
                    {/* High Focus Column */}
                    <ExecutionColumn
                        id="high-focus-droppable"
                        title="High Focus"
                        subtitle="Deep work & complex tasks"
                        count={highFocusTasks.length}
                        tasks={highFocusTasks}
                        onToggle={onToggle}
                        onDelete={onDelete}
                        onEdit={onEdit}
                        icon={<Zap size={18} className="fill-current" />}
                        headerClass="border-amber-200 dark:border-amber-500/20"
                        iconClass="bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        badgeClass="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/20"
                        cardClass="border-l-4 border-l-amber-400 dark:border-l-amber-500 hover:border-amber-300 dark:hover:border-amber-500/50"
                        emptyText="No high focus tasks for today."
                    />

                    {/* Vertical Divider */}
                    <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-800 my-4" />

                    {/* Zombie Mode Column */}
                    <ExecutionColumn
                        id="low-energy-droppable"
                        title="Zombie Mode"
                        subtitle="Low energy & admin tasks"
                        count={lowEnergyTasks.length}
                        tasks={lowEnergyTasks}
                        onToggle={onToggle}
                        onDelete={onDelete}
                        onEdit={onEdit}
                        icon={<Coffee size={18} />}
                        headerClass="border-emerald-200 dark:border-emerald-500/20"
                        iconClass="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        badgeClass="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20"
                        cardClass="border-l-4 border-l-emerald-400 dark:border-l-emerald-500 opacity-90 hover:opacity-100 hover:border-emerald-300 dark:hover:border-emerald-500/50"
                        emptyText="No low energy tasks for today."
                    />
                </div>
            </div>

            <DragOverlay>
                {activeId ? (
                    <TaskCard task={tasks.find(t => t.id === activeId) as any} className="opacity-80 rotate-2 cursor-grabbing" />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

interface ExecutionColumnProps {
    id: string;
    title: string;
    subtitle: string;
    count: number;
    tasks: Task[];
    onToggle: (task: Task) => void;
    onDelete: (id: string) => void;
    onEdit: (task: Task) => void;
    icon: React.ReactNode;
    headerClass: string;
    iconClass: string;
    badgeClass: string;
    cardClass: string;
    emptyText: string;
}

function ExecutionColumn({ id, title, subtitle, count, tasks, onToggle, onDelete, onEdit, icon, headerClass, iconClass, badgeClass, cardClass, emptyText }: ExecutionColumnProps) {
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
                    <div className="space-y-3 pb-4 min-h-[100px]">
                        {tasks.map(task => (
                            <SortableTaskCard
                                key={task.id}
                                task={task}
                                onToggle={onToggle}
                                onDelete={onDelete}
                                onEdit={onEdit}
                                className={cardClass}
                            />
                        ))}
                        {tasks.length === 0 && (
                            <div className="text-center py-12 text-slate-400 dark:text-slate-600 text-sm">
                                {emptyText}
                            </div>
                        )}
                    </div>
                </SortableContext>
            </ScrollArea>
        </div>
    );
}
