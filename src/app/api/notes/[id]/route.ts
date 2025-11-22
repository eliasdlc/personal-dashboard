import { notes } from "@/db/schema";
import { db } from "../../../../../lib/db";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const TEMP_USER_ID = 'user_12345';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const deleted = await db
            .delete(notes)
            .where(and(eq(notes.id, id), eq(notes.userId, TEMP_USER_ID)))
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
    try {
        const { id } = await params;
        const json = await request.json();

        // We only expect 'pinned' for now, but could be expanded
        if (typeof json.pinned !== 'boolean') {
            return NextResponse.json(
                { error: 'Invalid data: pinned must be a boolean' },
                { status: 400 }
            );
        }

        const updated = await db
            .update(notes)
            .set({
                pinned: json.pinned,
                updatedAt: new Date()
            })
            .where(and(eq(notes.id, id), eq(notes.userId, TEMP_USER_ID)))
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
