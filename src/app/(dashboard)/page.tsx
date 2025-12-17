import { NoteWidget } from '@/components/dashboard/NoteWidget';
import { QuickExpenseWidget } from '@/components/dashboard/QuickExpensesWidget';
import { TaskWidget } from '@/components/dashboard/TaskWidget';

export default function DashboardPage() {
  return (
    <div className="overflow-hidden p-4 text-slate-50 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-slate-400">Today is {new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid w-full gap-6 md:grid-cols-3 h-full min-h-0 pb-6">
        <TaskWidget />
        <NoteWidget />
        <QuickExpenseWidget />
      </div>
    </div>
  );
}