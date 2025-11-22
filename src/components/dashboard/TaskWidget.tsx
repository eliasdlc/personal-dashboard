// src/components/dashboard/TaskWidget.tsx
'use client';


import { useEffect, useState, useMemo } from "react";

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
        <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">Tasks</h2>
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{tasks.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading && uniqueTasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
                ) : uniqueTasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">No tasks yet</div>
                ) : (
                    uniqueTasks.map((task) => (
                        <div key={task.id} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                            <button
                                onClick={() => toggleDone(task)}
                                className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 cursor-pointer ${task.status === 'done' ? 'bg-blue-500 border-blue-500' : 'border-gray-200 hover:border-blue-500'}`}
                            >
                                {task.status === 'done' && <span className="text-white text-xs">✓</span>}
                            </button>

                            <div className="min-w-0 flex-1 ">
                                <p className={`text-sm font-medium truncate  ${task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{task.title}</p>
                                {task.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>}
                            </div>

                            <button
                                onClick={() => deleteTask(task.id)}
                                className="mt-1 w-5 h-5 rounded-full bg-red-500 border-red-500 border-2 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white">
                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                </svg>
                            </button>
                        </div>
                    ))

                )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 bg-gray-50/50 border-t border-gray-100">
                {error && <div className="text-xs text-red-500 mb-2">{error}</div>}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Add a new task..."
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={submitting || !title.trim()}
                        className="px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                        +
                    </button>
                </div>
            </form>
        </div>
    );
}


