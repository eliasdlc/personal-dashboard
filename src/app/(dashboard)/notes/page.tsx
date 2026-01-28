import { NoteWidget } from '@/components/dashboard/NoteWidget';

export default function NotesPage() {
    return (
        <div className="h-full p-4 flex flex-col max-w-[1920px] mx-auto w-full">
            <div className="flex-1 min-h-0">
                <NoteWidget />
            </div>

            {/* Inspirational Quote / Footer - Subtle Psychology touch */}
            <div className="mt-4 text-center">
                <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium uppercase tracking-widest opacity-60">
                    Capture your thoughts
                </p>
            </div>
        </div>
    );
}
