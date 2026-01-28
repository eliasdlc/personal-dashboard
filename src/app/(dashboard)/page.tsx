import { NoteWidget } from '@/components/dashboard/NoteWidget';
import { QuickExpenseWidget } from '@/components/dashboard/QuickExpensesWidget';
import { TaskWidget } from '@/components/dashboard/TaskWidget';

export default function DashboardPage() {
  return (
    <div className="p-4 flex flex-col h-auto md:h-full overflow-auto md:overflow-hidden pb-20 md:pb-0">
      <div className="grid w-full gap-4 md:grid-cols-3 flex-1 min-h-0">
        <div className="h-[600px] md:h-full min-h-0">
          <TaskWidget />
        </div>
        <div className="h-[600px] md:h-full min-h-0">
          <NoteWidget />
        </div>
        <div className="h-[600px] md:h-full min-h-0">
          <QuickExpenseWidget />
        </div>
      </div>
    </div>
  );
}