import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "./TaskCard";
import { Task } from "@/components/dashboard/TaskWidget";

interface SortableTaskCardProps {
    task: Task;
    allTasks?: Task[];
    onDelete?: (id: string) => void;
    onToggle?: (task: Task) => void;
    onEdit?: (task: Task) => void;
    onToggleSubtask?: (subtask: any) => void;
    onDeleteSubtask?: (subtaskId: string) => void;
    onAddSubtask?: (parentId: string, title: string) => void;
    className?: string;
    showTaskEnergy?: boolean;
}

export function SortableTaskCard({ task, allTasks, onDelete, onToggle, onEdit, onToggleSubtask, onDeleteSubtask, onAddSubtask, className, showTaskEnergy = true }: SortableTaskCardProps) {
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
                allTasks={allTasks}
                onDelete={onDelete}
                onToggle={onToggle}
                onEdit={onEdit}
                onToggleSubtask={onToggleSubtask}
                onDeleteSubtask={onDeleteSubtask}
                onAddSubtask={onAddSubtask}
                className={className}
                showEnergy={showTaskEnergy}
            />
        </div>
    );
}

