"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FolderData {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
}

interface CreateFolderDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onFolderCreated: (folder: any) => void;
    onFolderUpdated?: (folder: any) => void;
    initialData?: FolderData | null;
    parentId?: string | null; // Para crear subcarpetas
}

const COLORS = [
    { value: "#ef4444", label: "Red" },
    { value: "#f97316", label: "Orange" },
    { value: "#eab308", label: "Yellow" },
    { value: "#22c55e", label: "Green" },
    { value: "#06b6d4", label: "Cyan" },
    { value: "#3b82f6", label: "Blue" },
    { value: "#8b5cf6", label: "Purple" },
    { value: "#ec4899", label: "Pink" },
    { value: "#64748b", label: "Slate" },
    { value: "#1e293b", label: "Dark" },
    { value: "#4f46e5", label: "Indigo" }, // Indigo default
    { value: "#059669", label: "Emerald" },
    { value: "#d97706", label: "Amber" },
];

export function CreateFolderDialog({ isOpen, onClose, onFolderCreated, onFolderUpdated, initialData, parentId }: CreateFolderDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedColor, setSelectedColor] = useState(COLORS[10].value); // Default Indigo
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setDescription(initialData.description || "");
                setSelectedColor(initialData.color || COLORS[10].value);
            } else {
                setName("");
                setDescription("");
                setSelectedColor(COLORS[10].value);
            }
            setError(null);
        }
    }, [isOpen, initialData]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            setLoading(true);
            setError(null);

            const isEdit = !!initialData;
            const url = isEdit ? `/api/folders/${initialData.id}` : '/api/folders';
            const method = isEdit ? 'PATCH' : 'POST';

            // Prepare body data
            const bodyData: Record<string, any> = {
                name: name.trim(),
                description: description.trim() || undefined,
                color: selectedColor,
            };

            // Only include parentId when creating (not editing)
            // Send null for root folders, or the parentId string for subfolders
            if (!isEdit) {
                bodyData.parentId = parentId ?? null;
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || `Failed to ${isEdit ? 'update' : 'create'} folder`);
            }

            const result = await res.json();

            if (isEdit && onFolderUpdated) {
                onFolderUpdated(result);
            } else {
                onFolderCreated(result);
            }

            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Edit Folder" : "Create New Folder"}
        >
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                    <Input
                        placeholder="Project X"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-950/50"
                        maxLength={50}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Color</label>
                    <div className="flex flex-wrap gap-2">
                        {COLORS.map((color) => (
                            <button
                                key={color.value}
                                type="button"
                                onClick={() => setSelectedColor(color.value)}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color.value
                                    ? "border-slate-900 dark:border-white scale-110"
                                    : "border-transparent hover:scale-105"
                                    }`}
                                style={{ backgroundColor: color.value }}
                                title={color.label}
                            />
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description (Optional)</label>
                    <Textarea
                        placeholder="What's inside this folder?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-950/50 resize-none h-20"
                        maxLength={120}
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
                )}

                <div className="flex justify-end gap-2 pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || !name.trim()}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                        {loading ? "Saving..." : (initialData ? "Save Changes" : "Create Folder")}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
