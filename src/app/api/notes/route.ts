import { notes } from "@/db/schema";
import { db } from "../../../../lib/db";
import { and, desc, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { createNote } from "../../../../lib/validators";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { title } from "process";

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    const {searchParams} = new URL(request.url);
    const folderId = searchParams.get('folderId');  

    try {
        let whereClause;

        if (folderId === 'null') {
            whereClause = and(eq(notes.userId, userId), isNull(notes.folderId));
        } else if (folderId) {
            whereClause = and(eq(notes.userId, userId), eq(notes.folderId, folderId));
        } else {
            whereClause = eq(notes.userId, userId);
        }

        const userNotes = await db.select()
            .from(notes)
            .where(whereClause)
            .orderBy(desc(notes.updatedAt));

        return NextResponse.json(userNotes);
    } catch (error) {
        console.error('[NOTES_GET]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    try {
        const json = await request.json();

        const result = createNote.safeParse(json);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid data', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { content, pinned, folderId, title } = result.data;

        const newNote = {
            id: randomUUID(),
            userId,
            content,
            title: title || undefined,
            pinned: Boolean(pinned),
            folderId: folderId || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.insert(notes).values(newNote);

        return NextResponse.json(newNote, { status: 201 });
    } catch (error) {
        console.error('[NOTES_POST]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
