import { answerCollection, db } from "@/models/name";
import { user, client} from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { ID, TablesDB } from "node-appwrite";
const tablesDB = new TablesDB(client);



export async function POST(request: NextRequest){
    try {
        const {questionId, content, authorId} = await request.json();
        const response = await tablesDB.createRow({
            databaseId: db,
            tableId: answerCollection,
            rowId: ID.unique(),
            data: {
                questionId,
                content,
                authorId
            }
        })

        // Increase author reputation
        const currentUser = await user.get({ userId: authorId })
        await user.updatePrefs({
            userId: authorId,
            prefs: {
                reputation: (currentUser.prefs?.reputation || 0) + 1
            }
        })
        
        return NextResponse.json({data: response}, { status: 201 })

    } catch (error) {
        return NextResponse.json({
            error
    }, {status:500})
    }
}

export async function DELETE(request: NextRequest){
    try {
       const {answerId} = await request.json();
        
        // First get the answer to retrieve authorId
        const answer = await tablesDB.getRow({
            databaseId: db,
            tableId: answerCollection,
            rowId: answerId
        })
        
        // Delete the answer
        const response = await tablesDB.deleteRow({
            databaseId: db,
            tableId: answerCollection,
            rowId: answerId
        })

        // Decrease author reputation
        const currentUser = await user.get({ userId: answer.authorId })
        await user.updatePrefs({
            userId: answer.authorId,
            prefs: {
                reputation: (currentUser.prefs?.reputation || 0) - 1
            }
        })

        return NextResponse.json({ message: "Answer deleted successfully", data: response }, { status: 200 })

    } catch (error) {
         return NextResponse.json({
            error
    }, {status:500})
    }
}