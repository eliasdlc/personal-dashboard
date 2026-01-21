
import { tasks } from "@/db/schema";
import { db } from "../../../../../lib/db";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session?.user as any)?.id;

    try {
        const result = await db.update(tasks)
            .set({ statusFunnel: 'backlog' })
            .where(
                and(
                    eq(tasks.userId, userId),
                    eq(tasks.statusFunnel, 'today'),
                    eq(tasks.status, 'todo')
                )
            )
            .returning({ id: tasks.id });

        return NextResponse.json({ movedCount: result.length, message: "Clean slate applied" });
    } catch (error) {
        console.error('Error in clean-slate:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
