'use client';

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Pin, Trash2, Check, MoreHorizontal, Clock } from "lucide-react";
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

    // 60-30-10 Color Palette
    // 60% = Dark neutral base (#1C1C1E like the folder)
    // 30% = Accent color stripe at top
    // 10% = White text, icons

    const accentColors = [
        '#FACC15', // Yellow
        '#3B82F6', // Blue
        '#EC4899', // Pink
        '#22C55E', // Green
        '#A855F7', // Purple
        '#F97316', // Orange
    ];

    const colorIndex = note.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % accentColors.length;
    const accentColor = accentColors[colorIndex];

    const formattedDate = new Date(note.updatedAt).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    return (
        <div
            ref={setNodeRef}
            onClick={handleCardClick}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(
                "group/item relative flex flex-col w-full h-auto min-h-[180px] sm:min-h-[200px]",
                "rounded-[20px] sm:rounded-[24px] overflow-hidden",
                "shadow-[0_10px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.18)]",
                "bg-[#1C1C1E]", // 60% - Dark base
                "transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1",
                isDragging ? "opacity-50 rotate-2 scale-105 cursor-grabbing z-50" : "cursor-grab",
                isSelected && "ring-4 ring-emerald-500 z-40",
                isSelecting && !isSelected && "opacity-60 hover:opacity-100"
            )}
        >
            {/* ================= ACCENT STRIPE (30%) ================= */}
            <div
                className="h-[4px] sm:h-[5px] w-full shrink-0"
                style={{ backgroundColor: accentColor }}
            />

            {/* ================= HEADER ================= */}
            <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-2 flex justify-between items-start shrink-0">
                {/* Left: Date Badge */}
                <div
                    className="px-2 sm:px-2.5 py-1 rounded-full flex items-center gap-1.5"
                    style={{ backgroundColor: `${accentColor}20` }}
                >
                    <Clock size={10} className="opacity-70" style={{ color: accentColor }} />
                    <span
                        className="font-medium text-[9px] sm:text-[10px] uppercase tracking-wide"
                        style={{ color: accentColor }}
                    >
                        {formattedDate}
                    </span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1">
                    {/* Selection Checkbox */}
                    {isSelecting && (
                        <div className={cn(
                            "h-5 w-5 sm:h-6 sm:w-6 rounded-full border-2 flex items-center justify-center transition-all",
                            isSelected
                                ? "border-emerald-500 bg-emerald-500"
                                : "border-gray-500 hover:border-gray-400 bg-transparent"
                        )}>
                            {isSelected && <Check size={12} className="text-white" />}
                        </div>
                    )}

                    {/* Pin/Delete Actions */}
                    {!isSelecting && (
                        <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPin(note);
                                }}
                                className={cn(
                                    "p-1.5 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white",
                                    note.pinned && "text-yellow-400 hover:text-yellow-300"
                                )}
                                onPointerDown={(e) => e.stopPropagation()}
                            >
                                <Pin size={14} className={note.pinned ? "fill-current" : ""} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(note.id);
                                }}
                                className="p-1.5 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                                onPointerDown={(e) => e.stopPropagation()}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ================= BODY ================= */}
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex flex-col flex-1">
                {/* Title - Conditional Rendering */}
                {note.title && (
                    <h1 className="text-base sm:text-lg font-semibold text-white mb-2 leading-tight break-words line-clamp-2">
                        {note.title}
                    </h1>
                )}

                {/* Content */}
                <div className={cn(
                    "flex-1 w-full text-sm sm:text-base text-gray-400 font-normal whitespace-pre-wrap leading-relaxed break-words line-clamp-[6] sm:line-clamp-[8]",
                    !note.title && "text-gray-300" // Slightly brighter if no title
                )}>
                    {note.content}
                </div>
            </div>

            {/* Pinned Indicator */}
            {note.pinned && (
                <div
                    className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
                    style={{ backgroundColor: accentColor, color: accentColor }}
                />
            )}
        </div>
    );
}
