import Pagination from "@/components/Pagination";
import { answerCollection, db, questionCollection } from "@/models/name";
import { client} from "@/models/server/config";
import slugify from "slugify";
import Link from "next/link";
import { Query, TablesDB } from "node-appwrite";
import React from "react";
const tabledb = new TablesDB(client)

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

    const answers = await tabledb.listRows({
        databaseId: db,
        tableId: answerCollection,
        queries
    });

    answers.rows = await Promise.all(
        answers.rows.map(async ans => {
            const question = await tabledb.getRow({
                databaseId: db,
                tableId: questionCollection,
                rowId: ans.questionId
            });
            return { ...ans, question };
        })
    );

    return (
        <div className="px-4">
            <div className="mb-4">
                <p>{answers.total} answers</p>
            </div>
            <div className="mb-4 max-w-3xl space-y-6">
                {answers.rows.map(ans => (
                    <div key={ans.$id}>
                        <div className="max-h-40 overflow-auto rounded-lg bg-white/5 p-4" dangerouslySetInnerHTML={{ __html: ans.content }} />
                        <Link
                            href={`/questions/${ans.questionId}/${slugify(ans.question.title)}`}
                            className="mt-3 inline-block shrink-0 rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600"
                        >
                            Question
                        </Link>
                    </div>
                ))}
            </div>
            <Pagination total={answers.total} limit={25} />
        </div>
    );
};

export default Page;