'use client';

import { useEffect, useState, useMemo, JSX } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea"
import { Pin, Trash2, Plus, StickyNote, PenLine } from "lucide-react";

export type Note = {
    id: string,
    userId: string,
    content: string,
    pinned: boolean,
    createdAt: string,
    updatedAt: string
};

export function NoteWidget() {
    const [notes, setNotes] = useState<Note[]>([]);

    const uniqueNotes = useMemo(() => {
        const seen = new Set();
        return notes.filter(note => {
            if (!note.id || seen.has(note.id)) return false;
            seen.add(note.id);
            return true;
        });
    }, [notes]);

    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function fetchNotes() {
        try {
            setLoading(true);
            const res = await fetch('api/notes');

            if (!res.ok) throw new Error('Failed to load notes');

            const data: Note[] = await res.json();

            const validNotes = data.filter(t => t && t.id);

            const deduplicateNotes = Array.from(new Map(validNotes.map(item => [item.id, item])).values());
            setNotes(deduplicateNotes);
        } catch (err: any) {
            console.error(err);
            setError(err.message ?? 'Error loading notes');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchNotes();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!content.trim()) return;

        try {
            setSubmitting(true);
            setError(null);

            const res = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: content.trim(),
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.error || 'Failed to create note.');
            }

            const newNote: Note = await res.json();

            if (!newNote || !newNote.id) {
                throw new Error('Invalid note data recived');
            }

            setNotes((prev) => {
                if (prev.some(t => t.id === newNote.id)) return prev;
                return [newNote, ...prev]
            });
            setContent('');

        } catch (err: any) {
            console.error(err);
            setError(err.message ?? 'Error creating note');
        } finally {
            setSubmitting(false);
        }

    }

    async function deleteNote(id: string) {
        try {
            const res = await fetch(`/api/notes/${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.error || 'Failed to delete note.');
            }

            setNotes((prev) => prev.filter(t => t.id !== id));
        } catch (err: any) {
            console.error(err);
            setError(err.message ?? 'Error deleting note');
        }
    }

    async function togglePin(note: Note) {
        try {
            const newPinnedStatus = !note.pinned;
            // Optimistic update
            setNotes(prev => prev.map(n => n.id === note.id ? { ...n, pinned: newPinnedStatus } : n));

            const res = await fetch(`/api/notes/${note.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pinned: newPinnedStatus })
            });

            if (!res.ok) {
                throw new Error('Failed to update note');
            }
        } catch (err) {
            console.error(err);
            // Revert optimistic update
            setNotes(prev => prev.map(n => n.id === note.id ? { ...n, pinned: note.pinned } : n));
            setError('Failed to update pin status');
        }
    }

    const sortedNotes = [...notes].sort((a, b) => {
        if (a.pinned === b.pinned) return 0;
        return a.pinned ? -1 : 1;
    });

    return (
        <div className="flex flex-col h-full rounded-2xl border border-slate-800/60 bg-slate-950 overflow-hidden relative shadow-xl shadow-black/20 group">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-linear-to-b from-slate-900/50 to-slate-950 pointer-events-none" />

            <div className="p-5 border-b border-slate-800/60 shrink-0 bg-slate-900/40 backdrop-blur-md relative z-10">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                        <StickyNote size={18} />
                    </div>
                    Notes
                    <span className="text-xs font-medium px-2 py-0.5 bg-slate-800/80 text-slate-400 rounded-full border border-slate-700/50">{notes.length}</span>
                </h2>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
                        <Textarea
                            className="w-full rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 resize-none transition-all"
                            placeholder="Write a quick note..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={2}
                        />
                        <div className="absolute right-2 bottom-2">
                            <Button
                                type="submit"
                                disabled={submitting || !content.trim()}
                                size="sm"
                                className="h-8 w-8 p-0 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-50 disabled:shadow-none"
                            >
                                {submitting ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={16} />}
                            </Button>
                        </div>
                    </div>
                </form>
                {error && (
                    <p className="mt-2 text-xs text-red-400 px-1">{error}</p>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative z-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                        <div className="w-5 h-5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm">Loading notes...</p>
                    </div>
                ) : sortedNotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2 opacity-60">
                        <PenLine size={32} strokeWidth={1.5} />
                        <p className="text-sm">No notes yet.</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {sortedNotes.map((note) => (
                            <li
                                key={note.id}
                                className={`group/item relative flex items-start gap-3 rounded-xl border p-4 transition-all ${note.pinned
                                    ? 'border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10'
                                    : 'border-slate-800/50 bg-slate-900/30 hover:border-slate-700/50 hover:bg-slate-800/40'
                                    }`}
                            >
                                <div className={`mt-0.5 ${note.pinned ? 'text-yellow-500' : 'text-slate-600'}`}>
                                    <StickyNote size={16} />
                                </div>

                                <p className="flex-1 text-sm text-slate-300 whitespace-pre-wrap wrap-break-word leading-relaxed">{note.content}</p>

                                <div className="flex shrink-0 gap-1 opacity-0 transition-all group-hover/item:opacity-100">
                                    <button
                                        onClick={() => togglePin(note)}
                                        className={`p-1.5 rounded-lg transition-colors ${note.pinned
                                            ? 'text-yellow-500 hover:bg-yellow-500/10'
                                            : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                                            }`}
                                        title={note.pinned ? "Unpin note" : "Pin note"}
                                    >
                                        <Pin size={14} className={note.pinned ? "fill-current" : ""} />
                                    </button>
                                    <button
                                        onClick={() => deleteNote(note.id)}
                                        className="p-1.5 rounded-lg text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                                        title="Delete note"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                {/* Mobile support: always show pin if pinned */}
                                {note.pinned && (
                                    <div className="absolute right-3 top-3 text-yellow-500 opacity-100 group-hover/item:opacity-0 transition-opacity">
                                        <Pin size={14} className="fill-current" />
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

