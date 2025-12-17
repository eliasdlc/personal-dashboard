import { NoteWidget } from '@/components/dashboard/NoteWidget';

export default function NotesPage() {
    return (
        <div className="h-full p-6 flex flex-col">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notes</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage your personal notes and ideas</p>
            </div>
            <div className="flex-1 min-h-0">
                <NoteWidget />
            </div>
        </div>
    );
}
