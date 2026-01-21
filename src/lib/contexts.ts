import { GraduationCap, Terminal, Palette, Home, User, Building2, LucideIcon } from "lucide-react";

export type ContextId = 'university' | 'programming' | 'art' | 'house' | 'personal' | 'organization';

export interface ContextDefinition {
    id: ContextId;
    label: string;
    icon: LucideIcon;
    color: {
        bg: string;
        text: string;
        border: string;
        hoverBg?: string;
        darkBg: string;
        darkText: string;
        darkBorder: string;
        darkHoverBg?: string;
        cardBg: string;
        darkCardBg: string;
    };
}

export const CONTEXTS: Record<ContextId, ContextDefinition> = {
    university: {
        id: 'university',
        label: 'University',
        icon: GraduationCap,
        color: {
            bg: 'bg-blue-100',
            text: 'text-blue-700',
            border: 'border-blue-200',
            darkBg: 'dark:bg-blue-500/10',
            darkText: 'dark:text-blue-400',
            darkBorder: 'dark:border-blue-500/20',
            cardBg: 'bg-blue-50',
            darkCardBg: 'dark:bg-blue-900/20',
        }
    },
    programming: {
        id: 'programming',
        label: 'Programming',
        icon: Terminal,
        color: {
            bg: 'bg-purple-100',
            text: 'text-purple-700',
            border: 'border-purple-200',
            darkBg: 'dark:bg-purple-500/10',
            darkText: 'dark:text-purple-400',
            darkBorder: 'dark:border-purple-500/20',
            cardBg: 'bg-purple-50',
            darkCardBg: 'dark:bg-purple-900/20',
        }
    },
    art: {
        id: 'art',
        label: 'Art',
        icon: Palette,
        color: {
            bg: 'bg-pink-100',
            text: 'text-pink-700',
            border: 'border-pink-200',
            darkBg: 'dark:bg-pink-500/10',
            darkText: 'dark:text-pink-400',
            darkBorder: 'dark:border-pink-500/20',
            cardBg: 'bg-pink-50',
            darkCardBg: 'dark:bg-pink-900/20',
        }
    },
    house: {
        id: 'house',
        label: 'House',
        icon: Home,
        color: {
            bg: 'bg-emerald-100',
            text: 'text-emerald-700',
            border: 'border-emerald-200',
            darkBg: 'dark:bg-emerald-500/10',
            darkText: 'dark:text-emerald-400',
            darkBorder: 'dark:border-emerald-500/20',
            cardBg: 'bg-emerald-50',
            darkCardBg: 'dark:bg-emerald-900/20',
        }
    },
    personal: {
        id: 'personal',
        label: 'Personal',
        icon: User,
        color: {
            bg: 'bg-orange-100',
            text: 'text-orange-700',
            border: 'border-orange-200',
            darkBg: 'dark:bg-orange-500/10',
            darkText: 'dark:text-orange-400',
            darkBorder: 'dark:border-orange-500/20',
            cardBg: 'bg-orange-50',
            darkCardBg: 'dark:bg-orange-900/20',
        }
    },
    organization: {
        id: 'organization',
        label: 'Organization',
        icon: Building2,
        color: {
            bg: 'bg-slate-100',
            text: 'text-slate-700',
            border: 'border-slate-200',
            darkBg: 'dark:bg-slate-800',
            darkText: 'dark:text-slate-400',
            darkBorder: 'dark:border-slate-700',
            cardBg: 'bg-slate-50',
            darkCardBg: 'dark:bg-slate-800/40',
        }
    }
};

export const CONTEXT_LIST = Object.values(CONTEXTS);
