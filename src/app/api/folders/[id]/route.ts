import { folders } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { updateFolder } from "@/lib/validators";
import { success } from "zod";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const userId = session.user.id;

    try {
        const folder = await db.query.folders.findFirst({
            with: {
                notes: true,
            },
            where: and(eq(folders.id, id), eq(folders.userId, userId)),
        });

        if (!folder) {
            return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
        }

        return NextResponse.json(folder);
    } catch (error) {
        console.error('[FOLDERS_GET]:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const userId = session.user.id;

    try {
        const json = await request.json();
        const result = updateFolder.safeParse(json);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation Failed', details: result.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { name, description, parentId, color, order } = result.data;

        const folderToUpdate = await db.query.folders.findFirst({
            where: and(eq(folders.id, id), eq(folders.userId, userId)),
        });

        if (!folderToUpdate) {
            return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
        }

        if (parentId !== undefined && parentId !== null) {
            if (parentId === id) {
                return NextResponse.json({ error: 'A folder cannot be its own parent' }, { status: 400 });
            }

            const newParent = await db.query.folders.findFirst({
                where: and(eq(folders.id, parentId), eq(folders.userId, userId)),
            });

            if (!newParent) {
                return NextResponse.json({ error: 'Parent folder not found or doesn\'t belong to you' }, { status: 404 });
            }

            // Aquí falta una validación compleja: Evitar bucles (A -> B -> A).
            // Para producción robusta, deberías verificar que 'newParent' no sea descendiente de 'id'.
            // Esto implica recursivamente verificar cada ancestro de 'newParent' para evitar bucles.


        }

        const [updatedFolder] = await db.update(folders)
            .set({
                name: name ?? folderToUpdate.name,
                description: description !== undefined ? description : folderToUpdate.description,
                parentId: parentId !== undefined ? parentId : folderToUpdate.parentId,
                color: color ?? folderToUpdate.color,
                order: order !== undefined ? order : folderToUpdate.order,
                updatedAt: new Date(),
            })
            .where(and(eq(folders.id, id), eq(folders.userId, userId)))
            .returning();

        return NextResponse.json(updatedFolder, { status: 200 });
    } catch (error) {
        console.error('[FOLDERS_PATCH]:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const userId = session.user.id;

    try {
        const result = await db.delete(folders)
            .where(and(eq(folders.id, id), eq(folders.userId, userId)))
            .returning({ id: folders.id });

        if (!result.length) {
            return NextResponse.json({ error: 'Folder not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Folder deleted successfully', success: true, deletedId: result[0].id }, { status: 200 });
    } catch (error) {
        console.error('[FOLDERS_DELETE]:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}