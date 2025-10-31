import { questionCollection, db } from "@/models/name";
import { user, databases } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";

export async function POST(request: NextRequest) {
    try {
        const { title, content, authorId, tags, imageUrl } = await request.json();
        
        const response = await databases.createDocument(
            db,
            questionCollection,
            ID.unique(),
            {
                title,
                content,
                authorId,
                tags: JSON.stringify(tags),
                imageUrl: imageUrl || ""
            }
        );

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
        console.error('Question creation error:', error);
        return NextResponse.json({ 
            error: { 
                message: error instanceof Error ? error.message : 'Failed to create question' 
            } 
        }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { questionId, title, content, tags, imageUrl } = await request.json();
        
        const response = await databases.updateDocument(
            db,
            questionCollection,
            questionId,
            {
                title,
                content,
                tags: JSON.stringify(tags),
                imageUrl: imageUrl || ""
            }
        );

        return NextResponse.json({ data: response }, { status: 200 });

    } catch (error) {
        console.error('Question update error:', error);
        return NextResponse.json({ 
            error: { 
                message: error instanceof Error ? error.message : 'Failed to update question' 
            } 
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { questionId } = await request.json();
        
        // First get the question to retrieve authorId
        const question = await databases.getDocument(
            db,
            questionCollection,
            questionId
        );
        
        // Delete the question
        const response = await databases.deleteDocument(
            db,
            questionCollection,
            questionId
        );

        // Decrease author reputation
        const currentUser = await user.get({ userId: question.authorId });
        await user.updatePrefs({
            userId: question.authorId,
            prefs: {
                reputation: (currentUser.prefs?.reputation || 0) - 1
            }
        });

        return NextResponse.json({ message: "Question deleted successfully", data: response }, { status: 200 });

    } catch (error) {
        console.error('Question deletion error:', error);
        return NextResponse.json({ 
            error: { 
                message: error instanceof Error ? error.message : 'Failed to delete question' 
            } 
        }, { status: 500 });
    }
}