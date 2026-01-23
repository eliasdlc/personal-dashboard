'use client';

import { useState, useEffect } from "react";
import { Task } from "@/components/dashboard/TaskWidget";
import { PlanningView } from "./PlanningView";
import { ExecutionView } from "./ExecutionView";
import { Confetti } from "@/components/ui/confetti";
import { Button } from "@/components/ui/button";
import { Archive, LayoutGrid, ListTodo, Plus } from "lucide-react";
import { QuickAdd } from "./QuickAdd";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ArchiveView } from "./ArchiveView";
import { useRouter } from "next/navigation";

export function EnergyFlowModule() {
    const router = useRouter();

    const [mode, setMode] = useState<'planning' | 'execution' | 'archive'>('execution');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showConfetti, setShowConfetti] = useState(false);
    const [loading, setLoading] = useState(true);

    const [showQuickAdd, setShowQuickAdd] = useState(false);

    // Editing State
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editEnergy, setEditEnergy] = useState<'high_focus' | 'low_energy' | 'none'>('none');
    const [editDate, setEditDate] = useState<Date | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);

    function openEditModal(task: Task) {
        setEditingTask(task);
        setEditTitle(task.title);
        setEditDesc(task.description || '');
        setEditEnergy(task.energyLevel || 'none');
        setEditDate(task.dueDate ? new Date(task.dueDate) : undefined);
    }

    async function handleSaveEdit() {
        if (!editingTask || !editTitle.trim()) return;

        try {
            setIsSaving(true);
            const energyLevelValue = editEnergy === 'none' ? null : editEnergy;

            const res = await fetch(`/api/tasks/${editingTask.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingTask.id,
                    title: editTitle.trim(),
                    description: editDesc.trim() || null,
                    energyLevel: energyLevelValue,
                    dueDate: editDate || null
                })
            });

            if (!res.ok) throw new Error('Failed to update task');

            const updatedTask = await res.json();
            // Optimistic update
            setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...updatedTask, energyLevel: energyLevelValue } : t));
            setEditingTask(null);
        } catch (err) {
            console.error(err);
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
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, statusFunnel: funnel } : t));

        try {
            await fetch(`/api/tasks`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: taskId, statusFunnel: funnel }),
            });
        } catch (error) {
            console.error("Failed to update task", error);
            fetchTasks(); // Revert on error
        }
    }

    async function handleDelete(taskId: string) {
        if (!confirm('Are you sure you want to delete this task?')) return;

        // Optimistic
        setTasks(prev => prev.filter((t: Task) => t.id !== taskId));

        try {
            await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
        } catch (error) {
            console.error("Failed to delete task", error);
            fetchTasks();
        }
    }

    async function handleToggleDone(task: Task) {
        const newStatus = task.status === 'done' ? 'todo' : 'done';
        // Optimistic
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

        if (newStatus === 'done') {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2500);
        }

        try {
            const res = await fetch(`/api/tasks`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: task.id, status: newStatus }),
            });
        } catch (error) {
            console.error("Failed to toggle task", error);
            fetchTasks();
        }
    }

    async function handleUpdateEnergy(taskId: string, energy: 'high_focus' | 'low_energy') {
        // Optimistic
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, energyLevel: energy } : t));

        try {
            await fetch(`/api/tasks`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: taskId, energyLevel: energy }),
            });
        } catch (error) {
            console.error("Failed to update energy level", error);
            fetchTasks();
        }
    }

    async function handleReorder(tasksToUpdate: { id: string, position: number }[]) {
        // Optimistic
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
            // Batch update or individual updates
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
                // Optimistic update: move all 'today' todo tasks to 'backlog'
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

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800/60 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/40 backdrop-blur-md">
                <div className="flex items-center gap-3">
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
                    />
                ) : mode === 'execution' ? (
                    <ExecutionView
                        tasks={tasks}
                        onToggle={handleToggleDone}
                        onDelete={handleDelete}
                        onUpdateEnergy={handleUpdateEnergy}
                        onReorder={handleReorder}
                        onCleanSlate={handleCleanSlate}
                        onEdit={openEditModal}
                    />
                ) : (
                    <ArchiveView
                        tasks={tasks}
                        onToggle={handleToggleDone}
                        onDelete={handleDelete}
                        onUpdateEnergy={handleUpdateEnergy}
                        onEdit={openEditModal}
                    />
                )}
            </div>
            <Confetti active={showConfetti} />

            <Modal
                isOpen={!!editingTask}
                onClose={() => setEditingTask(null)}
                title="Edit Task"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
                        <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Task title"
                            className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                        <Textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="Description (optional)"
                            className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 resize-none"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Energy Level</label>
                            <Select value={editEnergy} onValueChange={(v: any) => setEditEnergy(v)}>
                                <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                    <SelectValue placeholder="Select energy" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="high_focus">High Focus</SelectItem>
                                    <SelectItem value="low_energy">Low Energy</SelectItem>
                                    <SelectItem value="none">None (Clear)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

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
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={editDate}
                                        onSelect={setEditDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
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
            </Modal>
        </div>
    );
}
