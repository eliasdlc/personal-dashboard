'use client';

import { Task } from "@/components/dashboard/TaskWidget";
import { use8BitSound } from "@/hooks/use8BitSound";
import { Check, Plus, Trash2, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Confetti } from "@/components/ui/confetti";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SubtaskListProps {
    parentTask: Task;
    subtasks: any[];
    onToggleSubtask: (subtask: any) => void;
    onDeleteSubtask?: (subtaskId: string) => void;
    onAddSubtask?: (parentId: string, title: string) => void;
    onReorder?: (newOrder: any[]) => void;
    showAddInput?: boolean;
    scrollable?: boolean;
}

function SortableItem({ subtask, onToggleSubtask, onDeleteSubtask, canReorder }: { subtask: any, onToggleSubtask: (t: any) => void, onDeleteSubtask?: (id: string) => void, canReorder?: boolean }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: subtask.id, disabled: !canReorder }); // Disable sortable hook if not reorderable

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group/subtask flex items-center gap-2 py-1 px-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors shrink-0",
                isDragging && "bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700"
            )}
        >
            {/* Drag Handle - Only show if reorder is enabled */}
            {canReorder && (
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500">
                    <GripVertical size={12} />
                </div>
            )}

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleSubtask(subtask);
                }}
                className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer",
                    subtask.status === 'done'
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-slate-300 dark:border-slate-600 hover:border-emerald-500 text-transparent"
                )}
            >
                <Check size={10} strokeWidth={3} />
            </button>
            <span className={cn(
                "text-xs flex-1 break-all",
                subtask.status === 'done'
                    ? "text-slate-400 line-through"
                    : "text-slate-600 dark:text-slate-300"
            )}>
                {subtask.title}
            </span>

            {onDeleteSubtask && (
                <button
                    onClick={() => onDeleteSubtask(subtask.id)}
                    className="opacity-0 group-hover/subtask:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                    title="Delete subtask"
                >
                    <X size={14} />
                </button>
            )}
        </div>
    );
}

export function SubtaskList({
    parentTask,
    subtasks = [],
    onToggleSubtask,
    onDeleteSubtask,
    onAddSubtask,
    onReorder,
    showAddInput = false,
    scrollable = true
}: SubtaskListProps) {
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const [showConfetti, setShowConfetti] = useState(false);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    if ((!subtasks || subtasks.length === 0) && !showAddInput) return null;

    const completedCount = subtasks.filter(t => t.status === 'done').length;
    const totalCount = subtasks.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    const { playSubtaskNote, playTaskComplete } = use8BitSound();

    const handleToggleWrapper = (subtask: any) => {
        if (subtask.status !== 'done') {
            if (completedCount + 1 === subtasks.length) {
                playTaskComplete();
            } else {
                playSubtaskNote(completedCount);
            }
        }
        onToggleSubtask(subtask);
    };

    async function handleAddSubtask() {
        if (!newSubtaskTitle.trim() || !onAddSubtask) return;
        setIsAdding(true);
        await onAddSubtask(parentTask.id, newSubtaskTitle.trim());
        setNewSubtaskTitle('');
        setIsAdding(false);
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id && onReorder) {
            const oldIndex = subtasks.findIndex((item) => item.id === active.id);
            const newIndex = subtasks.findIndex((item) => item.id === over.id);
            onReorder(arrayMove(subtasks, oldIndex, newIndex));
        }
    }

    return (
        <div className={cn("mt-2 pt-2 flex flex-col border-t border-slate-100 dark:border-slate-800/50", scrollable ? "h-full" : "h-auto")}>
            {/* Progress Bar - Fixed Height */}
            {totalCount > 0 && (
                <div className="flex items-center gap-2 mb-2 shrink-0">
                    <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                        {completedCount}/{totalCount}
                    </span>
                </div>
            )}

            {/* Subtask Items - Scrollable Area */}
            <div className={cn("space-y-1", scrollable ? "flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar" : "")}>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={subtasks.map(t => t.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {subtasks.map(subtask => (
                            <SortableItem
                                key={subtask.id}
                                subtask={subtask}
                                onToggleSubtask={handleToggleWrapper}
                                onDeleteSubtask={onDeleteSubtask}
                                canReorder={!!onReorder}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>

            <Confetti active={showConfetti} />

            {/* Add Subtask Input */}
            {showAddInput && onAddSubtask && (
                <div className="flex items-center gap-2 mt-2 shrink-0 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                    <Input
                        type="text"
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                        placeholder="Add subtask..."
                        className="flex-1 h-7 text-xs bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
                        disabled={isAdding}
                    />
                    <button
                        onClick={handleAddSubtask}
                        disabled={!newSubtaskTitle.trim() || isAdding}
                        className="w-7 h-7 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center disabled:opacity-50 transition-colors"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            )}
        </div>
    );
}
