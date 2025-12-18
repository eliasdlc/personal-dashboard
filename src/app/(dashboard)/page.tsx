import { NoteWidget } from '@/components/dashboard/NoteWidget';
import { QuickExpenseWidget } from '@/components/dashboard/QuickExpensesWidget';
import { TaskWidget } from '@/components/dashboard/TaskWidget';

export default function DashboardPage() {
  return (
    <div className="p-4 text-slate-50 flex flex-col md:h-full h-auto overflow-visible md:overflow-hidden">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h1>
        <p className="text-slate-500 dark:text-slate-400">Today is {new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid w-full gap-6 md:grid-cols-3 md:h-full h-auto min-h-0 pb-6">
        <div className="h-[600px] md:h-full">
          <TaskWidget />
        </div>
        <div className="h-[600px] md:h-full">
          <NoteWidget />
        </div>
        <div className="h-[600px] md:h-full">
          <QuickExpenseWidget />
        </div>
      </div>
    </div>
  );
}