import { tasks, userStats } from "@/db/schema";
import { db } from "../../../../lib/db";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { createTask, updateTaskSchema } from "../../../../lib/validators";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { isYesterday, isToday } from "date-fns";

export async function GET(request: NextRequest) {
    const session = await auth();

    if (!session) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }
    const userId = (session?.user as any)?.id;
    try {
        const userTasks = await db
            .select()
            .from(tasks)
            .where(eq(tasks.userId, userId))
            .orderBy(tasks.position, desc(tasks.createdAt));

        return NextResponse.json(userTasks);
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
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
            energyLevel: data.energyLevel,
            contextId: data.contextId || null,
            statusFunnel: data.statusFunnel,
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
            createdAt: new Date(),
        };

        await db.insert(tasks).values(newTask);

        return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
        console.error('Error creating task:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        return NextResponse.json(
            { error: 'Internal Server Error: error creating task.' },
            { status: 500 },
        );
    }

}



export async function PATCH(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session?.user as any)?.id;


    try {
        const json = await request.json();
        const { id, ...updateData } = json;

        if (!id) {
            return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
        }

        // Validate update data
        const result = updateTaskSchema.safeParse(updateData);
        if (!result.success) {
            return NextResponse.json({ error: 'Invalid data', details: result.error.flatten() }, { status: 400 });
        }

        const dataToUpdate = {
            ...result.data,
            dueDate: result.data.dueDate ? new Date(result.data.dueDate) : (result.data.dueDate === null ? null : undefined),
            position: result.data.position !== undefined ? String(result.data.position) : undefined,
        };

        // Fetch current task to check status transition
        const currentTask = await db.select().from(tasks).where(eq(tasks.id, id)).then(res => res[0]);

        if (!currentTask) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        let statsUpdate = null;

        // Gamification Logic: Check if completing task
        if (dataToUpdate.status === 'done' && currentTask.status !== 'done') {
            // Fetch user stats
            let stats = await db.select().from(userStats).where(eq(userStats.userId, userId)).then(res => res[0]);

            if (!stats) {
                // Initialize if not exists
                const newStats = {
                    userId,
                    streak: 0,
                    xp: 0,
                    lastCompletedDate: null,
                    updatedAt: new Date()
                };
                await db.insert(userStats).values(newStats);
                stats = newStats as any;
            }

            const now = new Date();
            let newStreak = stats.streak;
            const lastDate = stats.lastCompletedDate ? new Date(stats.lastCompletedDate) : null;

            if (lastDate) {
                if (isYesterday(lastDate)) {
                    newStreak += 1; // Completed yesterday, increment
                } else if (!isToday(lastDate)) {
                    newStreak = 1; // Missed a day (and not today), reset to 1
                }
                // If isToday, keep streak same
            } else {
                newStreak = 1; // First task ever
            }

            const newXp = stats.xp + 10;

            await db.update(userStats)
                .set({
                    streak: newStreak,
                    xp: newXp,
                    lastCompletedDate: now,
                    updatedAt: now
                })
                .where(eq(userStats.userId, userId));

            statsUpdate = { streak: newStreak, xp: newXp, leveledUp: false }; // Simplified for now
        }

        await db.update(tasks)
            .set(dataToUpdate)
            .where(eq(tasks.id, id));

        const updatedTask = await db.select().from(tasks).where(eq(tasks.id, id)).then(res => res[0]);

        return NextResponse.json({ ...updatedTask, ...statsUpdate });
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}