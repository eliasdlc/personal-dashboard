// src/components/dashboard/TaskWidget.tsx
'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useMemo } from "react";
import { Plus, ListTodo } from "lucide-react";
import { TaskCard } from "../energy-flow/TaskCard";


export type Task = {
    id: string;
    userId: string;
    title: string;
    description: string | null;
    status: string;
    energyLevel?: 'high_focus' | 'low_energy' | null;
    contextId?: string | null;
    statusFunnel?: 'backlog' | 'weekly' | 'today';
    dueDate?: string | Date | null;
    createdAt: string;
    updatedAt: string;
    position?: string | number | null;
    parentId?: string | null;
    subtasks?: Task[];
    completedAt?: string | Date | null;
};

export function TaskWidget({ initialTasks = [] }: { initialTasks?: Task[] }) {

    const [tasks, setTasks] = useState<Task[]>(initialTasks);

    // Ensure uniqueness and filter out subtasks (show only top-level)
    const topLevelTasks = useMemo(() => {
        const seen = new Set();
        return tasks.filter(task => {
            if (!task.id || seen.has(task.id)) return false;
            // Only show if no parentId (top level) OR if parent is not in the list (fallback)
            // Ideally just !task.parentId
            if (task.parentId) return false;

            seen.add(task.id);
            return true;
        });
    }, [tasks]);

    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function fetchTasks() {
        try {
            // setLoading(true); // Don't block UI for background refresh
            const res = await fetch('/api/tasks');

            if (!res.ok) throw new Error('Failed to load tasks');

            const data: Task[] = await res.json();
            // Data includes subtasks nested in `subtasks` array, AND potentially as separate rows depending on API
            // API uses `findMany` which returns all matching rows. 
            // If subtasks are in DB, they are returned. 
            // We use `topLevelTasks` memo to filter them for display.
            const validTasks = data.filter(t => t && t.id);
            const deduplicatedTasks = Array.from(new Map(validTasks.map(item => [item.id, item])).values());
            setTasks(deduplicatedTasks);
        } catch (err: any) {
            console.error(err);
            setError(err.message ?? 'Error loading tasks');
        } finally {
            setLoading(false);
        }
    }

    // useEffect(() => {
    //     fetchTasks();
    // }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!title.trim()) return;

        try {
            setSubmitting(true);
            setError(null);

            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim() || undefined,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.error || 'Failed to create task');
            }

            const newTask: Task = await res.json();

            if (!newTask || !newTask.id) {
                throw new Error('Invalid task data received');
            }

            setTasks((prev) => {
                if (prev.some(t => t.id === newTask.id)) return prev;
                return [newTask, ...prev];
            });
            setTitle('');
            setDescription('');
        } catch (err: any) {
            console.error(err);
            setError(err.message ?? 'Error creating task');
        } finally {
            setSubmitting(false);
        }
    }

    async function toggleDone(task: Task | any) { // Type 'any' allowed for subtasks if they come from DndKit as loose objects
        const newStatus = task.status === 'done' ? 'todo' : 'done';

        // Optimistic update
        setTasks((prev) => prev.map((t) => {
            if (t.id === task.id) return { ...t, status: newStatus };
            // Also check subtasks if we are toggling a subtask inside a parent?
            // TaskCard handles UI update for subtask array if we pass it correctly or if it uses internal state/optimistic
            // But since we own `tasks` state, we should update nested subtasks too if possible.
            // However, updating nested structure deeply is complex here without deep clone identification.
            // For now, simple ID match (likely only hits top level).
            // Subtasks toggles usually trigger re-fetch or need simpler logic.
            // Let's rely on API + re-fetch or partial update if needed.
            if (t.subtasks) {
                return {
                    ...t,
                    subtasks: t.subtasks.map(st => st.id === task.id ? { ...st, status: newStatus } : st)
                };
            }
            return t;
        }));

        try {
            const res = await fetch(`/api/tasks/${task.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error('Failed to update task');

            const updatedTask: Task = await res.json();

            // Re-sync with server response
            setTasks((prev) => prev.map((t) => {
                if (t.id === updatedTask.id) return updatedTask;
                if (t.subtasks) {
                    // Update if it was a subtask
                    return {
                        ...t,
                        subtasks: t.subtasks.map(st => st.id === updatedTask.id ? updatedTask : st)
                    };
                }
                return t;
            }));
        } catch (err) {
            console.error(err);
            fetchTasks(); // Revert on error
        }
    }

    async function deleteTask(id: string) {
        try {
            const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete task');
            setTasks((prev) => prev.filter((t) => t.id !== id));
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden relative group transition-colors">
            {/* Subtle gradient background - Dark Mode Only */}
            <div className="absolute inset-0 bg-linear-to-b from-slate-900/50 to-slate-950 pointer-events-none opacity-0 dark:opacity-100 transition-opacity" />

            <div className="p-5 border-b border-slate-200 dark:border-slate-800/60 flex justify-between items-center shrink-0 bg-slate-50/80 dark:bg-slate-900/40 backdrop-blur-md relative z-10">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <ListTodo size={18} />
                    </div>
                    Tasks
                    <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700/50">{topLevelTasks.length}</span>
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar relative z-10">
                {loading && topLevelTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                        <div className="w-5 h-5 border-2 border-slate-400 dark:border-slate-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm">Loading tasks...</p>
                    </div>
                ) : topLevelTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 gap-2 opacity-60">
                        <ListTodo size={32} strokeWidth={1.5} />
                        <p className="text-sm">No tasks yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {topLevelTasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onToggle={toggleDone}
                                onDelete={deleteTask}
                                onToggleSubtask={toggleDone} // Reuse toggle logic for subtasks
                                className="bg-white dark:bg-slate-900/50 shadow-sm border-slate-200 dark:border-slate-800/80"
                                showEnergy={true}
                                showContext={true}
                            />
                        ))}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 bg-slate-50/80 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800/60 relative z-10 backdrop-blur-sm">
                {error && <div className="text-xs text-red-500 dark:text-red-400 mb-2 px-1">{error}</div>}
                <div className="flex gap-2 items-center">
                    <Input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Add a new task..."
                        className="flex-1 bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                    />
                    <Button
                        type="submit"
                        disabled={submitting || !title.trim()}
                        className="w-10 h-10 p-0 rounded-xl bg-blue-600 hover:bg-blue-500 text-white border-none shadow-lg shadow-blue-500/20 dark:shadow-blue-900/20 transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                        <Plus size={20} />
                    </Button>
                </div>
            </form>
        </div>
    );
}
