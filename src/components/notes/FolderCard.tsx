import { Settings, MoreVertical, FolderOpen, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface FolderCardProps {
    id: string;
    name: string;
    description?: string | null;
    noteCount: number;
    onClick?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    color?: string | null;
}

export function FolderCard({
    id,
    name,
    description,
    noteCount,
    onClick,
    onEdit,
    onDelete,
    color
}: FolderCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    // Sortable (Draggable)
    const {
        attributes,
        listeners,
        setNodeRef: setSortableRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: id,
        data: { type: 'folder', id: id }
    });

    // Droppable (Drop Target)
    const { setNodeRef: setDroppableRef, isOver } = useDroppable({
        id: id,
        data: { type: 'folder', id: id }
    });

    const setNodeRef = (node: HTMLElement | null) => {
        setSortableRef(node);
        setDroppableRef(node);
    };

    // Color base
    const baseColor = color || "#6366f1"; // Default Indigo

    // Logic for rendering paper stack
    const showFirstPaper = noteCount > 0;
    const showSecondPaper = noteCount > 5;
    const showThirdPaper = noteCount > 10;

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "relative w-full aspect-square max-w-[240px] cursor-pointer group transition-transform duration-300 hover:-translate-y-1 mx-auto touch-none",
                isOver && "scale-105",
                isDragging && "opacity-50"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            {/* Folder Tab Wrapper - Moves with BackPlate */}
            <div
                className="absolute top-0 left-0 w-full h-full z-[-1] transition-all duration-300 ease-out"
                style={{
                    transform: isHovered && !isDragging ? 'rotate(-1deg) scale(1.01)' : 'rotate(0deg)',
                }}
            >
                <div
                    className="absolute -top-3 left-0 w-28 h-8 rounded-t-2xl transition-colors duration-300"
                    style={{
                        backgroundColor: baseColor,
                        boxShadow: isHovered && !isDragging
                            ? `0 20px 25px -5px ${baseColor}40, 0 8px 10px -6px ${baseColor}20`
                            : 'none'
                    }}
                />
            </div>

            {/* Back Plate */}
            <div
                className="absolute top-0 left-0 w-full h-full rounded-2xl z-0 transition-all duration-300 ease-out"
                style={{
                    backgroundColor: baseColor,
                    transform: isHovered && !isDragging ? 'rotate(-1deg) scale(1.01)' : 'rotate(0deg)',
                    boxShadow: isHovered && !isDragging
                        ? `0 20px 25px -5px ${baseColor}40, 0 8px 10px -6px ${baseColor}20`
                        : 'none'
                }}
            />

            {/* Papers inside - Responsive Stack */}
            {showFirstPaper && (
                <div
                    className={cn(
                        "absolute left-1/2 -translate-x-1/2 top-5 w-[90%] h-[90%] bg-white dark:bg-slate-200 rounded-xl transition-all duration-500 ease-out shadow-sm border border-black/5",
                        (isHovered && !isDragging) ? '-translate-y-6 rotate-2' : '-translate-y-2'
                    )}
                />
            )}
            {showSecondPaper && (
                <div
                    className={cn(
                        "absolute left-1/2 -translate-x-1/2 top-5 w-[90%] h-[90%] bg-white dark:bg-slate-200/90 rounded-xl transition-all duration-500 ease-out shadow-sm border border-black/5",
                        (isHovered && !isDragging) ? '-translate-y-4 -rotate-1' : '-translate-y-1.5'
                    )}
                />
            )}
            {showThirdPaper && (
                <div
                    className={cn(
                        "absolute left-1/2 -translate-x-1/2 top-5 w-[90%] h-[90%] bg-white dark:bg-slate-200/80 rounded-xl transition-all duration-500 ease-out shadow-sm border border-black/5",
                        (isHovered && !isDragging) ? '-translate-y-2 rotate-1' : '-translate-y-1'
                    )}
                />
            )}


            {/* Front Pocket */}
            <div
                className={cn(
                    "absolute bottom-0 left-0 w-full h-5/6 rounded-2xl z-20 p-5 flex flex-col justify-between overflow-hidden transition-all duration-300",
                    isOver ? "ring-4 ring-offset-2 ring-emerald-500 scale-[1.02]" : ""
                )}
                style={{
                    backgroundColor: baseColor,
                    background: `linear-gradient(145deg, ${baseColor}, ${baseColor}dd)`,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
            >
                {/* Header */}
                <div className="flex justify-between items-start text-white relative z-10">
                    <div className="flex flex-col gap-1 w-full min-w-0 pr-2">
                        <h3 className="text-xl font-bold truncate tracking-tight" title={name}>
                            {name}
                        </h3>
                        {description && (
                            <p className="text-xs text-white/90 line-clamp-2 leading-relaxed wrap-break-word whitespace-normal opacity-90">
                                {description}
                            </p>
                        )}
                    </div>

                    <div
                        className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        {onEdit && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); }} /* Stop click but allow popover */
                                        className="p-1 hover:bg-white/20 rounded-lg transition-colors text-white"
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-40 p-1" align="end">
                                    <div className="flex flex-col gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="justify-start h-8 px-2 w-full font-normal"
                                            onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                                        >
                                            <Edit size={14} className="mr-2" /> Edit Folder
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="justify-start h-8 px-2 w-full font-normal text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                                            onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                                        >
                                            <Trash2 size={14} className="mr-2" /> Delete
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-white/90 relative z-10">
                    <div className="flex items-center gap-1.5 text-xs font-medium bg-black/10 px-2.5 py-1 rounded-full backdrop-blur-sm">
                        <FolderOpen size={12} />
                        {noteCount}
                    </div>

                    {isOver && (
                        <span className="text-xs font-bold animate-pulse bg-emerald-500/20 px-2 py-1 rounded-full">Drop to move</span>
                    )}
                </div>

                {/* Decorative Shine */}
                <div className="absolute -right-12 -top-12 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            </div>
        </div>
    );
}
