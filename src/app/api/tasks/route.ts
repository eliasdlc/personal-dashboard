import { tasks } from "@/db/schema";
import { db } from "../../../../lib/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { createTask } from "../../../../lib/validators";
import { randomUUID } from "crypto";

const TEMP_USER_ID = 'user_12345';

export async function GET() {
    const userTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.userId, TEMP_USER_ID))
        .orderBy(( tasks ) => [tasks.createdAt]);

    return NextResponse.json(userTasks);
}

export async function POST(request: NextRequest) {
    try {
        const json = await request.json();

        const result = createTask.safeParse(json);

        if(!result.success) {
            return NextResponse.json(
                {   error: 'Invalid data',
                    details: result.error.flatten()
                
                },
                { status: 400 }
            );
        }

        const data = result.data;

        const newTask = {
            id: randomUUID(),
            userId: TEMP_USER_ID,
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