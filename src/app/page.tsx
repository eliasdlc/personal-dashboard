// src/app/dashboard/page.tsx
import { NoteWidget } from '@/components/dashboard/NoteWidget';
import { QuickExpenseWidget } from '@/components/dashboard/QuickExpensesWidget';
import { TaskWidget } from '@/components/dashboard/TaskWidget';

export default function DashboardPage() {
  return (
    <main className="h-screen overflow-hidden bg-slate-950 p-4 text-slate-50 flex flex-col">
      <div className="grid w-full gap-4 md:grid-rows-2 h-full min-h-0">
        <div className="grid w-full gap-4 md:grid-cols-2 h-full min-h-0">
          <TaskWidget />
          <NoteWidget />
        </div>
        <QuickExpenseWidget />
      </div>
    </main>
  );
}