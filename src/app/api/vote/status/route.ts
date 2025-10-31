import { voteCollection, db } from "@/models/name";
import { client } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { TablesDB, Query } from "node-appwrite";

const tablesDB = new TablesDB(client);

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const typeId = searchParams.get('typeId');
        const type = searchParams.get('type');
        const userId = searchParams.get('userId');

        if (!typeId || !type || !userId) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Get user's current vote
        const userVote = await tablesDB.listRows({
            databaseId: db,
            tableId: voteCollection,
            queries: [
                Query.equal("typeId", typeId),
                Query.equal("type", type),
                Query.equal("voteById", userId),
            ]
        });

        return NextResponse.json({ 
            userVote: userVote.total > 0 ? userVote.rows[0].voteStatus : null 
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}