"use client";

import { FolderItem } from "./FolderItem";

interface Folder {
    id: string;
    name: string;
    parentId: string | null;
    description: string | null;
    color: string | null;
    createdAt: string;
    updatedAt: string;
}

interface FolderTreeProps {
    folders: Folder[]; // Lista COMPLETA de carpetas (plana)
    parentId: string | null; // Nivel actual a renderizar
    level?: number; // Profundidad actual (para indentación)
    
    // Props de estado que vienen del padre
    selectedFolderId: string | null;
    expandedFolderIds: Set<string>;
    
    // Handlers
    onSelect: (id: string) => void;
    onToggleExpand: (id: string) => void;
    onDelete: (id: string) => void;
}

export function FolderTree({
    folders,
    parentId,
    level = 0,
    selectedFolderId,
    expandedFolderIds,
    onSelect,
    onToggleExpand,
    onDelete
}: FolderTreeProps) {
    // 1. Filtrar las carpetas que pertenecen a este nivel
    const currentLevelFolders = folders
        .filter(folder => folder.parentId === parentId)
        .sort((a, b) => a.name.localeCompare(b.name)); // Orden alfabético simple

    if (currentLevelFolders.length === 0) return null;

    return (
        <div className="flex flex-col">
            {currentLevelFolders.map(folder => {
                const isExpanded = expandedFolderIds.has(folder.id);
                // Verificamos si esta carpeta tiene hijos para pintar la flechita
                const hasChildren = folders.some(f => f.parentId === folder.id);

                return (
                    <div key={folder.id}>
                        <FolderItem 
                            id={folder.id}
                            name={folder.name}
                            isOpen={isExpanded}
                            isActive={selectedFolderId === folder.id}
                            hasChildren={hasChildren}
                            level={level}
                            onSelect={onSelect}
                            onToggle={onToggleExpand}
                            onDelete={onDelete}
                        />
                        
                        {/* RECURSIVIDAD: Si está expandido, renderizamos los hijos */}
                        {isExpanded && (
                            <FolderTree 
                                folders={folders} // Pasamos la lista completa siempre
                                parentId={folder.id} // El padre ahora soy yo
                                level={level + 1} // Aumentamos nivel
                                selectedFolderId={selectedFolderId}
                                expandedFolderIds={expandedFolderIds}
                                onSelect={onSelect}
                                onToggleExpand={onToggleExpand}
                                onDelete={onDelete}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
