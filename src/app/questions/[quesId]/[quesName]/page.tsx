/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */

import { avatars } from "@/models/client/config";
import {
    answerCollection,
    db,
    voteCollection,
    questionCollection,
    commentCollection,
    questionAttachmentBucket,
} from "@/models/name";
import { databases, user, client } from "@/models/server/config";
import { storage } from "@/models/client/config";

import { UserPrefs } from "@/store/Auth";
import convertDateToRelativeTime from "@/utils/relativeTime";
import { generateProfileUrl } from "@/utils/profileUrl";
import { IconEdit } from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";
import { Query, TablesDB } from "node-appwrite";
import React from "react";
import QuestionDetailClient from "@/components/QuestionDetailClient";



const tablesDB = new TablesDB(client);

const Page = async({ params }: { params: Promise<{ quesId: string; quesName: string }> }) =>{
    const { quesId } = await params;
    let answers;
    try {
        answers = await tablesDB.listRows({
            databaseId: db, 
            tableId: answerCollection, 
            queries: [
                Query.orderDesc("$createdAt"),
                Query.equal("questionId", quesId),
            ]
        });
    } catch (error) {
        console.error("Error fetching answers:", error);
        answers = { rows: [], total: 0 };
    }

const [question, upvotes, downvotes, comments] = await Promise.all([
        tablesDB.getRow({
            databaseId: db,
            tableId: questionCollection,
            rowId: quesId
        }),
        tablesDB.listRows({
            databaseId: db,
            tableId: voteCollection,
            queries: [
                Query.equal("typeId", quesId),
                Query.equal("type", "question"),
                Query.equal("voteStatus", "upvote"),
                Query.limit(1), // for optimization
            ]
}),
        tablesDB.listRows({
            databaseId: db,
            tableId: voteCollection,
            queries: [
                Query.equal("typeId", quesId),
                Query.equal("type", "question"),
                Query.equal("voteStatus", "downvote"),
                Query.limit(1), // for optimization
            ]
}),
        tablesDB.listRows({
            databaseId: db,
            tableId: commentCollection,
            queries: [
                Query.equal("type", "question"),
                Query.equal("typeId", quesId),
                Query.orderDesc("$createdAt"),
            ]
}),
    ]);
// since it is dependent on the question, we fetch it here outside of the Promise.all
    let author;
    try {
        author = await user.get<UserPrefs>(question.authorId);
    } catch (error) {
        console.error("Error fetching question author:", error);
        author = {
            $id: question.authorId,
            name: "Unknown User",
            prefs: { reputation: 0 }
        };
    }

    [comments.rows, answers.rows] = await Promise.all([
        Promise.all(
            comments.rows.map(async comment => {
                try {
                    const commentAuthor = await user.get<UserPrefs>(comment.authorId);
                    return {
                        ...comment,
                        author: {
                            $id: commentAuthor.$id,
                            name: commentAuthor.name,
                            reputation: commentAuthor.prefs.reputation,
                        },
                    };
                } catch (error) {
                    console.error("Error fetching comment author:", error);
                    return {
                        ...comment,
                        author: {
                            $id: comment.authorId,
                            name: "Unknown User",
                            reputation: 0,
                        },
                    };
                }
            })
        ),
        Promise.all(
            answers.rows.map (async answer => {
                let answerAuthor;
                try {
                    answerAuthor = await user.get<UserPrefs>(answer.authorId);
                } catch (error) {
                    console.error("Error fetching answer author:", error);
                    answerAuthor = {
                        $id: answer.authorId,
                        name: "Unknown User",
                        prefs: { reputation: 0 }
                    };
                }

                const [comments, upvotes, downvotes] = await Promise.all([
                    tablesDB.listRows({
                        databaseId: db,
                        tableId: commentCollection,
                        queries: [
                            Query.equal("typeId", answer.$id),
                            Query.equal("type", "answer"),
                            Query.orderDesc("$createdAt"),
                        ],
                    }),
                    tablesDB.listRows({
                        databaseId: db,
                        tableId: voteCollection,
                        queries: [
                            Query.equal("typeId", answer.$id),
                            Query.equal("type", "answer"),
                            Query.equal("voteStatus", "upvote"),
                            Query.limit(1), // for optimization
                        ],
                    }),
                    tablesDB.listRows({
                        databaseId: db,
                        tableId: voteCollection,
                        queries: [
                            Query.equal("typeId", answer.$id),
                            Query.equal("type", "answer"),
                            Query.equal("voteStatus", "downvote"),
                            Query.limit(1), // for optimization
                        ],
                    }),
                ]);
                
                comments.rows = await Promise.all(
                    comments.rows.map(async comment => {
                        try {
                            const commentAuthor = await user.get<UserPrefs>(comment.authorId);
                            return {
                                ...comment,
                                author: {
                                    $id: commentAuthor.$id,
                                    name: commentAuthor.name,
                                    reputation: commentAuthor.prefs.reputation,
                                },
                            };
                        } catch (error) {
                            console.error("Error fetching answer comment author:", error);
                            return {
                                ...comment,
                                author: {
                                    $id: comment.authorId,
                                    name: "Unknown User",
                                    reputation: 0,
                                },
                            };
                        }
                    })
                );
                
                return {
                    ...answer,
                    comments,
                    upvotesDocuments: upvotes,
                    downvotesDocuments: downvotes,
                    author: {
                        $id: answerAuthor.$id,
                        name: answerAuthor.name,
                        reputation: answerAuthor.prefs?.reputation || 0,
                    },
                };
            })
        ),
    ]);
            
    
    return (
        <QuestionDetailClient
            question={question}
            answers={answers}
            upvotes={upvotes}
            downvotes={downvotes}
            comments={comments}
            author={author}
            quesId={quesId}
        />
    )
}

export default Page;