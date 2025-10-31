"use client";
import { client } from "@/models/client/config";
import { commentCollection, db } from "@/models/name";
import { useAuthStore } from "@/store/Auth";
import { cn } from "@/lib/utils"
import convertDateToRelativeTime from "@/utils/relativeTime";
import { generateProfileUrl } from "@/utils/profileUrl";
import { IconTrash } from "@tabler/icons-react";
import { ID, Models, TablesDB } from "appwrite";
import Link from "next/link";
import React from "react";

interface CommentDocument extends Models.Document {
    content: string;
    authorId: string;
    author: {
        name: string;
    };
    type: string;
    typeId: string;
}

const tableDB = new TablesDB(client);

const Comments = ({
    comments: _comments,
    type,
    typeId,
    className,
}: {
    comments: Models.DocumentList<Models.Document>;
    type: "question" | "answer";
    typeId: string;
    className?: string;
}) => {
    const [comments, setComments] = React.useState(_comments);
    const [newComment, setNewComment] = React.useState("");
    const { user } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newComment || !user) return;

        try {
            const response = await tableDB.createRow({
                databaseId: db,
                tableId: commentCollection,
                rowId: ID.unique(),
                data: {
                    content: newComment,
                    authorId: user.$id,
                    type: type,
                    typeId: typeId,
                }
            });

            setNewComment(() => "");
            setComments(prev => ({
                total: prev.total + 1,
                documents: [{ ...response, author: user, $collectionId: commentCollection } as Models.Document, ...prev.documents],
            }));
        } catch (error) {
            window.alert(error instanceof Error ? error.message : "Error creating comment");
        }
    };

    const deleteComment = async (commentId: string) => {
        try {
            await tableDB.deleteRow({
                databaseId: db,
                tableId: commentCollection,
                rowId: commentId
            });

            setComments(prev => ({
                total: prev.total - 1,
                documents: prev.documents.filter(comment => comment.$id !== commentId),
            }));
        } catch (error) {
            window.alert(error instanceof Error ? error.message : "Error deleting comment");
        }
    };

    return (
        <div className={cn("flex flex-col gap-2 pl-4", className)}>
            {comments.documents.map(comment => (
                <React.Fragment key={comment.$id}>
                    <hr className="border-white/40" />
                    <div className="flex gap-2">
                        <p className="text-sm">
                            {(comment as CommentDocument).content} -{" "}
                            <Link
                                href={generateProfileUrl((comment as CommentDocument).authorId, (comment as CommentDocument).author.name)}
                                className="text-orange-500 hover:text-orange-600"
                            >
                                {(comment as CommentDocument).author.name}
                            </Link>{" "}
                            <span className="opacity-60">
                                {convertDateToRelativeTime(new Date(comment.$createdAt))}
                            </span>
                        </p>
                        {user?.$id === (comment as CommentDocument).authorId ? (
                            <button
                                type="button"
                                title="Delete comment"
                                onClick={() => deleteComment(comment.$id)}
                                className="shrink-0 text-red-500 hover:text-red-600"
                            >
                                <IconTrash className="h-4 w-4" />
                            </button>
                        ) : null}
                    </div>
                </React.Fragment>
            ))}
            <hr className="border-white/40" />
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <textarea
                    className="w-full rounded-md border border-white/20 bg-white/10 p-2 outline-none"
                    rows={1}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={e => setNewComment(() => e.target.value)}
                />
                <button type="submit" className="shrink-0 rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600">
                    Add Comment
                </button>
            </form>
        </div>
    );
};

export default Comments;