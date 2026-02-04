import { NoteWidget } from '@/components/dashboard/NoteWidget';
import { QuickExpenseWidget } from '@/components/dashboard/QuickExpensesWidget';
import { TaskWidget } from '@/components/dashboard/TaskWidget';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tasks, notes, folders, quickExpenses } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <div>Please log in to view dashboard</div>;
  }

  // Parallel data fetching
  const [userTasks, userNotes, userFolders, userExpenses] = await Promise.all([
    db.query.tasks.findMany({
      where: eq(tasks.userId, userId),
      orderBy: (tasks, { desc }) => [tasks.position, desc(tasks.createdAt)],
      with: {
        subtasks: {
          orderBy: (subtasks, { asc }) => [asc(subtasks.createdAt)],
        },
      },
    }),
    db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.updatedAt)),
    db.select().from(folders).where(eq(folders.userId, userId)).orderBy(folders.order),
    db.select().from(quickExpenses).where(eq(quickExpenses.userId, userId)).orderBy(desc(quickExpenses.createdAt)).limit(5)
  ]);

  return (
    <div className="p-4 flex flex-col h-auto md:h-full overflow-auto md:overflow-hidden pb-20 md:pb-0">
      <div className="grid w-full gap-4 md:grid-cols-3 flex-1 min-h-0">
        <div className="h-[600px] md:h-full min-h-0">
          <TaskWidget initialTasks={userTasks as any} />
        </div>
        <div className="h-[600px] md:h-full min-h-0">
          <NoteWidget initialNotes={userNotes} initialFolders={userFolders} />
        </div>
        <div className="h-[600px] md:h-full min-h-0">
          <QuickExpenseWidget initialExpenses={userExpenses as any} />
        </div>
      </div>
    </div>
  );
}