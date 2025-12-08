import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { quickExpenses } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { error } from "console";

const TEMP_USER_ID = 'user_12345';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const deleted = await db
            .delete(quickExpenses)
            .where(and(eq(quickExpenses.id, id), eq(quickExpenses.userId, TEMP_USER_ID)))
            .returning();

        if (!deleted.length) {
            return NextResponse.json(
                { error: 'Quick Expense not found or unauthorized' },
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

        const updated = await db
            .update(quickExpenses)
            .set({
                updatedAt: new Date()
            })
            .where(and(eq(quickExpenses.id, id), eq(quickExpenses.userId, TEMP_USER_ID)))
            .returning();

        if (!updated.length) {
            return NextResponse.json(
                { error: 'Quick expense not found or unauthorized' },
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