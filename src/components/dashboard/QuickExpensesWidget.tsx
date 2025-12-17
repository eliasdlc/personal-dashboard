
'use client';


import { quickExpenses } from "@/db/schema";
import { useEffect, useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Trash2, Plus, DollarSign, Wallet, Receipt } from "lucide-react";

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
        <div className="flex flex-col h-full bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden relative group transition-colors">
            {/* Subtle gradient background - Dark Mode Only */}
            <div className="absolute inset-0 bg-linear-to-b from-slate-900/50 to-slate-950 pointer-events-none opacity-0 dark:opacity-100 transition-opacity" />

            <div className="p-5 border-b border-slate-200 dark:border-slate-800/60 flex justify-between items-center shrink-0 bg-slate-50/80 dark:bg-slate-900/40 backdrop-blur-md relative z-10">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <Wallet size={18} />
                    </div>
                    Expenses
                </h2>
                <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-500/20 shadow-sm shadow-emerald-500/10 dark:shadow-emerald-900/10">
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-wider">Total</span>
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">${total.toFixed(2)}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar relative z-10">
                {loading && quickExpenses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                        <div className="w-5 h-5 border-2 border-slate-400 dark:border-slate-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm">Loading expenses...</p>
                    </div>
                ) : quickExpenses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 gap-2 opacity-60">
                        <Receipt size={32} strokeWidth={1.5} />
                        <p className="text-sm">No expenses yet</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {quickExpenses.map((item) => (
                            <div key={item.id} className="group/item flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700/50">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0 border border-slate-200 dark:border-slate-700/50">
                                        <DollarSign size={16} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">{item.label}</span>
                                        <span className="text-xs text-slate-500 capitalize">{item.category}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-200">${Number(item.amount).toFixed(2)}</span>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="opacity-0 group-hover/item:opacity-100 p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-all"
                                        title="Delete expense"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 bg-slate-50/80 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800/60 flex flex-col gap-3 relative z-10 backdrop-blur-sm">
                {error && <div className="text-xs text-red-500 dark:text-red-400 px-1">{error}</div>}
                <div className="flex gap-2">
                    <Input
                        className="flex-2 min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 px-3 py-2 text-sm text-slate-900 dark:text-slate-200 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        placeholder="Label"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                    />
                    <Input
                        className="flex-1 min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 px-3 py-2 text-sm text-slate-900 dark:text-slate-200 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        placeholder="Amount"
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 px-3 py-2 text-sm text-slate-900 dark:text-slate-200 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all cursor-pointer">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200">
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
                        className="w-12 rounded-xl bg-purple-600 px-0 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0 shadow-lg shadow-purple-500/20 dark:shadow-purple-900/20 flex items-center justify-center disabled:shadow-none"
                    >
                        {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={20} />}
                    </Button>
                </div>
            </form>
        </div>
    );
}