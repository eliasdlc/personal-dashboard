// src/app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { tasks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { updateTaskSchema } from "../../../../../lib/validators";


const TEMP_USER_ID = 'user_12345';

// PATCH /api/tasks/:id
// PATCH /api/tasks/:id
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const json = await request.json();

        // 1. Validate input using Zod
        const parseResult = updateTaskSchema.safeParse(json);

        if (!parseResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parseResult.error.flatten() },
                { status: 400 }
            );
        }

        const updates = parseResult.data;

        // 2. Check if there is actually anything to update
        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: 'No valid fields to update' },
                { status: 400 }
            );
        }

        const valuesToUpdate: any = {
            ...updates,
            updatedAt: new Date(),
        };

        if (updates.dueDate) {
            valuesToUpdate.dueDate = new Date(updates.dueDate);
        } else if (updates.dueDate === null) {
            valuesToUpdate.dueDate = null;
        }

        // 3. Perform Update (Scoped to User)
        // We use .returning() to get the updated data back immediately
        const [updatedTask] = await db
            .update(tasks)
            .set(valuesToUpdate)
            .where(
                and(
                    eq(tasks.id, id),
                    eq(tasks.userId, TEMP_USER_ID) // SECURITY: Ensure user owns the task
                )
            )
            .returning();

        if (!updatedTask) {
            return NextResponse.json(
                { error: 'Task not found or unauthorized' },
                { status: 404 }
            );
        }

        return NextResponse.json({ task: updatedTask });

    } catch (error) {
        console.error('Failed to update task:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// DELETE /api/tasks/:id
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        const [deletedTask] = await db
            .delete(tasks)
            .where(
                and(
                    eq(tasks.id, id),
                    eq(tasks.userId, TEMP_USER_ID) // SECURITY: Ensure user owns the task
                )
            )
            .returning();

        if (!deletedTask) {
            return NextResponse.json(
                { error: 'Task not found or unauthorized' },
                { status: 404 }
            );
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Failed to delete task:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}