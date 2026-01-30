'use client';

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Coffee, ArrowUp, Tag, X, Calendar as CalendarIcon, Clock } from "lucide-react";
import { CONTEXT_LIST, ContextId } from "@/lib/contexts";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, isToday, isTomorrow, addDays, isBefore, startOfDay } from "date-fns";

interface QuickAddProps {
    onTaskAdded?: () => void;
    defaultFunnel?: 'backlog' | 'today';
}

export function QuickAdd({ onTaskAdded, defaultFunnel = 'backlog' }: QuickAddProps) {
    const [title, setTitle] = useState('');
    const [energy, setEnergy] = useState<'high_focus' | 'low_energy'>('low_energy');
    const [context, setContext] = useState<ContextId | null>(null);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);

        // Smart Urgency Logic
        let statusFunnel: 'backlog' | 'weekly' | 'today' = defaultFunnel;
        if (date) {
            if (isToday(date) || isTomorrow(date)) {
                statusFunnel = 'today';
            } else if (isBefore(date, addDays(new Date(), 7)) && isBefore(startOfDay(new Date()), date)) {
                // Within next 7 days but not today/tomorrow (and not in past)
                statusFunnel = 'weekly';
            } else {
                statusFunnel = 'backlog'; // Future dates > 1 week go to backlog
            }
        }

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    energyLevel: energy,
                    contextId: context,
                    statusFunnel: statusFunnel,
                    dueDate: date ? date.toISOString() : undefined
                }),
            });

            if (res.ok) {
                setTitle('');
                setEnergy('low_energy');
                setContext(null);
                setDate(undefined);
                onTaskAdded?.();
            }
        } catch (error) {
            console.error("Failed to create task", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="relative group bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-xl dark:shadow-2xl transition-all duration-300 overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Add something quick for TODAY..."
                    className="border-none shadow-none focus-visible:ring-0 p-2 sm:p-4 text-lg sm:text-xl font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-slate-200 bg-transparent"
                    autoFocus
                />

                <div className="flex flex-row items-center justify-between gap-3 sm:gap-4">
                    <div className="flex flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto no-scrollbar mask-linear-fade pr-2">

                        {/* Energy Toggle */}
                        <div className="flex items-center bg-slate-100 dark:bg-slate-900/50 rounded-xl p-1 border border-slate-200 dark:border-slate-800/50 shrink-0">
                            <button
                                type="button"
                                onClick={() => setEnergy('high_focus')}
                                className={cn(
                                    "p-1.5 sm:p-2 rounded-lg transition-all",
                                    energy === 'high_focus'
                                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-500 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700 dark:text-slate-600 dark:hover:text-slate-400"
                                )}
                                title="High Focus"
                            >
                                <Zap size={16} className={energy === 'high_focus' ? "fill-current" : ""} />
                            </button>
                            <div className="w-px h-3 sm:h-4 bg-slate-300 dark:bg-slate-800 mx-1" />
                            <button
                                type="button"
                                onClick={() => setEnergy('low_energy')}
                                className={cn(
                                    "p-1.5 sm:p-2 rounded-lg transition-all",
                                    energy === 'low_energy'
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700 dark:text-slate-600 dark:hover:text-slate-400"
                                )}
                                title="Zombie Mode"
                            >
                                <Coffee size={16} />
                            </button>
                        </div>

                        {/* Date Picker */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-full text-xs font-medium transition-all border border-transparent shrink-0",
                                        date
                                            ? "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20"
                                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/50"
                                    )}
                                >
                                    <Clock size={14} className="sm:w-4 sm:h-4" />
                                    {date ? format(date, "MMM d") : "No date"}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-fit p-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="p-3 w-[200px]"
                                />
                            </PopoverContent>
                        </Popover>

                        {/* Divider */}
                        <div className="h-4 sm:h-6 w-px bg-slate-200 dark:bg-slate-800/50 shrink-0" />

                        {/* Contexts Horizontal List */}
                        <div className="flex items-center gap-1.5 p-1">
                            {CONTEXT_LIST.map((ctx) => (
                                <button
                                    key={ctx.id}
                                    type="button"
                                    onClick={() => setContext(context === ctx.id ? null : ctx.id)}
                                    className={cn(
                                        "flex items-center justify-center w-8 h-8 sm:w-8 sm:h-8 rounded-full transition-all border shrink-0",
                                        context === ctx.id
                                            ? cn(ctx.color.darkBg, ctx.color.darkText, ctx.color.darkBorder)
                                            : "bg-transparent border-transparent text-slate-400 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-600 dark:hover:text-slate-400"
                                    )}
                                    title={ctx.label}
                                >
                                    <ctx.icon size={16} className="sm:w-4 sm:h-4" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={!title.trim() || loading}
                        className={cn(
                            "h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-lg shrink-0 flex items-center justify-center",
                            title.trim()
                                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
                        )}
                    >
                        <ArrowUp size={20} className="sm:w-6 sm:h-6" />
                    </Button>
                </div>
            </div>
        </form>
    );
}
