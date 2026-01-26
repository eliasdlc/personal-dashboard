"use client";

import { Folder, FolderOpen, MoreVertical, Trash2, Edit2, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";

interface FolderItemProps {
  id: string;
  name: string;
  isOpen?: boolean; // Para cuando hagamos el árbol
  isActive?: boolean; // Si es la carpeta seleccionada actual
  hasChildren?: boolean; // Si tiene hijos para mostrar chevron
  level?: number; // Nivel de profundidad para indentación
  onSelect: (id: string) => void;
  onToggle?: (id: string) => void; // Para expandir/colapsar
  onDelete?: (id: string) => void;
  onRename?: (id: string, newName: string) => void;
}

export function FolderItem({ 
  id, 
  name, 
  isOpen = false, 
  isActive = false,
  hasChildren = false,
  level = 0,
  onSelect,
  onToggle,
  onDelete
}: FolderItemProps) {
  const [showActions, setShowActions] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggle && hasChildren) {
      onToggle(id);
    }
  };

  const handleSelect = () => {
    onSelect(id);
  };

  return (
    <div 
      className={`
        group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors
        ${isActive ? "bg-slate-200 dark:bg-slate-800 text-blue-600 dark:text-blue-400" : "hover:bg-slate-100 dark:hover:bg-slate-900"}
      `}
      onClick={handleSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      style={{ paddingLeft: `${8 + level * 16}px` }}
    >
      <div className="flex items-center gap-2 truncate flex-1 min-w-0">
        {/* Chevron para expandir/colapsar (solo si tiene hijos) */}
        {hasChildren ? (
          <button
            onClick={handleToggle}
            className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors flex-shrink-0"
            title={isOpen ? "Collapse" : "Expand"}
          >
            {isOpen ? (
              <ChevronDown size={14} className={isActive ? "text-blue-500 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"} />
            ) : (
              <ChevronRight size={14} className={isActive ? "text-blue-500 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"} />
            )}
          </button>
        ) : (
          <div className="w-5" /> // Espaciador cuando no hay chevron
        )}

        {/* Icono cambia si está abierto o cerrado */}
        {isOpen ? (
          <FolderOpen size={16} className={`flex-shrink-0 ${isActive ? "text-blue-500 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`} />
        ) : (
          <Folder size={16} className={`flex-shrink-0 ${isActive ? "text-blue-500 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`} />
        )}
        
        <span className="text-sm font-medium truncate select-none">
          {name}
        </span>
      </div>

      {/* Botones de acción (solo visibles en hover) */}
      <div className={`flex items-center gap-1 flex-shrink-0 ${showActions ? "opacity-100" : "opacity-0"} transition-opacity`}>
        {onDelete && (
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    if(confirm("¿Seguro que quieres borrar esta carpeta?")) onDelete(id);
                }}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-500/10 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded"
                title="Borrar carpeta"
            >
                <Trash2 size={14} />
            </button>
        )}
      </div>
    </div>
  );
}