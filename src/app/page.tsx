import { NoteWidget } from '@/components/dashboard/NoteWidget';
import { QuickExpenseWidget } from '@/components/dashboard/QuickExpensesWidget';
import { TaskWidget } from '@/components/dashboard/TaskWidget';
import { signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    <main className="h-screen overflow-hidden bg-slate-950 p-4 text-slate-50 flex flex-col">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h1 className="text-2xl font-bold">Personal Dashboard</h1>
        <form
          action={async () => {
            'use server';
            await signOut();
          }}
        >
          <Button variant="outline" className="text-black hover:text-black">Sign Out</Button>
        </form>
      </div>
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