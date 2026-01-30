import { Task } from "@/components/dashboard/TaskWidget";
import { TaskCard } from "./TaskCard";
import { SortableTaskCard } from "./SortableTaskCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DndContext, DragOverlay, useDroppable, DragEndEvent, DragStartEvent, useSensor, useSensors, MouseSensor, TouchSensor } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";
import { Archive, Calendar, Sun } from "lucide-react";

interface PlanningViewProps {
    tasks: Task[];
    onMoveToToday: (taskId: string) => void;
    onMoveToWeekly: (taskId: string) => void;
    onMoveToBacklog: (taskId: string) => void;
    onDelete: (taskId: string) => void;
    onReorder: (tasksToUpdate: { id: string, position: number }[]) => void;
    onEdit: (task: Task) => void;
    onToggleSubtask?: (subtask: any) => void;
    onDeleteSubtask?: (subtaskId: string) => void;
}

export function PlanningView({ tasks, onMoveToToday, onMoveToWeekly, onMoveToBacklog, onDelete, onReorder, onEdit, onToggleSubtask, onDeleteSubtask }: PlanningViewProps) {
    // Filter tasks for each column - EXCLUDING subtasks (tasks with parentId)
    const backlogTasks = tasks.filter(t => (t.statusFunnel === 'backlog' || !t.statusFunnel) && !t.parentId);
    const weeklyTasks = tasks.filter(t => t.statusFunnel === 'weekly' && t.status !== 'done' && !t.parentId);
    const todayTasks = tasks.filter(t => t.statusFunnel === 'today' && t.status !== 'done' && !t.parentId);
    const [activeId, setActiveId] = useState<string | null>(null);

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
        const activeContainer = active.data.current?.sortable.containerId || getContainerId(taskId);
        const overContainer = over.data.current?.sortable.containerId || overId; // Droppable ID if over container, or over id

        // Helper to find which list a task belongs to
        const findContainer = (id: string) => {
            if (backlogTasks.find(t => t.id === id)) return 'backlog-droppable';
            if (weeklyTasks.find(t => t.id === id)) return 'weekly-droppable';
            if (todayTasks.find(t => t.id === id)) return 'today-droppable';
            return null;
        };

        const activeListId = findContainer(taskId);
        // Map droppable IDs to funnels
        const listToFunnel = {
            'backlog-droppable': 'backlog',
            'weekly-droppable': 'weekly',
            'today-droppable': 'today'
        };

        // Determine target funnel based on overId
        let targetFunnel = null;
        if (overId === 'backlog-droppable' || findContainer(overId) === 'backlog-droppable') targetFunnel = 'backlog';
        if (overId === 'weekly-droppable' || findContainer(overId) === 'weekly-droppable') targetFunnel = 'weekly';
        if (overId === 'today-droppable' || findContainer(overId) === 'today-droppable') targetFunnel = 'today';

        if (targetFunnel && activeListId && listToFunnel[activeListId as keyof typeof listToFunnel] !== targetFunnel) {
            // Moving between lists
            if (targetFunnel === 'today') onMoveToToday(taskId);
            if (targetFunnel === 'weekly') onMoveToWeekly(taskId);
            if (targetFunnel === 'backlog') onMoveToBacklog(taskId);
        } else if (active.id !== over.id) {
            // Reordering within same list
            const processReorder = (listTasks: Task[]) => {
                const oldIndex = listTasks.findIndex(t => t.id === active.id);
                const newIndex = listTasks.findIndex(t => t.id === over.id);
                if (oldIndex !== -1 && newIndex !== -1) {
                    const reorderedTasks = arrayMove(listTasks, oldIndex, newIndex);
                    const updates = reorderedTasks.map((t, index) => ({ id: t.id, position: index }));
                    onReorder(updates);
                }
            };

            if (activeListId === 'backlog-droppable') processReorder(backlogTasks);
            if (activeListId === 'weekly-droppable') processReorder(weeklyTasks);
            if (activeListId === 'today-droppable') processReorder(todayTasks);
        }
    }

    function getContainerId(id: string) {
        if (backlogTasks.find(t => t.id === id)) return 'backlog-droppable';
        if (weeklyTasks.find(t => t.id === id)) return 'weekly-droppable';
        if (todayTasks.find(t => t.id === id)) return 'today-droppable';
        return null;
    }

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex flex-col md:flex-row h-full gap-4 md:gap-6 overflow-x-auto pb-2">
                {/* Backlog Column */}
                <DroppableColumn
                    id="backlog-droppable"
                    title="Backlog"
                    count={backlogTasks.length}
                    tasks={backlogTasks}
                    allTasks={tasks}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onToggleSubtask={onToggleSubtask}
                    onDeleteSubtask={onDeleteSubtask}
                    columnClass="min-w-[280px] w-full md:w-80 bg-slate-50/50 dark:bg-slate-900/20 border-slate-200/50 dark:border-slate-800/50"
                    headerClass="text-slate-500 dark:text-slate-400"
                    badgeClass="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    cardClass="hover:border-slate-300 dark:hover:border-slate-600"
                    emptyIcon={<Archive size={24} />}
                    emptyText="Empty backlog"
                />

                {/* Weekly Column */}
                <DroppableColumn
                    id="weekly-droppable"
                    title="This Week"
                    count={weeklyTasks.length}
                    tasks={weeklyTasks}
                    allTasks={tasks}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onToggleSubtask={onToggleSubtask}
                    onDeleteSubtask={onDeleteSubtask}
                    columnClass="min-w-[280px] w-full md:w-80 bg-purple-50/30 dark:bg-purple-900/10 border-purple-100/50 dark:border-purple-500/10"
                    headerClass="text-purple-600 dark:text-purple-400"
                    badgeClass="bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300"
                    emptyIcon={<Calendar size={24} />}
                    emptyText="No tasks for this week"
                />

                {/* Today Bucket */}
                <DroppableColumn
                    id="today-droppable"
                    title="Today's Plan"
                    count={todayTasks.length}
                    tasks={todayTasks}
                    allTasks={tasks}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onToggleSubtask={onToggleSubtask}
                    onDeleteSubtask={onDeleteSubtask}
                    columnClass="min-w-[280px] w-full md:w-80 shrink-0 bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-500/20"
                    headerClass="text-blue-600 dark:text-blue-400"
                    badgeClass="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300"
                    cardClass="border-blue-200 dark:border-blue-500/30 bg-white/80 dark:bg-slate-900/80 hover:border-blue-400 dark:hover:border-blue-400"
                    emptyIcon={<Sun size={24} />}
                    emptyText="No tasks for today"
                />
            </div>

            <DragOverlay>
                {activeId ? (
                    <TaskCard task={tasks.find(t => t.id === activeId) as any} className="opacity-80 rotate-2 cursor-grabbing bg-white dark:bg-slate-800 shadow-xl" />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

interface DroppableColumnProps {
    id: string;
    title: string;
    count: number;
    tasks: Task[];
    allTasks?: Task[];
    onDelete: (id: string) => void;
    onEdit: (task: Task) => void;
    onToggleSubtask?: (subtask: any) => void;
    onDeleteSubtask?: (subtaskId: string) => void;
    columnClass: string;
    headerClass: string;
    badgeClass: string;
    cardClass?: string;
    emptyIcon?: React.ReactNode;
    emptyText?: string;
}

function DroppableColumn({ id, title, count, tasks, allTasks, onDelete, onEdit, onToggleSubtask, onDeleteSubtask, columnClass, headerClass, badgeClass, cardClass, emptyIcon, emptyText }: DroppableColumnProps) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className={`flex flex-col min-w-0 rounded-2xl border p-4 ${columnClass} ${id === 'today-droppable' ? '' : 'flex-1'}`}>
            <h3 className={`font-semibold mb-4 text-sm uppercase tracking-wider flex items-center justify-between ${headerClass}`}>
                {title}
                <span className={`px-2 py-0.5 rounded-full text-xs ${badgeClass}`}>{count}</span>
            </h3>
            <ScrollArea className="flex-1 -mr-3 pr-3">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3 pb-4 min-h-[100px]">
                        {tasks.map(task => (
                            <div key={task.id} className="relative group">
                                <SortableTaskCard
                                    task={task}
                                    allTasks={allTasks}
                                    onDelete={onDelete}
                                    onEdit={onEdit}
                                    onToggleSubtask={onToggleSubtask}
                                    onDeleteSubtask={onDeleteSubtask}
                                    className={cardClass}
                                />
                            </div>
                        ))}
                        {tasks.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                {emptyIcon && (
                                    <div className="mb-2 text-slate-300 dark:text-slate-600">
                                        {emptyIcon}
                                    </div>
                                )}
                                <p className="text-slate-400 dark:text-slate-500 text-sm">
                                    {emptyText || "Drop tasks here"}
                                </p>
                            </div>
                        )}
                    </div>
                </SortableContext>
            </ScrollArea>
        </div>
    );
}
