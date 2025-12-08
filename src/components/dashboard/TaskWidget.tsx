// src/components/dashboard/TaskWidget.tsx
'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        <div className="flex flex-col h-full bg-slate-950 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
                <h2 className="font-semibold text-slate-50">Tasks</h2>
                <span className="text-xs font-medium px-2 py-1  items-center justify-center text-center bg-slate-800 text-slate-50 rounded-full">{tasks.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {loading && uniqueTasks.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">Loading...</div>
                ) : uniqueTasks.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">No tasks yet</div>
                ) : (
                    uniqueTasks.map((task) => (
                        <div key={task.id} className="group flex items-center gap-3 p-1 rounded-4xl hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-800">
                            <Button
                                onClick={() => toggleDone(task)}
                                className={`m-1 w-8 h-8 p-0 bg-white rounded-full border-2 flex items-center justify-center transition-colors shrink-0 cursor-pointer ${task.status === 'done' ? 'bg-blue-500 border-blue-500 hover:bg-blue-600' : 'border-gray-200 bg-white hover:bg-white hover:border-blue-500'}`}
                            >
                                {task.status === 'done' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </Button>

                            <div className="min-w-0 flex-1 ">
                                <p className={`text-sm font-medium truncate  ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-50'}`}>{task.title}</p>
                                {task.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{task.description}</p>}
                            </div>

                            <Button
                                onClick={() => deleteTask(task.id)}
                                className="m-1 w-8 h-8 p-0 rounded-full bg-red-500 border-red-500 border-2 flex items-center justify-center transition-colors shrink-0 cursor-pointer hover:bg-red-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white">
                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                </svg>
                            </Button>
                        </div>
                    ))

                )}
            </div>

            <form onSubmit={handleSubmit} className="p-2 bg-slate-800 border-t border-slate-800">
                {error && <div className="text-xs text-red-500 mb-2">{error}</div>}
                <div className="flex gap-2 justify-center items-center">
                    <Input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Add a new task..."
                        className="flex-1 p-0 px-4 h-10 bg-slate-700 border border-slate-800 rounded-4xl text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <Button
                        type="submit"
                        disabled={submitting || !title.trim()}
                        className="p-0 w-10 h-10 bg-slate-900 text-white rounded-4xl text-sm font-medium border-2 border-slate-900 hover:bg-slate-950 hover:border-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                    </Button>
                </div>
            </form>
        </div>
    );
}


