"use client";

import { useMemo, useState } from "react";
import { Folder, FolderOpen, ArrowRight, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface MoveNotesDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onMove: (targetFolderId: string | null) => void;
    folders: { id: string; name: string; color: string | null }[];
    currentFolderId: string | null;
    selectedCount: number;
}

export function MoveNotesDialog({
    isOpen,
    onClose,
    onMove,
    folders,
    currentFolderId,
    selectedCount
}: MoveNotesDialogProps) {
    const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

    // Reset selection when opening? No, let user pick.

    const canMove = true; // Always allow moving unless same folder selected, logic handled below.

    const handleMove = () => {
        onMove(selectedTargetId);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Move ${selectedCount} Note${selectedCount !== 1 ? 's' : ''}`}>
            <div className="space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Select a destination folder for the selected notes.
                </p>

                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Option: Remove from Folder / Move to Root */}
                    {currentFolderId && (
                        <button
                            onClick={() => setSelectedTargetId(null)}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                selectedTargetId === null
                                    ? "bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-500 dark:text-emerald-100"
                                    : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50"
                            )}
                        >
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                                <FolderOpen size={18} />
                            </div>
                            <span className="font-medium">Remove from Folder (Main)</span>
                            {selectedTargetId === null && <CheckIcon />}
                        </button>
                    )}

                    {/* Folder List */}
                    {folders
                        .filter(f => f.id !== currentFolderId) // Don't show current folder
                        .map(folder => (
                            <button
                                key={folder.id}
                                onClick={() => setSelectedTargetId(folder.id)}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                    selectedTargetId === folder.id
                                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-500 dark:text-emerald-100"
                                        : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50"
                                )}
                            >
                                <div
                                    className="p-2 rounded-lg text-white"
                                    style={{ backgroundColor: folder.color || '#6366f1' }}
                                >
                                    <Folder size={18} />
                                </div>
                                <span className="font-medium truncate flex-1">{folder.name}</span>
                                {selectedTargetId === folder.id && <CheckIcon />}
                            </button>
                        ))}

                    {folders.length === 0 && !currentFolderId && (
                        <p className="text-sm text-center py-4 text-slate-400">No other folders available.</p>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleMove}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                        disabled={currentFolderId === selectedTargetId && selectedTargetId !== null} // Should not happen due to filter
                    >
                        Move Notes
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

function CheckIcon() {
    return (
        <div className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
            </svg>
        </div>
    );
}
