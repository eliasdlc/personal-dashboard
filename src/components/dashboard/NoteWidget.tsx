'use client';

import { useEffect, useState, useMemo, JSX } from "react";
import { Pin, Trash2, Plus, StickyNote, PenLine, FolderPlus, ArrowLeft, ArrowUp, CheckSquare, FolderInput, X, MoreVertical, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea"
import { Button } from "../ui/button";
import { CreateFolderDialog } from "../notes/CreateFolderDialog";
import { MoveNotesDialog } from "../notes/MoveNotesDialog";
import { FolderCard } from "../notes/FolderCard";
import { NoteCard } from "../notes/NoteCard";
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor, MouseSensor, TouchSensor, DragOverlay } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";

export type Note = {
    id: string,
    userId: string,
    content: string,
    pinned: boolean,
    folderId?: string | null,
    title?: string,
    createdAt: string,
    updatedAt: string
};

export type Folder = {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    color: string | null;
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
};

export function NoteWidget() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);

    // Navigation State
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

    // DnD Sensors
    // DnD Sensors
    // DnD Sensors: Separate configurations for Mouse and Touch
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10, // Avoid accidental drags for mouse
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250, // Delay to allow scrolling on mobile
                tolerance: 5, // Allow small movement during delay
            },
        })
    );

    const [activeDragId, setActiveDragId] = useState<string | null>(null);


    const currentFolder = useMemo(() =>
        folders.find(f => f.id === currentFolderId),
        [folders, currentFolderId]);

    const filteredNotes = useMemo(() => {
        return notes.filter(note => {
            // If in a folder, show only notes in that folder
            if (currentFolderId) {
                return note.folderId === currentFolderId;
            }
            // If root, show notes with no folder (optional: or all notes?)
            // Usually root shows "Recent" or "Uncategorized". Let's show Uncategorized for now to encourage organizing.
            return !note.folderId;
        });
    }, [notes, currentFolderId]);

    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Editing State
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [editContent, setEditContent] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Folder State
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

    function openEditModal(note: Note) {
        setEditingNote(note);
        setEditTitle(note.title || '');
        setEditContent(note.content);
    }

    async function handleSaveEdit() {
        if (!editingNote || !editContent.trim()) return;

        try {
            setIsSaving(true);
            const res = await fetch(`/api/notes/${editingNote.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editTitle.trim(),
                    content: editContent.trim()
                })
            });

            if (!res.ok) throw new Error('Failed to update note');

            const updatedNote = await res.json();
            setNotes(prev => prev.map(n => n.id === editingNote.id ? { ...n, ...updatedNote } : n));
            setEditingNote(null);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    }


    async function fetchNotes() {
        try {
            const res = await fetch('api/notes');
            if (!res.ok) throw new Error('Failed to load notes');
            const data: Note[] = await res.json();
            const validNotes = data.filter(t => t && t.id);
            // Deduplicate logic removed as API should handle uniqueness, but kept simple array set
            const deduplicateNotes = Array.from(new Map(validNotes.map(item => [item.id, item])).values());
            setNotes(deduplicateNotes);
        } catch (err: any) {
            console.error(err);
            setError(err.message ?? 'Error loading notes');
        }
    }

    async function fetchFolders() {
        try {
            const res = await fetch('api/folders');
            if (!res.ok) throw new Error('Failed to load folders');
            const data: Folder[] = await res.json();
            setFolders(data);
        } catch (err: any) {
            console.error(err);
        }
    }

    async function initialize() {
        setLoading(true);
        try {
            await Promise.all([fetchNotes(), fetchFolders()]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        initialize();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!content.trim()) return;

        try {
            setSubmitting(true);
            setError(null);

            // Auto-generate title if empty -> REMOVED per user request
            // let finalTitle = title.trim();
            // if (!finalTitle) { ... }
            const finalTitle = title.trim();

            const res = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: finalTitle,
                    content: content.trim(),
                    folderId: currentFolderId // Create note in current folder
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

            setNotes((prev) => [newNote, ...prev]);
            setTitle('');
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
                if (res.status === 404) {
                    setNotes((prev) => prev.filter(t => t.id !== id));
                    return;
                }
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

    const sortedNotes = [...filteredNotes].sort((a, b) => {
        if (a.pinned === b.pinned) return 0;
        return a.pinned ? -1 : 1;
    });

    const handleFolderCreated = (newFolder: Folder) => {
        setFolders(prev => [...prev, newFolder]);
    };

    const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

    const handleEditFolder = (folder: Folder) => {
        setEditingFolder(folder);
    };

    const handleFolderUpdated = (updatedFolder: Folder) => {
        setFolders(prev => prev.map(f => f.id === updatedFolder.id ? updatedFolder : f));
        setEditingFolder(null);
    };

    const handleDeleteFolder = async (folderId: string) => {
        if (!confirm("Delete this folder? Notes inside will be moved to Main.")) return;

        // Optimistic
        setFolders(prev => prev.filter(f => f.id !== folderId));
        if (currentFolderId === folderId) setCurrentFolderId(null);

        // Move notes to root locally
        setNotes(prev => prev.map(n => n.folderId === folderId ? { ...n, folderId: undefined } : n));

        try {
            await fetch(`/api/folders/${folderId}`, { method: 'DELETE' });
        } catch (err) {
            console.error(err);
            fetchFolders();
            fetchNotes();
        }
    };

    const getFolderNoteCount = (folderId: string) => {
        return notes.filter(n => n.folderId === folderId).length;
    };

    // Multi-Select State
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
    const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);

    const toggleSelectMode = () => {
        setIsSelecting(prev => {
            if (prev) setSelectedNotes(new Set());
            return !prev;
        });
    };

    const toggleNoteSelection = (noteId: string) => {
        setSelectedNotes(prev => {
            const next = new Set(prev);
            if (next.has(noteId)) next.delete(noteId);
            else next.add(noteId);
            return next;
        });
    };

    const handleBatchMove = async (targetFolderId: string | null) => {
        const notesToMove = Array.from(selectedNotes);

        // Optimistic Update
        setNotes(prev => prev.map(n =>
            selectedNotes.has(n.id) ? { ...n, folderId: targetFolderId } : n
        ));

        // Close UI
        setIsMoveDialogOpen(false);
        setIsSelecting(false);
        setSelectedNotes(new Set());

        try {
            await Promise.all(notesToMove.map(id =>
                fetch(`/api/notes/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ folderId: targetFolderId })
                })
            ));
        } catch (err) {
            console.error("Batch move failed", err);
            fetchNotes();
        }
    };

    const handleBatchDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedNotes.size} notes?`)) return;

        const notesToDelete = Array.from(selectedNotes);

        // Optimistic
        setNotes(prev => prev.filter(n => !selectedNotes.has(n.id)));

        // Clear Selection
        setIsSelecting(false);
        setSelectedNotes(new Set());

        try {
            await Promise.all(notesToDelete.map(id =>
                fetch(`/api/notes/${id}`, { method: 'DELETE' })
            ));
        } catch (err) {
            console.error("Batch delete failed", err);
            fetchNotes();
        }
    };

    // Drag and Drop Handler
    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveDragId(null);

        if (!over) return;

        const activeId = active.id as string;
        const targetId = over.id as string;
        const activeType = active.data.current?.type;
        const targetType = over.data.current?.type;

        // Case 1: Reordering folders (folder dragged onto another folder position)
        if (activeType === 'folder' && targetType === 'folder' && activeId !== targetId) {
            // Get current folder order (only root folders can be reordered)
            const rootFolders = folders.filter(f => !f.parentId);
            const rootFolderIds = rootFolders.map(f => f.id);
            const activeIndex = rootFolderIds.indexOf(activeId);
            const targetIndex = rootFolderIds.indexOf(targetId);

            if (activeIndex !== -1 && targetIndex !== -1) {
                // Reorder folders using arrayMove (recommended by dnd-kit)
                const reorderedRootFolders = arrayMove(rootFolders, activeIndex, targetIndex);

                // Merge with non-root folders
                const nonRootFolders = folders.filter(f => f.parentId);
                setFolders([...reorderedRootFolders, ...nonRootFolders]);

                // Note: If you want to persist folder order, you'd need to add an 'order' field
                // to the schema and update it via API. For now, this is just visual reordering.
            }
            return;
        }

        // Case 2: Moving a note to a folder
        if (activeType === 'note' && targetType === 'folder' && activeId && targetId) {
            // Optimistic Update
            setNotes(prev => prev.map(n => n.id === activeId ? { ...n, folderId: targetId } : n));

            try {
                // API Call
                await fetch(`/api/notes/${activeId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ folderId: targetId })
                });
            } catch (err) {
                console.error("Failed to move note", err);
                // Revert if failed
                fetchNotes();
            }
        }
    }

    return (
        <DndContext sensors={sensors} onDragStart={(e) => setActiveDragId(e.active.id as string)} onDragEnd={handleDragEnd}>
            <div className="flex flex-col h-full rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950 overflow-hidden relative shadow-xl shadow-slate-200/50 dark:shadow-black/20 group transition-colors">
                {/* Subtle gradient background - Dark Mode Only */}
                <div className="absolute inset-0 bg-linear-to-b from-slate-900/50 to-slate-950 pointer-events-none opacity-0 dark:opacity-100 transition-opacity" />

                <div className="p-5 border-b border-slate-200 dark:border-slate-800/60 shrink-0 bg-slate-50/80 dark:bg-slate-900/40 backdrop-blur-md relative z-10 transition-colors duration-500"
                    style={currentFolder?.color ? { borderTopWidth: 4, borderTopColor: currentFolder.color } : {}}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {currentFolderId ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCurrentFolderId(null)}
                                    className="h-8 w-8 p-0 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
                                >
                                    <ArrowLeft size={18} />
                                </Button>
                            ) : (
                                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <StickyNote size={18} />
                                </div>
                            )}

                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    {currentFolder ? currentFolder.name : "Notes"}
                                    <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700/50">
                                        {loading ? "..." : sortedNotes.length}
                                    </span>
                                </h2>
                                {currentFolder && currentFolder.description && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md truncate">{currentFolder.description}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Selection Mode Toggle */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleSelectMode}
                                className={cn(
                                    "gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400",
                                    isSelecting && "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                )}
                            >
                                <CheckSquare size={16} />
                                <span className="hidden sm:inline">{isSelecting ? "Cancel" : "Select"}</span>
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsFolderModalOpen(true)}
                                className="gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-100/50 dark:bg-slate-800/50"
                            >
                                <FolderPlus size={16} />
                                <span className="hidden sm:inline">{currentFolderId ? "New Subfolder" : "New Folder"}</span>
                            </Button>

                            {currentFolderId && currentFolder && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                        >
                                            <MoreVertical size={18} />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align="end" className="w-40 p-1">
                                        <div className="flex flex-col gap-1">
                                            <Button variant="ghost" size="sm" className="justify-start gap-2 font-normal" onClick={() => handleEditFolder(currentFolder)}>
                                                <Edit size={14} /> Edit
                                            </Button>
                                            <Button variant="ghost" size="sm" className="justify-start gap-2 font-normal text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDeleteFolder(currentFolder.id)}>
                                                <Trash2 size={14} /> Delete
                                            </Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="relative space-y-2">
                            {(isFolderModalOpen || isSelecting || content.length > 0 || title.length > 0) && (
                                <input
                                    className="w-full bg-transparent text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none px-1"
                                    placeholder="Title (optional)"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            )}
                            <Textarea
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 px-4 py-3 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 resize-none transition-all"
                                placeholder={currentFolder ? `Add a note to ${currentFolder.name}...` : "Write a quick note..."}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e as unknown as React.FormEvent);
                                    }
                                }}
                                rows={2}
                            />
                            <div className="absolute right-2 bottom-2">
                                <Button
                                    type="submit"
                                    disabled={submitting || !content.trim()}
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 dark:shadow-emerald-900/20 transition-all disabled:opacity-50 disabled:shadow-none"
                                >
                                    {submitting ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowUp size={16} />}
                                </Button>
                            </div>
                        </div>
                    </form>
                    {error && (
                        <p className="mt-2 text-xs text-red-500 dark:text-red-400 px-1">{error}</p>
                    )}

                    {/* Selection Actions Bar */}
                    {isSelecting && selectedNotes.size > 0 && (
                        <div className="mt-3 flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                <CheckSquare size={16} />
                                <span>{selectedNotes.size} {selectedNotes.size === 1 ? 'note' : 'notes'} selected</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsMoveDialogOpen(true)}
                                    className="gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                                >
                                    <FolderInput size={14} />
                                    <span className="hidden sm:inline">Move</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleBatchDelete}
                                    className="gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                                >
                                    <Trash2 size={14} />
                                    <span className="hidden sm:inline">Delete</span>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative z-10">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                            <div className="w-5 h-5 border-2 border-slate-400 dark:border-slate-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm">Loading notes...</p>
                        </div>
                    ) : (
                        <div className="space-y-8 pb-10">
                            {/* Folders Section - Only on Root */}
                            {/* Folders Section */}
                            {folders.some(f => f.parentId === currentFolderId) && (
                                <div className="space-y-6"> {/* Increased spacing container */}
                                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                                        {currentFolderId ? "Subfolders" : "Folders"}
                                    </h3>
                                    <SortableContext items={folders.filter(f => f.parentId === currentFolderId).map(f => f.id)} strategy={rectSortingStrategy}>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                                            {folders.filter(f => f.parentId === currentFolderId).map(folder => (
                                                <div key={folder.id} className="w-full flex justify-center">
                                                    <FolderCard
                                                        id={folder.id}
                                                        name={folder.name}
                                                        description={folder.description}
                                                        color={folder.color}
                                                        noteCount={getFolderNoteCount(folder.id)}
                                                        onClick={() => setCurrentFolderId(folder.id)}
                                                        onEdit={() => handleEditFolder(folder)}
                                                        onDelete={() => handleDeleteFolder(folder.id)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </SortableContext>
                                </div>
                            )}


                            {/* Notes Section */}
                            <div className="space-y-3">
                                {(!currentFolderId && folders.length > 0) && <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">Uncategorized Notes</h3>}
                                {sortedNotes.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-slate-400 dark:text-slate-500 gap-2 opacity-60">
                                        <PenLine size={32} strokeWidth={1.5} />
                                        <p className="text-sm">No notes here.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {sortedNotes.map((note) => (
                                            <NoteCard
                                                key={note.id}
                                                note={note}
                                                onClick={() => openEditModal(note)}
                                                onPin={togglePin}
                                                onDelete={deleteNote}
                                                isSelecting={isSelecting}
                                                isSelected={selectedNotes.has(note.id)}
                                                onToggleSelect={() => toggleNoteSelection(note.id)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>


                <Modal
                    isOpen={!!editingNote}
                    onClose={() => setEditingNote(null)}
                    title="Edit Note"
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
                            <input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Note title"
                                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Content</label>
                            <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                placeholder="Note content"
                                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 resize-none min-h-[150px]"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => setEditingNote(null)}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveEdit}
                                disabled={isSaving || !editContent.trim()}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </Modal>

                <CreateFolderDialog
                    isOpen={isFolderModalOpen || !!editingFolder}
                    onClose={() => {
                        setIsFolderModalOpen(false);
                        setEditingFolder(null);
                    }}
                    onFolderCreated={handleFolderCreated}
                    onFolderUpdated={handleFolderUpdated}
                    initialData={editingFolder}
                    parentId={editingFolder ? undefined : currentFolderId} // Solo pasar parentId cuando se crea, no cuando se edita
                />

                <MoveNotesDialog
                    isOpen={isMoveDialogOpen}
                    onClose={() => setIsMoveDialogOpen(false)}
                    onMove={handleBatchMove}
                    folders={folders}
                    currentFolderId={currentFolderId}
                    selectedCount={selectedNotes.size}
                />

                {/* Drag Overlay for smooth visual feedback */}
                <DragOverlay>
                    {activeDragId ? (
                        <div className="opacity-80 rotate-3 scale-105 shadow-2xl cursor-grabbing w-60 h-60 bg-white dark:bg-slate-900 rounded-xl border border-emerald-500/50 p-4">
                            {/* Simplified preview */}
                            <div className="text-emerald-500 mb-2"><StickyNote size={16} /></div>
                            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                            <div className="h-2 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                        </div>
                    ) : null}
                </DragOverlay>

            </div >
        </DndContext>
    );

}
