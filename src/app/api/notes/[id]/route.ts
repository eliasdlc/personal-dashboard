import { notes } from "@/db/schema";
import { db } from "../../../../../lib/db";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateNoteSchema = z.object({
    content: z.string().min(1, 'A content is required').max(1024).optional(),
    pinned: z.boolean('pinned').default(false).optional(),
    folderId: z.string().nullable().optional(),
});

const updateNote = updateNoteSchema.extend({
    id: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    try {
        const { id } = await params;

        const deleted = await db
            .delete(notes)
            .where(and(eq(notes.id, id), eq(notes.userId, userId)))
            .returning({ id: notes.id });

        if (!deleted.length) {
            return NextResponse.json(
                { error: 'Note not found or unauthorized' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    try {
        const { id } = await params;
        const json = await request.json();

        const result = updateNote.safeParse(json);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid data', details: result.error.flatten() },
                { status: 400 }
            );
        }
        const { content, pinned, folderId } = result.data;

        const updateData: {
            content?: string;
            pinned?: boolean;
            folderId?: string | null;
            updatedAt: Date;
        } = {
            updatedAt: new Date(),
        };

        if (content !== undefined) updateData.content = content;
        if (pinned !== undefined) updateData.pinned = Boolean(pinned);
        if (folderId !== undefined) updateData.folderId = folderId || null;

        const updated = await db.update(notes)
            .set(updateData)
            .where(and(eq(notes.id, id), eq(notes.userId, userId)))
            .returning({ id: notes.id });

        if (!updated.length) {
            return NextResponse.json(
                { error: 'Note not found or unauthorized' },
                { status: 404 }
            );
        }

        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
