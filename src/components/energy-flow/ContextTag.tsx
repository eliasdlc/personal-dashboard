import { CONTEXTS, ContextId } from "@/lib/contexts";
import { Tag } from "lucide-react";

interface ContextTagProps {
    contextId?: string | null;
    className?: string;
}

export function ContextTag({ contextId, className }: ContextTagProps) {
    if (!contextId) return null;

    const contextDef = CONTEXTS[contextId.toLowerCase() as ContextId];

    if (!contextDef) {
        // Fallback for unknown contexts
        return (
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium border bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700 ${className}`}>
                <Tag size={10} />
                {contextId}
            </div>
        );
    }

    const { label, icon: Icon, color } = contextDef;

    return (
        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium border ${color.bg} ${color.text} ${color.border} ${color.darkBg} ${color.darkText} ${color.darkBorder} ${className}`}>
            <Icon size={10} />
            {label}
        </div>
    );
}
