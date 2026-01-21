
import { userStats } from "@/db/schema";
import { db } from "../../../../lib/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session?.user as any)?.id;

    try {
        const stats = await db
            .select()
            .from(userStats)
            .where(eq(userStats.userId, userId))
            .then(res => res[0]);

        if (!stats) {
            return NextResponse.json({ streak: 0, xp: 0, userId });
        }

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
