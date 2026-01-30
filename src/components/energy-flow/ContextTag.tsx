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
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 ${className}`}>
                <Tag size={12} />
                {contextId}
            </div>
        );
    }

    const { label, icon: Icon, color } = contextDef;

    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${color.bg} ${color.text} ${color.darkBg} ${color.darkText} ${className}`}>
            <Icon size={12} />
            {label}
        </div>
    );
}
