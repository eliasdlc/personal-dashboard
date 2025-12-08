import { tasks } from "@/db/schema";
import { db } from "../../../../lib/db";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { createTask } from "../../../../lib/validators";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const session = await auth();
    console.log('API /api/tasks session:', session);

    if (!session) {
        console.log('API /api/tasks Unauthorized');
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }
    const userId = (session?.user as any)?.id;
    const userTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.userId, userId))
        .orderBy(desc(tasks.createdAt));

    return NextResponse.json(userTasks);
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

        const result = createTask.safeParse(json);

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

        const newTask = {
            id: randomUUID(),
            userId,
            title: data.title,
            description: data.description || null,
            status: 'todo' as const,
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
            createdAt: new Date(),
        };

        await db.insert(tasks).values(newTask);

        return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Internal Server Error: error creating task.' },
            { status: 500 },
        );


    }

}