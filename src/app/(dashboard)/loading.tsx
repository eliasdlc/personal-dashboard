import { Skeleton } from "../../components/ui/skeleton";
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/ui/animations';

export default function DashboardLoading() {
    return (
        <PageTransition className="p-4 flex flex-col h-auto md:h-full overflow-auto md:overflow-hidden pb-20 md:pb-0">
            <StaggerContainer className="grid w-full gap-4 md:grid-cols-3 flex-1 min-h-0">
                {/* Task Widget Skeleton */}
                <StaggerItem className="h-[500px] md:h-full min-h-0 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950 overflow-hidden relative shadow-xl">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800/60 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/40">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-6 w-12 rounded-full" />
                    </div>
                    <div className="p-4 space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-24 w-full rounded-xl" />
                        ))}
                    </div>
                </StaggerItem>

                {/* Note Widget Skeleton */}
                <StaggerItem className="h-[500px] md:h-full min-h-0 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950 overflow-hidden relative shadow-xl">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800/60 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/40">
                        <div className="flex gap-3 items-center">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <div className="space-y-1">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        </div>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Skeleton key={i} className="h-32 w-full rounded-xl" />
                        ))}
                    </div>
                </StaggerItem>

                {/* Expenses Widget Skeleton */}
                <StaggerItem className="h-[500px] md:h-full min-h-0 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950 overflow-hidden relative shadow-xl">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800/60 bg-slate-50/80 dark:bg-slate-900/40">
                        <Skeleton className="h-8 w-40 mb-2" />
                        <Skeleton className="h-4 w-60" />
                    </div>
                    <div className="p-4 space-y-4">
                        <Skeleton className="h-10 w-full rounded-xl" />
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-xl" />
                            ))}
                        </div>
                    </div>
                </StaggerItem>
            </StaggerContainer>
        </PageTransition>
    );
}
