import { subtasks } from "@/db/schema";
import { db } from "../../../lib/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const json = await request.json();
        const { taskId, title } = json;

        if (!taskId || !title) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newSubtask = {
            id: randomUUID(),
            taskId,
            title,
            status: 'todo',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.insert(subtasks).values(newSubtask);

        return NextResponse.json(newSubtask, { status: 201 });
    } catch (error) {
        console.error('Error creating subtask:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const json = await request.json();
        const { id, status } = json;

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const updateData: any = {
            status,
            updatedAt: new Date()
        };

        if (status === 'done') {
            updateData.completedAt = new Date();
        } else {
            updateData.completedAt = null;
        }

        await db.update(subtasks)
            .set(updateData)
            .where(eq(subtasks.id, id));

        const updatedSubtask = await db.select().from(subtasks).where(eq(subtasks.id, id)).then(res => res[0]);

        return NextResponse.json(updatedSubtask);
    } catch (error) {
        console.error('Error updating subtask:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        await db.delete(subtasks).where(eq(subtasks.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting subtask:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
