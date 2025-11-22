// src/app/dashboard/page.tsx
import { NoteWidget } from '@/components/dashboard/NoteWidget';
import { TaskWidget } from '@/components/dashboard/TaskWidget';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-4 text-slate-50">
      <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
        <TaskWidget />
        <NoteWidget />
      </div>
    </main>
  );
}