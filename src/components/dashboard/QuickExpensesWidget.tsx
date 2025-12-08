
'use client';


import { quickExpenses } from "@/db/schema";
import { useEffect, useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export type QuickExpense = {
    id: string;
    userId: string;
    label: string;
    amount: string;
    category: string;
    createdAt: string;
    updatedAt: string;
}

export function QuickExpenseWidget() {
    const [quickExpenses, setQuickExpense] = useState<QuickExpense[]>([]);

    const uniqeQuickExpenses = useMemo(() => {
        const seen = new Set();
        return quickExpenses.filter(quickExpense => {
            if (!quickExpense.id || seen.has(quickExpense.id)) return false;
            seen.add(quickExpense.id);
            return true;
        });
    }, [quickExpenses]);

    const total = useMemo(() => {
        return quickExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    }, [quickExpenses]);

    const [loading, setLoading] = useState(true);
    const [label, setLabel] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function fetchQuickExpenses() {
        try {
            setLoading(true);
            const res = await fetch('/api/quick-expenses');

            if (!res.ok) throw new Error('Failed to load tasks');

            const data: QuickExpense[] = await res.json();
            const validQuickExpeses = data.filter(t => t && t.id);
            const deduplicatedQuickExpenses = Array.from(new Map(validQuickExpeses.map(item => [item.id, item])).values());

            setQuickExpense(deduplicatedQuickExpenses);

        } catch (error: any) {
            console.error(error);
            setError(error.message ?? 'Error loading quick expenses');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchQuickExpenses();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!label.trim() || !amount.trim() || !category.trim()) return;

        try {
            setSubmitting(true);
            setError(null);

            const res = await fetch('/api/quick-expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    label: label.trim(),
                    amount: amount.trim(),
                    category: category.trim(),
                }),
            });

            if (!res.ok) throw new Error('Failed to create quick expense');

            const newQuickExpense: QuickExpense = await res.json();
            setQuickExpense((prev) => {
                if (prev.some(t => t.id === newQuickExpense.id)) return prev;
                return [newQuickExpense, ...prev];
            });
            setLabel('');
            setAmount('');
            setCategory('');
        } catch (err: any) {
            console.error(err);
            setError(err.message ?? 'Error creating quick expense');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(id: string) {
        try {
            const res = await fetch(`/api/quick-expenses/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete quick expense');
            setQuickExpense((prev) => prev.filter((t) => t.id !== id));
        } catch (err) {
            console.error(err);
        }
    }

    async function handleUpdate(id: string) {
        try {
            const res = await fetch(`/api/quick-expenses/${id}`, { method: 'PUT' });
            if (!res.ok) throw new Error('Failed to update quick expense');
            setQuickExpense((prev) => prev.map((t) => (t.id === id ? t : t)));
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="flex flex-col h-full bg-slate-950 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
                <h2 className="font-semibold text-slate-50">Quick Expenses</h2>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Total:</span>
                    <span className="text-sm font-medium text-emerald-400">${total.toFixed(2)}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {loading && quickExpenses.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">Loading...</div>
                ) : quickExpenses.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">No expenses yet</div>
                ) : (
                    <div className="space-y-2">
                        {quickExpenses.map((item) => (
                            <div key={item.id} className="group flex items-center justify-between p-2 rounded-xl hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-800">
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-medium text-slate-50 truncate">{item.label}</span>
                                    <span className="text-xs text-slate-500 capitalize">{item.category}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-slate-200">${Number(item.amount).toFixed(2)}</span>
                                    <Button
                                        onClick={() => handleDelete(item.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all"
                                        title="Delete expense"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.594 19h4.812a2.75 2.75 0 002.742-2.53l.841-10.518.148.022a.75.75 0 00.23-1.482 41.047 41.047 0 00-2.365-.298V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                                        </svg>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-3 bg-slate-900 border-t border-slate-800 flex flex-col gap-2">
                {error && <div className="text-xs text-red-400 px-1">{error}</div>}
                <div className="flex gap-2">
                    <Input
                        className="flex-2 min-w-0 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-slate-600"
                        placeholder="Label"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                    />
                    <Input
                        className="flex-1 min-w-0 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-slate-600"
                        placeholder="Amount"
                        type="number"
                        step="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all cursor-pointer">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-slate-800 text-slate-50">
                            <SelectItem value="food">Food</SelectItem>
                            <SelectItem value="transport">Transport</SelectItem>
                            <SelectItem value="shopping">Shopping</SelectItem>
                            <SelectItem value="health">Health</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        type="submit"
                        disabled={submitting || !label.trim() || !amount.trim() || !category}
                        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                    >
                        {submitting ? '...' : 'Add'}
                    </Button>
                </div>
            </form>
        </div>
    );
}