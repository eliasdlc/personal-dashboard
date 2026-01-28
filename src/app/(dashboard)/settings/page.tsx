"use client"

import { useTheme } from "next-themes"
import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export default function SettingsPage() {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <div className="h-full p-6">
            <div className="max-w-2xl space-y-8">
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Appearance</h2>
                    <div className="flex flex-col gap-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Customize the look and feel of your dashboard. Automatically switch between day and night themes.
                        </p>
                        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-fit">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setTheme("light")}
                                className={`gap-2 rounded-lg ${theme === 'light' ? 'bg-white dark:bg-slate-800 shadow-sm' : ''}`}
                            >
                                <Sun size={16} />
                                Light
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setTheme("dark")}
                                className={`gap-2 rounded-lg ${theme === 'dark' ? 'bg-white dark:bg-slate-800 shadow-sm' : ''}`}
                            >
                                <Moon size={16} />
                                Dark
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setTheme("system")}
                                className={`gap-2 rounded-lg ${theme === 'system' ? 'bg-white dark:bg-slate-800 shadow-sm' : ''}`}
                            >
                                <Monitor size={16} />
                                System
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
