import { commentCollection, db } from "@/models/name";
import { user, client } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { ID, TablesDB } from "node-appwrite";

const tablesDB = new TablesDB(client);

export async function POST(request: NextRequest) {
    try {
        const { typeId, type, content, authorId } = await request.json();
        
        const response = await tablesDB.createRow({
            databaseId: db,
            tableId: commentCollection,
            rowId: ID.unique(),
            data: {
                typeId,
                type,
                content,
                authorId
            }
        });

        // Increase author reputation
        const currentUser = await user.get({ userId: authorId });
        await user.updatePrefs({
            userId: authorId,
            prefs: {
                reputation: (currentUser.prefs?.reputation || 0) + 1
            }
        });
        
        return NextResponse.json({ data: response }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}