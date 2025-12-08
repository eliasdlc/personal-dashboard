import { notes } from "@/db/schema";
import { db } from "../../../../lib/db";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { createNote } from "../../../../lib/validators";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const session = await auth();
    console.log('API /api/notes session:', session);
    console.log('API /api/notes cookies:', request.cookies.getAll());

    if (!session) {
        console.log('API /api/notes Unauthorized');
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }
    const userId = (session?.user as any)?.id;
    const userNotes = await db
        .select()
        .from(notes)
        .where(eq(notes.userId, userId))
        .orderBy(desc(notes.createdAt));

    return NextResponse.json(userNotes);
}

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }
    const userId = (session?.user as any)?.id;
    try {
        const json = await request.json();

        const result = createNote.safeParse(json);

        if (!result.success) {
            return NextResponse.json(
                {
                    error: 'Invalid data',
                    details: result.error.flatten()
                },
                { status: 400 }
            );
        }

        const data = result.data;

        const newNote = {
            id: randomUUID(),
            userId,
            content: data.content,
            pinned: Boolean(data.pinned),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.insert(notes).values(newNote);

        return NextResponse.json(newNote, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Internal Server Error: error creating note.' },
            { status: 500 },

        );
    }
}
