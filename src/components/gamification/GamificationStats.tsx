
'use client';

import { useEffect, useState } from "react";
import { Flame, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stats {
    streak: number;
    xp: number;
}

export function GamificationStats() {
    const [stats, setStats] = useState<Stats | null>(null);

    async function fetchStats() {
        try {
            const res = await fetch('/api/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    }

    useEffect(() => {
        fetchStats();
        // Listen for task completion events if we implement a global event bus, 
        // or just poll/rely on parent re-renders. 
        // For now, simple fetch on mount.
        const interval = setInterval(fetchStats, 10000); // Polling every 10s for updates
        return () => clearInterval(interval);
    }, []);

    if (!stats) return null;

    return (
        <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-full border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center gap-1.5 text-orange-500 dark:text-orange-400" title="Daily Streak">
                <Flame size={16} className={cn("fill-current", stats.streak > 0 && "animate-pulse")} />
                <span className="text-xs font-bold">{stats.streak}</span>
            </div>
            <div className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
            <div className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400" title="Total XP">
                <Trophy size={16} className="fill-current" />
                <span className="text-xs font-bold">{stats.xp}</span>
            </div>
        </div>
    );
}
