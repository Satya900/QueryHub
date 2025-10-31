import { user, client } from "@/models/server/config";
import { answerCollection, db, voteCollection, questionCollection } from "@/models/name";
import { Query, TablesDB } from "node-appwrite";
import React from "react";
import Link from "next/link";
import ShimmerButton from "@/components/ui/shimmer-button";
import QuestionCard from "@/components/QuestionCard";
import { UserPrefs } from "@/store/Auth";
import Pagination from "@/components/Pagination";
import Search from "../questions/Search";

const tabledb = new TablesDB(client);

const QUESTIONS_PER_PAGE = 25;

const QuestionPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ page?: string | null; tag?: string | null; search?: string | null }>;
}) => {
    const { page = "1", tag, search } = await searchParams;
    const pageNumber = +(page || "1");

    const queries = [
        Query.orderDesc("$createdAt"),
        Query.offset((pageNumber - 1) * QUESTIONS_PER_PAGE),
        Query.limit(QUESTIONS_PER_PAGE),
    ];

    if (tag) queries.push(Query.equal("tags", tag));
    if (search)
        queries.push(
            Query.or([
                Query.search("title", search),
                Query.search("content", search),
            ])
        );

    const questions = await tabledb.listRows({
        databaseId: db,
        tableId: questionCollection,
        queries,
    })


    const questionIds = questions.rows.map(q => q.$id);
    const authorIds = questions.rows.map(q => q.authorId);

    if (questionIds.length === 0) {
        return (
            <div className="container mx-auto px-4 pb-20 pt-36">
                <div className="mb-10 flex items-center justify-between">
                    <h1 className="text-3xl font-bold">All Questions</h1>
                    <Link href="/questions/ask">
                        <ShimmerButton className="shadow-2xl">
                            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg">
                                Ask a question
                            </span>
                        </ShimmerButton>
                    </Link>
                </div>
                <div className="mb-4">
                    <Search />
                </div>
                <div className="mb-4">
                    <p>0 questions</p>
                </div>
                <div className="mb-4 max-w-3xl space-y-6">
                    <p>No questions found.</p>
                </div>
            </div>
        );
    }

    let answers, votes;
    try {
        answers = await tabledb.listRows({
            databaseId: db,
            tableId: answerCollection,
            queries: [Query.equal("questionId", questionIds)],
        });
    } catch (error) {
        console.error("Error fetching answers:", error);
        answers = { rows: [] };
    }

    try {
        votes = await tabledb.listRows({
            databaseId: db,
            tableId: voteCollection,
            queries: [
                Query.equal("type", "question"),
                Query.equal("typeId", questionIds),
            ],
        });
    } catch (error) {
        console.error("Error fetching votes:", error);
        votes = { rows: [] };
    }

    const authors = await Promise.all(authorIds.map(id => user.get<UserPrefs>(id)));

    const answerCounts = answers.rows.reduce((acc, answer) => {
        acc[answer.questionId] = (acc[answer.questionId] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const voteCounts = votes.rows.reduce((acc, vote) => {
        acc[vote.questionId] = (acc[vote.questionId] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const docs = questions.rows.map((ques, index) => ({
        ...ques,
        $collectionId: ques.$tableId,
        totalAnswers: answerCounts[ques.$id] || 0,
        totalVotes: voteCounts[ques.$id] || 0,
        author: {
            $id: authors[index].$id,
            reputation: authors[index].prefs.reputation,
            name: authors[index].name,
        },
    }))
    return(
        <div className="container mx-auto px-4 pb-20 pt-36">
            <div className="mb-10 flex items-center justify-between">
                <h1 className="text-3xl font-bold">All Questions</h1>
                <Link href="/questions/ask">
                    <ShimmerButton className="shadow-2xl">
                        <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg">
                            Ask a question
                        </span>
                    </ShimmerButton>
                </Link>
            </div>
            <div className="mb-4">
                <Search />
            </div>
            <div className="mb-4">
                <p>{questions.total} questions</p>
            </div>
            <div className="mb-4 max-w-3xl space-y-6">
                {docs.map(ques => (
                    <QuestionCard key={ques.$id} ques={ques} />
                ))}
            </div>
            <Pagination total={questions.total} limit={QUESTIONS_PER_PAGE} />
        </div>
    )

}

export default QuestionPage;