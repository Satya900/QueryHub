"use client";

import { Models } from "appwrite";
import React from "react";
import VoteButtons from "./VoteButtons";
import { useAuthStore } from "@/store/Auth";
import { avatars} from "@/models/client/config";
import RTE from "./RTE";
import Comments from "./Comments";
import { generateProfileUrl } from "@/utils/profileUrl";
import Link from "next/link";
import { IconTrash } from "@tabler/icons-react";

interface AnswerDocument extends Models.Document {
    content: string;
    authorId: string;
    author: {
        $id: string;
        name: string;
        reputation: number;
    };
    upvotesDocuments: Models.DocumentList<Models.Document>;
    downvotesDocuments: Models.DocumentList<Models.Document>;
    comments: Models.DocumentList<Models.Document>;
}

const Answers = ({
    answers: _answers,
    questionId,
}: {
    answers: Models.DocumentList<Models.Document>;
    questionId: string;
}) => {
    const [answers, setAnswers] = React.useState(_answers);
    const [newAnswer, setNewAnswer] = React.useState("");
    const { user } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newAnswer || !user) return;

        try {
            const response = await fetch("/api/answer", {
                method: "POST",
                body: JSON.stringify({
                    questionId: questionId,
                    answer: newAnswer,
                    authorId: user.$id,
                }),
            });

            const data = await response.json();

            if (!response.ok) throw data;

            setNewAnswer(() => "");
            setAnswers(prev => ({
                total: prev.total + 1,
                documents: [
                    {
                        ...data,
                        author: user,
                        upvotesDocuments: { documents: [], total: 0 },
                        downvotesDocuments: { documents: [], total: 0 },
                        comments: { documents: [], total: 0 },
                    },
                    ...prev.documents,
                ],
            }));
        } catch (error: unknown) {
            window.alert((error as Error)?.message || "Error creating answer");
        }
    };

    const deleteAnswer = async (answerId: string) => {
        try {
            const response = await fetch("/api/answer", {
                method: "DELETE",
                body: JSON.stringify({
                    answerId: answerId,
                }),
            });

            const data = await response.json();

            if (!response.ok) throw data;

            setAnswers(prev => ({
                total: prev.total - 1,
                documents: prev.documents.filter(answer => answer.$id !== answerId),
            }));
        } catch (error: unknown) {
            window.alert((error as Error)?.message || "Error deleting answer");
        }
    };

    return (
        <>
            <h2 className="mb-4 text-xl">{answers.total} Answers</h2>
            {answers.documents.map(answer => (
                <div key={answer.$id} className="flex gap-4">
                    <div className="flex shrink-0 flex-col items-center gap-4">
                        <VoteButtons
                            type="answer"
                            id={answer.$id}
                            upvotes={(answer as AnswerDocument).upvotesDocuments}
                            downvotes={(answer as AnswerDocument).downvotesDocuments}
                        />
                        {user?.$id === (answer as AnswerDocument).authorId ? (
                            <button
                                type="button"
                                title="Delete answer"
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-red-500 p-1 text-red-500 duration-200 hover:bg-red-500/10"
                                onClick={() => deleteAnswer(answer.$id)}
                            >
                                <IconTrash className="h-4 w-4" />
                            </button>
                        ) : null}
                    </div>
                    <div className="w-full overflow-auto">
                        <div className="rounded-xl p-4" dangerouslySetInnerHTML={{ __html: (answer as AnswerDocument).content }} />
                        <div className="mt-4 flex items-center justify-end gap-1">
                            <picture>
                                <img
                                    src={avatars.getInitials({ name: (answer as AnswerDocument).author.name, width: 36, height: 36 })}
                                    alt={(answer as AnswerDocument).author.name}
                                    className="rounded-lg"
                                />
                            </picture>
                            <div className="block leading-tight">
                                <Link
                                    href={generateProfileUrl((answer as AnswerDocument).author.$id, (answer as AnswerDocument).author.name)}
                                    className="text-orange-500 hover:text-orange-600"
                                >
                                    {(answer as AnswerDocument).author.name}
                                </Link>
                                <p>
                                    <strong>{(answer as AnswerDocument).author.reputation}</strong>
                                </p>
                            </div>
                        </div>
                        <Comments
                            comments={(answer as AnswerDocument).comments}
                            className="mt-4"
                            type="answer"
                            typeId={answer.$id}
                        />
                        <hr className="my-4 border-white/40" />
                    </div>
                </div>
            ))}
            <hr className="my-4 border-white/40" />
            <form onSubmit={handleSubmit} className="space-y-2">
                <h2 className="mb-4 text-xl">Your Answer</h2>
                <RTE value={newAnswer} onChange={value => setNewAnswer(() => value || "")} />
                <button type="submit" className="shrink-0 rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600">
                    Post Your Answer
                </button>
            </form>
        </>
    );
};

export default Answers;