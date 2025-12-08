import { quickExpenses } from "@/db/schema";
import { db } from "../../../../lib/db";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { createQuickExpense } from "../../../../lib/validators";
import { randomUUID } from "crypto";

const TEMP_USER_ID = 'user_12345';

export async function GET() {
    const userQuickExpenses = await db
        .select()
        .from(quickExpenses)
        .where(eq(quickExpenses.userId, TEMP_USER_ID))
        .orderBy(desc(quickExpenses.createdAt));

    return NextResponse.json(userQuickExpenses);
}

export async function POST(request: NextRequest) {
    try {
        const json = await request.json();

        const result = createQuickExpense.safeParse(json);

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

        const newQuickExpense = {
            id: randomUUID(),
            userId: TEMP_USER_ID,
            label: data.label,
            amount: data.amount.toString(),
            category: data.category,
            createdAt: new Date(),
        };

        await db.insert(quickExpenses).values(newQuickExpense);

        return NextResponse.json(newQuickExpense, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Internal Server Error: error creating quick expense.' },
            { status: 500 },
        );
    }
}
