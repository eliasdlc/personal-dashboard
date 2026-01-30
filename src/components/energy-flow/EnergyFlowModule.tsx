'use client';

import { useState, useEffect } from "react";
import { Task } from "@/components/dashboard/TaskWidget";
import { useCompletionSound } from "@/hooks/use-completion-sound";
import { PlanningView } from "./PlanningView";
import { ExecutionView } from "./ExecutionView";
import { Confetti } from "@/components/ui/confetti";
import { Button } from "@/components/ui/button";
import { Archive, LayoutGrid, ListTodo, Plus, Zap, Coffee, X, Check } from "lucide-react";
import { QuickAdd } from "./QuickAdd";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ArchiveView } from "./ArchiveView";
import { SubtaskList } from "./SubtaskList";
import { CONTEXT_LIST } from "@/lib/contexts";
import { EditTaskMobileView } from "./EditTaskMobileView";

export function EnergyFlowModule() {
    const { playCompletionSound } = useCompletionSound();

    const [mode, setMode] = useState<'planning' | 'execution' | 'archive'>('execution');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showConfetti, setShowConfetti] = useState(false);
    const [loading, setLoading] = useState(true);

    const [showQuickAdd, setShowQuickAdd] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Editing State
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editEnergy, setEditEnergy] = useState<'high_focus' | 'low_energy' | 'none'>('none');
    const [editDate, setEditDate] = useState<Date | undefined>(undefined);
    const [editContextId, setEditContextId] = useState<string | null>(null);
    const [editSubtasks, setEditSubtasks] = useState<Task[]>([]); // Draft subtasks
    const [isSaving, setIsSaving] = useState(false);

    function openEditModal(task: Task) {
        setEditingTask(task);
        setEditTitle(task.title);
        setEditDesc(task.description || '');
        setEditEnergy(task.energyLevel || 'none');
        setEditDate(task.dueDate ? new Date(task.dueDate) : undefined);
        setEditContextId(task.contextId || null);

        // Initialize draft subtasks from global state
        const currentSubtasks = tasks.filter(t => t.parentId === task.id);
        setEditSubtasks(currentSubtasks);

        setIsEditModalOpen(true);
    }

    // Draft Subtask Handlers (Local State Only)
    function handleDraftAddSubtask(parentId: string, title: string) {
        const newSubtask: any = {
            id: `temp-${Date.now()}`,
            parentId,
            title,
            status: 'todo',
            userId: editingTask?.userId || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isTemp: true
        };
        setEditSubtasks(prev => [...prev, newSubtask]);
    }

    function handleDraftDeleteSubtask(subtaskId: string) {
        setEditSubtasks(prev => prev.filter(t => t.id !== subtaskId));
    }

    function handleDraftReorderSubtasks(newOrder: any[]) {
        setEditSubtasks(newOrder);
    }

    function handleDraftToggleSubtask(subtask: any) {
        setEditSubtasks(prev => prev.map(t =>
            t.id === subtask.id
                ? { ...t, status: t.status === 'done' ? 'todo' : 'done' }
                : t
        ));
    }

    async function handleSaveEdit() {
        if (!editingTask || !editTitle.trim()) return;

        try {
            setIsSaving(true);
            const energyLevelValue = editEnergy === 'none' ? null : editEnergy;

            // 1. Update Main Task
            const res = await fetch(`/api/tasks/${editingTask.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editTitle,
                    description: editDesc,
                    energyLevel: energyLevelValue,
                    dueDate: editDate ? editDate.toISOString() : null,
                    contextId: editContextId,
                }),
            });

            if (!res.ok) throw new Error('Failed to update task');

            // 2. Process Subtasks Changes
            const originalSubtaskIds = tasks.filter(t => t.parentId === editingTask.id).map(t => t.id);

            // Added (Temp IDs)
            const addedSubtasks = editSubtasks.filter(t => (t as any).isTemp);
            // Deleted (In original but not in draft)
            const currentSubtaskIds = new Set(editSubtasks.map(t => t.id));
            const deletedSubtaskIds = originalSubtaskIds.filter(id => !currentSubtaskIds.has(id));
            // Modified (Status changed) - non-temp only
            const modifiedSubtasks = editSubtasks.filter(t => !(t as any).isTemp && originalSubtaskIds.includes(t.id));

            const promises = [];

            // Execute Additions (with Position)
            addedSubtasks.forEach((sub) => {
                // Find index in the *current* state to get position
                const position = editSubtasks.findIndex(t => t.id === sub.id);
                promises.push(fetch('/api/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: sub.title,
                        parentId: editingTask.id,
                        status: sub.status,
                        position: position
                    })
                }));
            });

            // Execute Deletions
            for (const id of deletedSubtaskIds) {
                promises.push(fetch(`/api/tasks/${id}`, { method: 'DELETE' }));
            }

            // Execute Updates (Status + Position)
            // We iterate over ALL non-new subtasks to ensure position is synced
            const existingSubtasks = editSubtasks.filter(t => !(t as any).isTemp);
            existingSubtasks.forEach((sub) => {
                const position = editSubtasks.findIndex(t => t.id === sub.id);
                promises.push(fetch(`/api/tasks/${sub.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: sub.status,
                        position: position
                    })
                }));
            });

            await Promise.all(promises);

            // Refetch to sync state perfectly
            await fetchTasks();

            setIsEditModalOpen(false);
            setEditingTask(null);
        } catch (error) {
            console.error("Failed to save changes", error);
        } finally {
            setIsSaving(false);
        }
    }


    async function fetchTasks() {
        try {
            setLoading(true);
            const res = await fetch('/api/tasks');
            if (res.ok) {
                const data = await res.json();
                setTasks(data);
            }
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTasks();
    }, []);

    async function handleMoveTask(taskId: string, funnel: 'backlog' | 'weekly' | 'today') {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, statusFunnel: funnel } : t));

        try {
            await fetch(`/api/tasks`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: taskId, statusFunnel: funnel }),
            });
        } catch (error) {
            console.error("Failed to update task", error);
            fetchTasks();
        }
    }

    async function handleDelete(taskId: string) {
        if (!confirm('Are you sure you want to delete this task?')) return;

        // Optimistically remove task
        setTasks(prev => prev.filter((t: Task) => t.id !== taskId));

        try {
            await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
        } catch (error) {
            console.error("Failed to delete task", error);
            fetchTasks();
        }
    }

    async function handleDeleteSubtask(subtaskId: string) {
        if (!confirm('Delete this subtask?')) return;

        // Optimistically remove subtask
        setTasks(prev => prev.filter((t: Task) => t.id !== subtaskId));

        try {
            await fetch(`/api/tasks/${subtaskId}`, { method: 'DELETE' });
        } catch (error) {
            console.error("Failed to delete subtask", error);
            fetchTasks();
        }
    }

    async function handleToggleDone(task: Task) {
        const newStatus = task.status === 'done' ? 'todo' : 'done';

        // Validation: Cannot complete a task if subtasks are incomplete
        if (newStatus === 'done') {
            const incompleteSubtasks = tasks.filter(t => t.parentId === task.id && t.status !== 'done');
            if (incompleteSubtasks.length > 0) {
                alert(`Cannot complete "${task.title}" yet.\nPlease complete all ${incompleteSubtasks.length} subtasks first.`);
                return;
            }
        }

        const now = new Date().toISOString();

        // Optimistic update with completedAt
        setTasks(prev => prev.map(t =>
            t.id === task.id
                ? { ...t, status: newStatus, completedAt: newStatus === 'done' ? now : null }
                : t
        ));

        if (newStatus === 'done') {
            setShowConfetti(true);
            playCompletionSound();
            setTimeout(() => setShowConfetti(false), 2500);

            // Check for auto-completion of parent task
            if (task.parentId) {
                checkParentCompletion(task.parentId, task.id);
            }
        }

        try {
            await fetch(`/api/tasks`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: task.id, status: newStatus }),
            });
        } catch (error) {
            console.error("Failed to toggle task", error);
            fetchTasks();
        }
    }

    // Auto-completion logic: if all subtasks are done, mark parent as done
    async function checkParentCompletion(parentId: string, excludeTaskId: string) {
        const parentTask = tasks.find(t => t.id === parentId);
        if (!parentTask || parentTask.status === 'done') return;

        const siblings = tasks.filter(t => t.parentId === parentId && t.id !== excludeTaskId);
        const allSiblingsDone = siblings.every(t => t.status === 'done');

        if (allSiblingsDone) {
            // All subtasks are done, auto-complete parent
            const now = new Date().toISOString();
            setTasks(prev => prev.map(t =>
                t.id === parentId
                    ? { ...t, status: 'done', completedAt: now }
                    : t
            ));

            try {
                await fetch(`/api/tasks`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: parentId, status: 'done' }),
                });
            } catch (error) {
                console.error("Failed to auto-complete parent task", error);
            }
        }
    }

    async function handleAddSubtask(parentId: string, title: string) {
        const parentTask = tasks.find(t => t.id === parentId);
        if (!parentTask) return;

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    parentId,
                    statusFunnel: parentTask.statusFunnel || 'backlog',
                    energyLevel: parentTask.energyLevel || 'low_energy',
                }),
            });

            if (res.ok) {
                const newTask = await res.json();
                setTasks(prev => [...prev, newTask]);
            }
        } catch (error) {
            console.error("Failed to add subtask", error);
        }
    }



    async function handleUpdateEnergy(taskId: string, energy: 'high_focus' | 'low_energy' | 'none') {
        const newEnergyLevel = energy === 'none' ? null : energy;
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, energyLevel: newEnergyLevel } : t));

        try {
            await fetch(`/api/tasks`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: taskId, energyLevel: newEnergyLevel }),
            });
        } catch (error) {
            console.error("Failed to update energy level", error);
            fetchTasks();
        }
    }

    async function handleReorder(tasksToUpdate: { id: string, position: number }[]) {
        setTasks(prev => {
            const newTasks = [...prev];
            tasksToUpdate.forEach(update => {
                const taskIndex = newTasks.findIndex(t => t.id === update.id);
                if (taskIndex !== -1) {
                    newTasks[taskIndex] = { ...newTasks[taskIndex], position: update.position };
                }
            });
            return newTasks;
        });

        try {
            await Promise.all(tasksToUpdate.map(update =>
                fetch(`/api/tasks`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: update.id, position: update.position }),
                })
            ));
        } catch (error) {
            console.error("Failed to reorder tasks", error);
            fetchTasks();
        }
    }

    async function handleCleanSlate() {
        try {
            const res = await fetch('/api/tasks/clean-slate', { method: 'POST' });
            if (res.ok) {
                setTasks(prev => prev.map(t =>
                    (t.statusFunnel === 'today' && t.status === 'todo')
                        ? { ...t, statusFunnel: 'backlog' }
                        : t
                ));
            }
        } catch (error) {
            console.error('Failed to clean slate:', error);
            fetchTasks();
        }
    }

    // Get subtasks for the currently editing task
    const editingTaskSubtasks = editingTask
        ? tasks.filter(t => t.parentId === editingTask.id)
        : [];

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 gap-2 border-b border-slate-200 dark:border-slate-800/60 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/40 backdrop-blur-md">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Zap size={18} />
                    </div>
                    <span className="hidden sm:inline">Energy Flow</span>
                </h2>

                <div className="flex flex-1 items-start gap-3">
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700/50">
                        <button
                            onClick={() => setMode('planning')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${mode === 'planning'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <ListTodo size={14} />
                            Planning
                        </button>
                        <button
                            onClick={() => setMode('execution')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${mode === 'execution'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <LayoutGrid size={14} />
                            Execution
                        </button>
                        <button
                            onClick={() => setMode('archive')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${mode === 'archive'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <Archive size={14} />
                            <span className="hidden md:inline">Archive</span>
                        </button>
                    </div>
                </div>

                <Button
                    size="sm"
                    onClick={() => setShowQuickAdd(!showQuickAdd)}
                    className={`gap-2 transition-all ${showQuickAdd ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                >
                    <Plus size={16} className={showQuickAdd ? "rotate-45 transition-transform" : "transition-transform"} />
                    <span className="hidden md:inline">{showQuickAdd ? 'Close' : 'Quick Add'}</span>
                </Button>
            </div>

            {/* Quick Add Section */}
            {showQuickAdd && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2">
                    <QuickAdd
                        onTaskAdded={() => { fetchTasks(); setShowQuickAdd(false); }}
                        defaultFunnel={mode === 'execution' ? 'today' : 'backlog'}
                    />
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto md:overflow-hidden p-4 md:p-6 bg-slate-50/30 dark:bg-slate-900/20">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-slate-400">Loading...</div>
                ) : mode === 'planning' ? (
                    <PlanningView
                        tasks={tasks}
                        onMoveToToday={(id) => handleMoveTask(id, 'today')}
                        onMoveToWeekly={(id) => handleMoveTask(id, 'weekly')}
                        onMoveToBacklog={(id) => handleMoveTask(id, 'backlog')}
                        onDelete={handleDelete}
                        onReorder={handleReorder}
                        onEdit={openEditModal}
                        onToggleSubtask={handleToggleDone}
                        onDeleteSubtask={handleDeleteSubtask}
                    />
                ) : mode === 'execution' ? (
                    <ExecutionView
                        tasks={tasks}
                        onToggle={handleToggleDone}
                        onDelete={handleDelete}
                        onDeleteSubtask={handleDeleteSubtask}
                        onUpdateEnergy={handleUpdateEnergy}
                        onReorder={handleReorder}
                        onCleanSlate={handleCleanSlate}
                        onEdit={openEditModal}
                        onToggleSubtask={handleToggleDone}
                        onAddSubtask={handleAddSubtask}
                    />
                ) : (
                    <ArchiveView
                        tasks={tasks}
                        onToggle={handleToggleDone}
                        onDelete={handleDelete}
                        onEdit={openEditModal}
                    />
                )}
            </div>
            <Confetti active={showConfetti} />

            {/* Edit Modal */}
            <Modal
                isOpen={!!editingTask}
                onClose={() => setEditingTask(null)}
                title="Edit Task"
            >
                {/* Desktop View (Hidden on Mobile) */}
                <div className="hidden md:flex flex-col gap-4 h-full w-full">
                    {/* Title - Fixed Top */}
                    <div className="space-y-2 shrink-0">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
                        <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Task title"
                            className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-medium text-lg"
                        />
                    </div>

                    {/* Middle Content - Takes remaining height */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0">
                        {/* Main Content Column */}
                        <div className="md:col-span-8 flex flex-col h-full gap-4 min-h-0">
                            {/* Description */}
                            <div className="space-y-2 shrink-0">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                                <Textarea
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    placeholder="Add details..."
                                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 resize-none min-h-[80px] max-h-[150px]"
                                />
                            </div>

                            {/* Subtasks Section */}
                            <div className="flex flex-col flex-1 min-h-0 space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 shrink-0">
                                    Subtasks {editSubtasks.length > 0 && (
                                        <span className="text-slate-400">({editSubtasks.filter(t => t.status === 'done').length}/{editSubtasks.length})</span>
                                    )}
                                </label>

                                <div className="flex-1 min-h-0 relative">
                                    <div className="absolute inset-0">
                                        {editingTask && (
                                            <SubtaskList
                                                parentTask={editingTask}
                                                subtasks={editSubtasks}
                                                onToggleSubtask={handleDraftToggleSubtask}
                                                onDeleteSubtask={handleDraftDeleteSubtask}
                                                onAddSubtask={handleDraftAddSubtask}
                                                onReorder={handleDraftReorderSubtasks}
                                                showAddInput={true}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Column (Metadata) */}
                        <div className="md:col-span-4 space-y-6 md:pl-6 md:border-l border-slate-100 dark:border-slate-800 overflow-y-auto custom-scrollbar">
                            {/* Due Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Due Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800",
                                                !editDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {editDate ? format(editDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-fit p-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={editDate}
                                            onSelect={setEditDate}
                                            className="p-3 w-[200px]"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Energy Level */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Energy Level</label>
                                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditEnergy('high_focus')}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                                            editEnergy === 'high_focus'
                                                ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10"
                                                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900/50"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-1.5 rounded-md",
                                            editEnergy === 'high_focus' ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                        )}>
                                            <Zap size={16} className="fill-current" />
                                        </div>
                                        <span className={cn("text-xs font-medium", editEnergy === 'high_focus' ? "text-amber-700 dark:text-amber-400" : "text-slate-600 dark:text-slate-400")}>
                                            High Focus
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setEditEnergy('low_energy')}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                                            editEnergy === 'low_energy'
                                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                                                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900/50"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-1.5 rounded-md",
                                            editEnergy === 'low_energy' ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                        )}>
                                            <Coffee size={16} />
                                        </div>
                                        <span className={cn("text-xs font-medium", editEnergy === 'low_energy' ? "text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400")}>
                                            Low Energy
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Context Tags */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tags</label>
                                <div className="flex flex-wrap gap-2">
                                    {CONTEXT_LIST.map(ctx => (
                                        <button
                                            key={ctx.id}
                                            onClick={() => setEditContextId(editContextId === ctx.id ? null : ctx.id)}
                                            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${editContextId === ctx.id
                                                ? `${ctx.color.bg} ${ctx.color.text}`
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {editContextId === ctx.id && <Check size={12} />}
                                            <ctx.icon size={12} />
                                            {ctx.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/50 mt-auto shrink-0">
                        <Button
                            variant="ghost"
                            onClick={() => setEditingTask(null)}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveEdit}
                            disabled={isSaving || !editTitle.trim()}
                            className="bg-blue-600 hover:bg-blue-500 text-white"
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>

                {/* Mobile View (Hidden on Desktop) */}
                <div className="md:hidden flex flex-col h-full">
                    <EditTaskMobileView
                        editTitle={editTitle} setEditTitle={setEditTitle}
                        editDesc={editDesc} setEditDesc={setEditDesc}
                        editEnergy={editEnergy as any} setEditEnergy={setEditEnergy}
                        editDate={editDate} setEditDate={setEditDate}
                        editContextId={editContextId} setEditContextId={setEditContextId}
                        editSubtasks={editSubtasks}
                        editingTask={editingTask}
                        isSaving={isSaving}
                        onClose={() => setEditingTask(null)}
                        onSave={handleSaveEdit}
                        onToggleSubtask={handleDraftToggleSubtask}
                        onDeleteSubtask={handleDraftDeleteSubtask}
                        onAddSubtask={handleDraftAddSubtask}
                        onReorderSubtasks={handleDraftReorderSubtasks}
                    />
                </div>
            </Modal >
        </div >
    );
}
