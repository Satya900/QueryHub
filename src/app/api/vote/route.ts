import { voteCollection, db } from "@/models/name";
import { user, client } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { ID, TablesDB, Query } from "node-appwrite";

const tablesDB = new TablesDB(client);

export async function POST(request: NextRequest) {
    try {
        const { typeId, type, voteType, authorId } = await request.json();
        
        // Check if user already voted on this item
        const existingVote = await tablesDB.listRows({
            databaseId: db,
            tableId: voteCollection,
            queries: [
                Query.equal("typeId", typeId),
                Query.equal("type", type),
                Query.equal("voteById", authorId),
            ]
        });

        let userVote = null;
        
        if (existingVote.total > 0) {
            const currentVote = existingVote.rows[0];
            
            // If clicking the same vote type, remove the vote (toggle off)
            if (currentVote.voteStatus === voteType) {
                await tablesDB.deleteRow({
                    databaseId: db,
                    tableId: voteCollection,
                    rowId: currentVote.$id
                });
                userVote = null;
            } else {
                // If clicking different vote type, update the vote
                await tablesDB.updateRow({
                    databaseId: db,
                    tableId: voteCollection,
                    rowId: currentVote.$id,
                    data: { voteStatus: voteType }
                });
                userVote = voteType;
            }
        } else {
            // Create new vote
            await tablesDB.createRow({
                databaseId: db,
                tableId: voteCollection,
                rowId: ID.unique(),
                data: {
                    typeId,
                    type,
                    voteStatus: voteType,
                    voteById: authorId
                }
            });
            userVote = voteType;
        }

        // Calculate new score
        const [upvotes, downvotes] = await Promise.all([
            tablesDB.listRows({
                databaseId: db,
                tableId: voteCollection,
                queries: [
                    Query.equal("typeId", typeId),
                    Query.equal("type", type),
                    Query.equal("voteStatus", "upvote"),
                ]
            }),
            tablesDB.listRows({
                databaseId: db,
                tableId: voteCollection,
                queries: [
                    Query.equal("typeId", typeId),
                    Query.equal("type", type),
                    Query.equal("voteStatus", "downvote"),
                ]
            })
        ]);

        const newScore = upvotes.total - downvotes.total;
        
        return NextResponse.json({ 
            newScore, 
            userVote,
            upvotes: upvotes.total,
            downvotes: downvotes.total
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}

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