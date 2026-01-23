import { notes } from "@/db/schema";
import { db } from "../../../../../lib/db";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    try {
        const { id } = await params;

        const deleted = await db
            .delete(notes)
            .where(and(eq(notes.id, id), eq(notes.userId, userId)))
            .returning();

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
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    try {
        const { id } = await params;
        const json = await request.json();

        if (json.content !== undefined && typeof json.content !== 'string') {
            return NextResponse.json(
                { error: 'Invalid data: content must be a string' },
                { status: 400 }
            );
        }

        const updateData: { pinned?: boolean; content?: string; updatedAt: Date } = {
            updatedAt: new Date()
        };

        if (json.pinned !== undefined) updateData.pinned = json.pinned;
        if (json.content !== undefined) updateData.content = json.content;

        const updated = await db
            .update(notes)
            .set(updateData)
            .where(and(eq(notes.id, id), eq(notes.userId, userId)))
            .returning();

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
