'use client';

import { Task } from "@/components/dashboard/TaskWidget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Zap, Coffee, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SubtaskList } from "./SubtaskList";
import { CONTEXT_LIST } from "@/lib/contexts";

interface EditTaskMobileViewProps {
    // State
    editTitle: string;
    setEditTitle: (val: string) => void;
    editDesc: string;
    setEditDesc: (val: string) => void;
    editEnergy: 'high_focus' | 'low_energy' | 'none';
    setEditEnergy: (val: 'high_focus' | 'low_energy' | 'none') => void;
    editDate: Date | undefined;
    setEditDate: (date: Date | undefined) => void;
    editContextId: string | null;
    setEditContextId: (val: string | null) => void;
    editSubtasks: Task[];
    editingTask: Task | null;
    isSaving: boolean;

    // Handlers
    onClose: () => void;
    onSave: () => void;

    // Subtask Handlers
    onToggleSubtask: (subtask: any) => void;
    onDeleteSubtask: (subtaskId: string) => void;
    onAddSubtask: (parentId: string, title: string) => void;
    onReorderSubtasks: (newOrder: any[]) => void;
}

export function EditTaskMobileView({
    editTitle, setEditTitle,
    editDesc, setEditDesc,
    editEnergy, setEditEnergy,
    editDate, setEditDate,
    editContextId, setEditContextId,
    editSubtasks, editingTask,
    isSaving,
    onClose, onSave,
    onToggleSubtask, onDeleteSubtask, onAddSubtask, onReorderSubtasks
}: EditTaskMobileViewProps) {

    return (
        <div className="flex flex-col w-full">
            {/* Content Area - Natural Height */}
            <div className="space-y-4 px-1 pb-2">

                {/* Title */}
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</label>
                    <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Task title"
                        className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-medium text-base h-9"
                    />
                </div>

                {/* Description */}
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                    <Textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Add details..."
                        className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 resize-none min-h-[60px] text-sm py-2"
                    />
                </div>

                {/* Meta Row: Date & Energy */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    size="sm"
                                    className={cn(
                                        "w-full justify-start text-left font-normal bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-9 text-xs",
                                        !editDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                    {editDate ? format(editDate, "MMM d") : <span>Pick date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-fit p-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" align="start">
                                <Calendar
                                    mode="single"
                                    selected={editDate}
                                    onSelect={setEditDate}
                                    className="p-3 w-[200px]"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Energy</label>
                        <div className="flex gap-1">
                            <button
                                type="button"
                                onClick={() => setEditEnergy(editEnergy === 'high_focus' ? 'none' : 'high_focus')}
                                className={cn(
                                    "flex-1 flex items-center justify-center p-2 rounded-md border transition-all h-9",
                                    editEnergy === 'high_focus'
                                        ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10"
                                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50"
                                )}
                                title="High Focus"
                            >
                                <Zap size={16} className={editEnergy === 'high_focus' ? "fill-amber-500 text-amber-500" : "text-slate-400"} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditEnergy(editEnergy === 'low_energy' ? 'none' : 'low_energy')}
                                className={cn(
                                    "flex-1 flex items-center justify-center p-2 rounded-md border transition-all h-9",
                                    editEnergy === 'low_energy'
                                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50"
                                )}
                                title="Low Energy"
                            >
                                <Coffee size={16} className={editEnergy === 'low_energy' ? "text-emerald-500" : "text-slate-400"} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Subtasks */}
                <div className="space-y-1 flex-1 min-h-0 flex flex-col rounded-lg">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Subtasks {editSubtasks.length > 0 && (
                            <span className="text-slate-400 font-normal ml-1">({editSubtasks.filter(t => t.status === 'done').length}/{editSubtasks.length})</span>
                        )}
                    </label>
                    <div className=" dark:border-slate-800 rounded-lg p-2 bg-slate-50/50 dark:bg-slate-900 flex-1 min-h-[120px]">
                        {editingTask && (
                            <SubtaskList
                                parentTask={editingTask}
                                subtasks={editSubtasks}
                                onToggleSubtask={onToggleSubtask}
                                onDeleteSubtask={onDeleteSubtask}
                                onAddSubtask={onAddSubtask}
                                onReorder={onReorderSubtasks}
                                showAddInput={true}
                                scrollable={false}
                            />
                        )}
                    </div>
                </div>

                {/* Context Tags */}
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tags</label>
                    <div className="flex flex-wrap gap-1.5">
                        {CONTEXT_LIST.map(ctx => (
                            <button
                                key={ctx.id}
                                onClick={() => setEditContextId(editContextId === ctx.id ? null : ctx.id)}
                                className={`px-2.5 py-1 rounded-md text-[10px] font-medium border transition-all flex items-center gap-1.5 ${editContextId === ctx.id
                                    ? `${ctx.color.bg} ${ctx.color.text} ${ctx.color.border}`
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                            >
                                {editContextId === ctx.id && <Check size={10} />}
                                <ctx.icon size={10} />
                                {ctx.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Actions */}
            <div className="sticky bottom-0 left-0 right-0 p-3 bg-white/90 dark:bg-slate-900 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-20 mt-auto">
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isSaving}
                        className="flex-1 h-9 text-xs"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onSave}
                        disabled={isSaving || !editTitle.trim()}
                        className="bg-blue-600 hover:bg-blue-500 text-white flex-1 h-9 text-xs"
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
