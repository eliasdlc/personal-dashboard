import { QuickExpenseWidget } from '@/components/dashboard/QuickExpensesWidget';

export default function ExpensesPage() {
    return (
        <div className="h-full p-6 flex flex-col">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Expenses</h1>
                <p className="text-slate-500 dark:text-slate-400">Track your quick expenses</p>
            </div>
            <div className="flex-1 min-h-0">
                <QuickExpenseWidget />
            </div>
        </div>
    );
}
