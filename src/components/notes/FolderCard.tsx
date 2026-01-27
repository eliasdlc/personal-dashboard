import { MoreHorizontal, FileText, Edit, Trash2 } from "lucide-react";
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

// Reusable Paper Component with Skeleton Lines and Hover Animation
const PaperSheet = ({
    baseClasses,
    hoverClasses,
    isHovered,
    delay
}: {
    baseClasses: string;
    hoverClasses: string;
    isHovered: boolean;
    delay: string;
}) => {
    return (
        <div
            className={cn(
                "absolute top-0 bg-white rounded-[6px] shadow-sm flex flex-col p-2 sm:p-3 gap-1.5 sm:gap-2 transition-all duration-500 ease-out",
                delay,
                isHovered ? hoverClasses : baseClasses
            )}
            style={{
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}
        >
            {/* Skeleton Lines */}
            <div className="w-[60%] h-[4px] sm:h-[6px] bg-[#E5E5E5] rounded-full" />
            <div className="w-[85%] h-[4px] sm:h-[6px] bg-[#E5E5E5] rounded-full" />
            <div className="w-[85%] h-[4px] sm:h-[6px] bg-[#E5E5E5] rounded-full" />
            <div className="w-[40%] h-[4px] sm:h-[6px] bg-[#E5E5E5] rounded-full mt-0.5 sm:mt-1" />
        </div>
    );
};

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

    // Generate gradient from color prop
    const baseColor = color || "#3B82F6";

    // Create a darker shade for the gradient end
    const darkenColor = (hex: string, percent: number): string => {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max((num >> 16) - amt, 0);
        const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
        const B = Math.max((num & 0x0000FF) - amt, 0);
        return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
    };

    const gradientStart = baseColor;
    const gradientEnd = darkenColor(baseColor, 30);

    const showPapers = noteCount > 0;

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
                // Mobile: smaller size | Desktop: original 240px
                "relative w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] md:w-[240px] md:h-[240px]",
                "rounded-[20px] sm:rounded-[28px] md:rounded-[32px]",
                "shadow-[0_10px_25px_rgba(0,0,0,0.12)] sm:shadow-[0_20px_40px_rgba(0,0,0,0.15)]",
                "overflow-hidden flex flex-col shrink-0 select-none group",
                "hover:scale-[1.02] transition-transform duration-300 ease-out",
                "cursor-pointer md:touch-none mx-auto",
                isOver && "scale-105 ring-4 ring-emerald-400",
                isDragging && "opacity-50",
                ""
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            {/* 1. Background Gradient with Inner Highlight */}
            <div
                className="absolute inset-0 rounded-[20px] sm:rounded-[28px] md:rounded-[32px]"
                style={{
                    background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`
                }}
            >
                {/* Subtle inner top highlight to mimic plastic/glass */}
                {/* <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" /> */}
                <div className="absolute inset-0 shadow-[inset_0_0_0_6px_#F1F5F9] dark:shadow-[inset_0_0_0_6px_#0F172A] rounded-[20px] sm:rounded-[28px] md:rounded-[32px]" />
            </div>

            {/* 2. Paper Elements - Animated on Hover */}
            {showPapers && (
                <div className="absolute top-[20px] sm:top-[25px] md:top-[30px] left-0 right-0 px-4 sm:px-5 md:px-6 flex flex-col items-center">
                    {/* Back Sheet - Fans left on hover */}
                    <PaperSheet
                        isHovered={isHovered}
                        delay="delay-0"
                        baseClasses="w-[100px] sm:w-[130px] md:w-[160px] h-[60px] sm:h-[80px] md:h-[100px] opacity-60 translate-y-0 scale-[0.85] z-0 rotate-0"
                        hoverClasses="w-[100px] sm:w-[130px] md:w-[160px] h-[60px] sm:h-[80px] md:h-[100px] opacity-70 -translate-y-2 sm:-translate-y-3 md:-translate-y-4 scale-[0.85] z-0 -rotate-6 -translate-x-2"
                    />
                    {/* Middle Sheet - Lifts up on hover */}
                    <PaperSheet
                        isHovered={isHovered}
                        delay="delay-75"
                        baseClasses="w-[110px] sm:w-[140px] md:w-[170px] h-[70px] sm:h-[90px] md:h-[110px] opacity-80 translate-y-[6px] sm:translate-y-[7px] md:translate-y-[8px] scale-[0.92] z-10 rotate-0"
                        hoverClasses="w-[110px] sm:w-[140px] md:w-[170px] h-[70px] sm:h-[90px] md:h-[110px] opacity-90 -translate-y-1 sm:-translate-y-2 md:-translate-y-3 scale-[0.95] z-10 rotate-1"
                    />
                    {/* Front Sheet - Fans right on hover */}
                    <PaperSheet
                        isHovered={isHovered}
                        delay="delay-150"
                        baseClasses="w-[120px] sm:w-[150px] md:w-[180px] h-[80px] sm:h-[100px] md:h-[120px] opacity-100 translate-y-[12px] sm:translate-y-[14px] md:translate-y-[16px] scale-100 z-20 rotate-0"
                        hoverClasses="w-[120px] sm:w-[150px] md:w-[180px] h-[80px] sm:h-[100px] md:h-[120px] opacity-100 translate-y-0 sm:translate-y-1 md:translate-y-2 scale-[1.02] z-20 rotate-3 translate-x-1"
                    />
                </div>
            )}

            {/* 3. The Dark Folder Pocket (Overlay) */}
            <div className="absolute bottom-0 left-0 right-0 h-[60%] z-30">
                {/* SVG Shape for the Tab Cutout Geometry */}
                <div className="absolute inset-0 w-full h-full text-slate-100 dark:text-slate-900 drop-shadow-lg">
                    <svg
                        viewBox="0 0 240 144"
                        preserveAspectRatio="none"
                        className="w-full h-full fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <filter id={`pocket-shadow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="0" dy="-4" stdDeviation="4" floodColor="#000000" floodOpacity="0.1" />
                            </filter>
                        </defs>
                        <path d="
                            M 0,144 
                            L 0,10 
                            Q 0,0 10,0 
                            L 100,0 
                            C 120,0 120,24 140,24 
                            L 230,24 
                            Q 240,24 240,34 
                            L 240,144 
                            Z"
                        />
                    </svg>
                </div>

                {/* Content Layout */}
                <div className="absolute inset-0 p-3 sm:p-2 md:p-4 flex flex-col justify-between">
                    {/* Header Area */}
                    <div className="flex justify-between items-start -ml-1 sm:-ml-1 mt-1.5 sm:mt-3">
                        {/* Title & Subtitle */}
                        <div className="flex flex-col gap-0 sm:gap-0.5 min-w-0 flex-1 pr-2 -mt-3.5 md:-mt-4 sm:-mt-4.5">
                            <h2 className="text-slate-900 dark:text-white w-[50px] sm:w-[80px] md:w-[100px] text-[12px] sm:text-[14px] md:text-[16px] font-medium leading-tight tracking-wide truncate-1">
                                {name}
                            </h2>
                            <span className="text-slate-500 dark:text-slate-400 text-[8px] sm:text-[10px] md:text-[12px] font-normal truncate-1">
                                {description || "Notes & More"}
                            </span>
                        </div>

                        {/* Meatball Menu Icon */}
                        <div onPointerDown={(e) => e.stopPropagation()} className="shrink-0">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        className="text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MoreHorizontal size={16} className="sm:w-[18px] sm:h-[18px] md:w-[20px] md:h-[20px]" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-32 sm:w-36 p-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" align="end">
                                    <div className="flex flex-col">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="justify-start h-7 sm:h-8 px-2 w-full font-normal text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 text-xs sm:text-sm"
                                            onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                                        >
                                            <Edit size={12} className="mr-2 text-slate-400 dark:text-gray-400 sm:w-[14px] sm:h-[14px]" /> Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="justify-start h-7 sm:h-8 px-2 w-full font-normal text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs sm:text-sm"
                                            onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                                        >
                                            <Trash2 size={12} className="mr-2 sm:w-[14px] sm:h-[14px]" /> Delete
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Footer Area */}
                    <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors duration-300">
                        <FileText size={12} strokeWidth={2.5} className="sm:w-[14px] sm:h-[14px]" />
                        <span className="text-[10px] sm:text-[11px] md:text-[12px] font-medium tracking-wide text-slate-700 dark:text-white/90">
                            {noteCount.toLocaleString()} Files
                        </span>
                    </div>
                </div>
            </div>

            {/* Drop Indicator */}
            {isOver && (
                <div className="absolute inset-0 rounded-[20px] sm:rounded-[28px] md:rounded-[32px] border-4 border-emerald-400 z-40 pointer-events-none animate-pulse" />
            )}
        </div>
    );
}
