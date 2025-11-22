'use client';

import { useEffect, useState, useMemo, JSX } from "react";

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
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="mb-3 text-lg font-semibold text-slate-50">Notes</h2>

            <form onSubmit={handleSubmit} className="mb-4 space-y-2">
                <textarea
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
                    placeholder="Quick note…"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={submitting || !content.trim()}
                    className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                    {submitting ? 'Saving…' : 'Add note'}
                </button>
            </form>

            {error && (
                <p className="mb-2 text-sm text-red-400">{error}</p>
            )}

            {loading ? (
                <p className="text-sm text-slate-400">Loading notes…</p>
            ) : sortedNotes.length === 0 ? (
                <p className="text-sm text-slate-400">No notes yet.</p>
            ) : (
                <ul className="space-y-2 text-sm">
                    {sortedNotes.map((note) => (
                        <li
                            key={note.id}
                            className={`group relative flex items-start gap-2 rounded-md border px-3 py-2 transition-colors ${note.pinned
                                ? 'border-yellow-900/50 bg-yellow-950/20'
                                : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                                }`}
                        >
                            <p className="flex-1 whitespace-pre-wrap wrap-break-word">{note.content}</p>

                            <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                <button
                                    onClick={() => togglePin(note)}
                                    className={`rounded p-1 transition-colors ${note.pinned
                                        ? 'text-yellow-500 hover:bg-yellow-950/50'
                                        : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                                        }`}
                                    title={note.pinned ? "Unpin note" : "Pin note"}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="17" x2="12" y2="22"></line>
                                        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
                                    </svg>
                                </button>
                                <button
                                    onClick={() => deleteNote(note.id)}
                                    className="rounded p-1 text-slate-500 transition-colors hover:bg-red-950/30 hover:text-red-400"
                                    title="Delete note"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 6 6 18"></path>
                                        <path d="m6 6 12 12"></path>
                                    </svg>
                                </button>
                            </div>
                            {/* Mobile support: always show pin if pinned */}
                            {note.pinned && (
                                <div className="absolute right-2 top-2 text-yellow-500 opacity-100 group-hover:opacity-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="17" x2="12" y2="22"></line>
                                        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
                                    </svg>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

