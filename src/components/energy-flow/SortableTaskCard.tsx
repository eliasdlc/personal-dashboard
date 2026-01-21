import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "./TaskCard";
import { Task } from "@/components/dashboard/TaskWidget";

interface SortableTaskCardProps {
    task: Task;
    onDelete?: (id: string) => void;
    onToggle?: (task: Task) => void;
    className?: string;
}

export function SortableTaskCard({ task, onDelete, onToggle, className }: SortableTaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TaskCard
                task={task as any}
                onDelete={onDelete}
                onToggle={onToggle}
                className={className}
            />
        </div>
    );
}
