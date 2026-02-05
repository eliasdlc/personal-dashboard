import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function TaskCardSkeleton() {
    return (
        <div className="flex flex-col p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm">
            <div className="flex items-start gap-3">
                {/* Checkbox Placeholder */}
                <Skeleton className="mt-0.5 w-5 h-5 rounded-full shrink-0" />

                <div className="flex-1 min-w-0 space-y-2">
                    {/* Title Placeholder */}
                    <div className="flex justify-between gap-2">
                        <Skeleton className="h-4 w-3/4 rounded" />
                        <Skeleton className="h-4 w-4 rounded" /> {/* Delete button */}
                    </div>
                    {/* Description Placeholder */}
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-3 w-2/3 rounded" />

                    {/* Badges Placeholder */}
                    <div className="flex gap-2 pt-1">
                        <Skeleton className="h-5 w-16 rounded-md" />
                        <Skeleton className="h-5 w-12 rounded-md" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function EnergyFlowSkeleton() {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-xl overflow-hidden">
            {/* Header Skeleton */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800/60 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/40">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-6 w-32 rounded" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-24 rounded-lg" />
                    <Skeleton className="h-9 w-24 rounded-lg" />
                    <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="flex-1 p-4 md:p-6 bg-slate-50/30 dark:bg-slate-900/20">
                <div className="flex flex-col gap-6 h-full">

                    {/* Progress Bar Skeleton */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between">
                            <Skeleton className="h-3 w-20 rounded" />
                            <Skeleton className="h-3 w-8 rounded" />
                        </div>
                        <Skeleton className="h-2 w-full rounded-full" />
                    </div>

                    {/* Columns Skeleton */}
                    <div className="flex flex-col md:flex-row flex-1 min-h-0 gap-6">
                        {/* Column 1 */}
                        <div className="flex-1 flex flex-col gap-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <div className="space-y-1">
                                    <Skeleton className="h-5 w-24 rounded" />
                                    <Skeleton className="h-3 w-32 rounded" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <TaskCardSkeleton />
                                <TaskCardSkeleton />
                                <TaskCardSkeleton />
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-800 my-4" />

                        {/* Column 2 */}
                        <div className="flex-1 flex flex-col gap-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <div className="space-y-1">
                                    <Skeleton className="h-5 w-24 rounded" />
                                    <Skeleton className="h-3 w-32 rounded" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <TaskCardSkeleton />
                                <TaskCardSkeleton />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
