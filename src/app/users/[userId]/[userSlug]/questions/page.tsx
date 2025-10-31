import Pagination from "@/components/Pagination";
import QuestionCard from "@/components/QuestionCard";
import { answerCollection, db, questionCollection, voteCollection } from "@/models/name";
import { client, user } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { Query, TablesDB } from "node-appwrite";
import React from "react";

const tableDb = new TablesDB(client);

const Page = async ({
    params,
    searchParams,
}: {
    params: Promise<{ userId: string; userSlug: string }>;
    searchParams: Promise<{ page?: string }>;
}) => {
    const { userId } = await params;
    const { page = "1" } = await searchParams;

    const queries = [
        Query.equal("authorId", userId),
        Query.orderDesc("$createdAt"),
        Query.offset((+page - 1) * 25),
        Query.limit(25),
    ];

    const questions = await tableDb.listRows({
        databaseId: db,
        tableId: questionCollection,
        queries
    });

    const docs = await Promise.all(
        questions.rows.map(async ques => {
            try {
                const [author, answers, votes] = await Promise.all([
                    user.get<UserPrefs>(ques.authorId),
                    tableDb.listRows({
                        databaseId: db,
                        tableId: answerCollection,
                        queries: [
                            Query.equal("questionId", ques.$id),
                            Query.limit(1), // for optimization
                        ]
                    }),
                    tableDb.listRows({
                        databaseId: db,
                        tableId: voteCollection,
                        queries: [
                            Query.equal("type", "question"),
                            Query.equal("typeId", ques.$id),
                            Query.limit(1), // for optimization
                        ]
                    }),
                ]);

                return {
                    ...ques,
                    $collectionId: ques.$tableId,
                    totalAnswers: answers.total,
                    totalVotes: votes.total,
                    tags: Array.isArray(ques.tags) ? ques.tags : (ques.tags ? ques.tags.split(',').map(tag => tag.trim()) : []),
                    author: {
                        $id: author.$id,
                        reputation: author.prefs.reputation,
                        name: author.name,
                    },
                };
            } catch (error) {
                return {
                    ...ques,
                    $collectionId: ques.$tableId,
                    totalAnswers: 0,
                    totalVotes: 0,
                    tags: Array.isArray(ques.tags) ? ques.tags : (ques.tags ? ques.tags.split(',').map(tag => tag.trim()) : []),
                    author: {
                        $id: ques.authorId,
                        reputation: 0,
                        name: "Unknown User",
                    },
                };
            }
        })
    );

    return (
        <div className="px-4">
            <div className="mb-4">
                <p>{questions.total} questions</p>
            </div>
            <div className="mb-4 max-w-3xl space-y-6">
                {docs.map(ques => (
                    <QuestionCard key={ques.$id} ques={ques} />
                ))}
            </div>
            <Pagination total={questions.total} limit={25} />
        </div>
    );
};

export default Page;