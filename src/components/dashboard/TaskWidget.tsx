// src/components/dashboard/TaskWidget.tsx
'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useMemo } from "react";
import { Plus, Trash2, Check, Circle, ListTodo } from "lucide-react";

export type Task = {
    id: string;
    userId: string;
    title: string;
    description: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
};

export function TaskWidget() {

    const [tasks, setTasks] = useState<Task[]>([]);

    // Ensure uniqueness for rendering to prevent key errors
    const uniqueTasks = useMemo(() => {
        const seen = new Set();
        return tasks.filter(task => {
            if (!task.id || seen.has(task.id)) return false;
            seen.add(task.id);
            return true;
        });
    }, [tasks]);

    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function fetchTasks() {
        try {
            setLoading(true);
            const res = await fetch('/api/tasks');

            if (!res.ok) throw new Error('Failed to load tasks');

            const data: Task[] = await res.json();
            // Filter valid tasks and deduplicate
            const validTasks = data.filter(t => t && t.id);
            // We'll rely on the useMemo above for rendering uniqueness, 
            // but it's good to keep the state clean too.
            const deduplicatedTasks = Array.from(new Map(validTasks.map(item => [item.id, item])).values());
            setTasks(deduplicatedTasks);
        } catch (err: any) {
            console.error(err);
            setError(err.message ?? 'Error loading tasks');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTasks();
    }, []);

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

    async function toggleDone(task: Task) {
        const newStatus = task.status === 'done' ? 'todo' : 'done';

        try {
            const res = await fetch(`/api/tasks/${task.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error('Failed to update task');

            const updatedTask: Task = await res.json();
            setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
        } catch (err) {
            console.error(err);
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
        <div className="flex flex-col h-full bg-slate-950 rounded-2xl border border-slate-800/60 shadow-xl shadow-black/20 overflow-hidden relative group">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-linear-to-b from-slate-900/50 to-slate-950 pointer-events-none" />

            <div className="p-5 border-b border-slate-800/60 flex justify-between items-center shrink-0 bg-slate-900/40 backdrop-blur-md relative z-10">
                <h2 className="font-bold text-lg text-white flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                        <ListTodo size={18} />
                    </div>
                    Tasks
                    <span className="text-xs font-medium px-2 py-0.5 bg-slate-800/80 text-slate-400 rounded-full border border-slate-700/50">{tasks.length}</span>
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar relative z-10">
                {loading && uniqueTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                        <div className="w-5 h-5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm">Loading tasks...</p>
                    </div>
                ) : uniqueTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2 opacity-60">
                        <ListTodo size={32} strokeWidth={1.5} />
                        <p className="text-sm">No tasks yet</p>
                    </div>
                ) : (
                    uniqueTasks.map((task) => (
                        <div key={task.id} className="group/item flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/40 transition-all border border-transparent hover:border-slate-700/50">
                            <button
                                onClick={() => toggleDone(task)}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer ${task.status === 'done'
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-900/20'
                                    : 'border-slate-600 hover:border-blue-500 text-transparent'
                                    }`}
                            >
                                <Check size={12} strokeWidth={3} />
                            </button>

                            <div className="min-w-0 flex-1">
                                <p className={`text-sm font-medium truncate transition-all ${task.status === 'done' ? 'text-slate-500 line-through decoration-slate-600' : 'text-slate-200'
                                    }`}>{task.title}</p>
                                {task.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>}
                            </div>

                            <button
                                onClick={() => deleteTask(task.id)}
                                className="opacity-0 group-hover/item:opacity-100 p-2 rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all"
                                title="Delete task"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 bg-slate-900/40 border-t border-slate-800/60 relative z-10 backdrop-blur-sm">
                {error && <div className="text-xs text-red-400 mb-2 px-1">{error}</div>}
                <div className="flex gap-2 items-center">
                    <Input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Add a new task..."
                        className="flex-1 bg-slate-950/50 border-slate-800 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                    />
                    <Button
                        type="submit"
                        disabled={submitting || !title.trim()}
                        className="w-10 h-10 p-0 rounded-xl bg-blue-600 hover:bg-blue-500 text-white border-none shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                        <Plus size={20} />
                    </Button>
                </div>
            </form>
        </div>
    );
}


