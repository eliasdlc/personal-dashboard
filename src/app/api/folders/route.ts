import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { folders } from "@/db/schema";
import { and, eq } from "drizzle-orm"; 
import { createFolder } from "@/lib/validators";
import { randomUUID } from "crypto";

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    try {
        const userFolders = await db
        .select()
        .from(folders)
        .where(eq(folders.userId, userId));

        return NextResponse.json(userFolders);
    } catch (error) {
        console.error('[API_FOLDERS_GET]:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    try {
        const json = await request.json();
        const result = createFolder.safeParse(json);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation Failed', details: result.error.flatten().fieldErrors }, 
                { status: 400 });
        }

        const { name, description, color } = result.data;
        const parentId = result.data.parentId ?? null;

        // Validate parent folder if parentId is provided
        if (parentId) {
            const parentFolder = await db
            .query.folders.findFirst({
                where: and(
                    eq(folders.id, parentId), 
                    eq(folders.userId, userId)
                ),
            });

            if (!parentFolder) {
                return NextResponse.json(
                    { error: "Parent folder not found or doesn't belong to you" }, 
                    { status: 404 });
            }
        }

        const newFolder = {
            id: randomUUID(),
            userId,
            name,
            description: description || null,
            parentId: parentId,
            color: color || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        await db.insert(folders).values(newFolder);

        return NextResponse.json(newFolder, { status: 201 });
    } catch (error) {
        console.error('[API_FOLDERS_POST]:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}