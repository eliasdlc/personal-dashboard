'use client';

import { useState, useEffect } from "react";
import { Task } from "@/components/dashboard/TaskWidget";
import { PlanningView } from "./PlanningView";
import { ExecutionView } from "./ExecutionView";
import { Confetti } from "@/components/ui/confetti";
import { Button } from "@/components/ui/button";
import { LayoutGrid, ListTodo, Plus } from "lucide-react";
import { QuickAdd } from "./QuickAdd";

export function EnergyFlowModule() {
    const [mode, setMode] = useState<'planning' | 'execution'>('execution');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showConfetti, setShowConfetti] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showQuickAdd, setShowQuickAdd] = useState(false);

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
                    </div>
                </div>

                <Button
                    size="sm"
                    onClick={() => setShowQuickAdd(!showQuickAdd)}
                    className={`gap-2 transition-all ${showQuickAdd ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                >
                    <Plus size={16} className={showQuickAdd ? "rotate-45 transition-transform" : "transition-transform"} />
                    {showQuickAdd ? 'Close' : 'Quick Add'}
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
                    />
                ) : (
                    <ExecutionView
                        tasks={tasks}
                        onToggle={handleToggleDone}
                        onDelete={handleDelete}
                        onUpdateEnergy={handleUpdateEnergy}
                        onReorder={handleReorder}
                        onCleanSlate={handleCleanSlate}
                    />
                )}
            </div>
            <Confetti active={showConfetti} />
        </div>
    );
}
