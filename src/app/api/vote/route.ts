import { voteCollection, db, questionCollection, answerCollection } from "@/models/name";
import { client, user} from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query, TablesDB } from "node-appwrite";
const tablesDB = new TablesDB(client);

export async function POST(request: NextRequest){
    try {
        // Extract vote data from request
        const { voteById, voteStatus, type, typeId} = await request.json();
        
        // Check if user has already voted on this item
        const existingVote = await tablesDB.listRows({
            databaseId: db,
            tableId: voteCollection,
            queries:[
                Query.equal("type", type),
                Query.equal("typeId", typeId),
                Query.equal("voteById", voteById)
            ]
        })
        
        // If user has previously voted, remove the old vote and revert reputation
        if(existingVote.rows.length > 0){
            // Delete existing vote
            await tablesDB.deleteRow({
                databaseId: db,
                tableId: voteCollection,
                rowId: existingVote.rows[0].$id
            })
            
            // Get the question/answer author to update their reputation
            const targetItem = await tablesDB.getRow({
                databaseId: db,
                tableId: type === "question" ? questionCollection : answerCollection,
                rowId: typeId
            })

            const authorPrefs = await user.getPrefs<UserPrefs>({
                userId: targetItem.authorId
            })

            // Revert reputation change from previous vote
            await user.updatePrefs<UserPrefs>({
                userId: targetItem.authorId,
                prefs: {
                    reputation: existingVote.rows[0].voteStatus === "upvoted"
                        ? authorPrefs.reputation - 1  // Remove upvote bonus
                        : authorPrefs.reputation + 1   // Remove downvote penalty
                }
            })
        }
        
        // Create new vote if vote status is different from existing or no previous vote
        if(existingVote.rows[0]?.voteStatus != voteStatus){
            // Create new vote record
            await tablesDB.createRow({
                databaseId: db,
                tableId: voteCollection,
                rowId: ID.unique(),
                data: {
                    type,
                    typeId,
                    voteById,
                    voteStatus
                }
            });
            
            // Update author's reputation based on new vote
            const targetItem = await tablesDB.getRow({
                databaseId: db,
                tableId: type === "question" ? questionCollection : answerCollection,
                rowId: typeId
            })
            
            const authorPrefs = await user.getPrefs<UserPrefs>({
                userId: targetItem.authorId
            })

            // Apply reputation change for new vote
            await user.updatePrefs<UserPrefs>({
                userId: targetItem.authorId,
                prefs:{
                    reputation: 
                        voteStatus === "upvoted"
                        ? authorPrefs.reputation + 1  // Add upvote bonus
                        : authorPrefs.reputation - 1   // Add downvote penalty
                }
            });
        }

        // Get current vote counts for this item
        const [upVotes, downVotes] = await Promise.all([
            tablesDB.listRows({
                databaseId: db,
                tableId: voteCollection,
                queries:[
                    Query.equal("type", type),
                    Query.equal("typeId", typeId),
                    Query.equal("voteStatus", "upvoted")
                ]
            }),
            tablesDB.listRows({
                databaseId: db,
                tableId: voteCollection,
                queries:[
                    Query.equal("type", type),
                    Query.equal("typeId", typeId),
                    Query.equal("voteStatus", "downvoted")
                ]
            }),
        ]) 

        return NextResponse.json({
            data:{
                vote: existingVote.rows[0] || null,
                voteResult:{
                    upVotes: upVotes.total,
                    downVotes: downVotes.total
                }
            }
        }, { status: 201 })

    } catch (error) {
        return NextResponse.json({
            error
        }, {status:500})
    }
}