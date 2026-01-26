'use client';

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Pin, Trash2, StickyNote, Check } from "lucide-react";
import { Note } from "../dashboard/NoteWidget";
import { cn } from "@/lib/utils";

interface NoteCardProps {
    note: Note;
    onClick: () => void;
    onPin: (note: Note) => void;
    onDelete: (id: string) => void;
    isSelecting?: boolean;
    isSelected?: boolean;
    onToggleSelect?: () => void;
}

export function NoteCard({
    note,
    onClick,
    onPin,
    onDelete,
    isSelecting,
    isSelected,
    onToggleSelect
}: NoteCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: note.id,
        data: { type: 'note', id: note.id },
        disabled: isSelecting
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 50 : undefined,
    };

    const handleCardClick = () => {
        if (isSelecting && onToggleSelect) {
            onToggleSelect();
        } else {
            onClick();
        }
    };

    return (
        <div
            ref={setNodeRef}
            onClick={handleCardClick}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(
                "group/item relative aspect-square rotate-1 hover:rotate-0 flex items-start gap-3 rounded-xl border p-4 transition-all select-none touch-manipulation",
                note.pinned
                    ? '-rotate-1 border-yellow-500/20 bg-yellow-50 dark:bg-yellow-500/5 hover:bg-yellow-100 dark:hover:bg-yellow-500/10'
                    : 'border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/40',
                isDragging ? "opacity-50 rotate-3 scale-105 shadow-xl cursor-grabbing" : "cursor-grab",
                isSelected && "ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500 z-10",
                isSelecting && !isSelected && "opacity-60 hover:opacity-100"
            )}
        >
            {/* Selection Checkbox */}
            {isSelecting && (
                <div className={cn(
                    "absolute top-3 right-3 z-30 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all bg-white dark:bg-slate-900",
                    isSelected
                        ? "border-emerald-500 bg-emerald-500 scale-110"
                        : "border-slate-300 dark:border-slate-600 hover:border-emerald-400"
                )}>
                    {isSelected && <Check size={14} className="text-white" />}
                </div>
            )}

            <div className={`mt-0.5 ${note.pinned ? 'text-yellow-600 dark:text-yellow-500' : 'text-slate-500 dark:text-slate-600'}`}>
                <StickyNote size={16} />
            </div>

            <div className="flex-1 overflow-hidden">
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap wrap-break-word leading-relaxed line-clamp-8 pointer-events-none">
                    {note.content}
                </p>
            </div>

            {!isSelecting && (
                <div className="flex shrink-0 gap-1 opacity-0 transition-all group-hover/item:opacity-100">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onPin(note);
                        }}
                        className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            note.pinned
                                ? 'text-yellow-600 dark:text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-500/10'
                                : 'text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300'
                        )}
                        title={note.pinned ? "Unpin note" : "Pin note"}
                        onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
                    >
                        <Pin size={14} className={note.pinned ? "fill-current" : ""} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(note.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400"
                        title="Delete note"
                        onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )}

            {/* Mobile support: always show pin if pinned */}
            {note.pinned && (
                <div className="absolute right-3 top-3 text-yellow-600 dark:text-yellow-500 opacity-100 group-hover/item:opacity-0 transition-opacity">
                    <Pin size={14} className="fill-current" />
                </div>
            )}
        </div>
    );
}
