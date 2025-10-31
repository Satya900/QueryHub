/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/error-boundaries */
import { client, user } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import React from "react";
import { MagicCard } from "@/components/ui/magic-card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { answerCollection, db, questionCollection } from "@/models/name";
import { Query, TablesDB } from "node-appwrite";
const tabledb = new TablesDB(client);

const Page = async ({ params }: { params: Promise<{ userId: string; userSlug: string }> }) => {
    const { userId } = await params;
    
    try {
        const [userData, questions, answers] = await Promise.all([
            user.get<UserPrefs>({
                userId
            }),
            tabledb.listRows({
                databaseId: db,
                tableId: questionCollection,
                queries: [
                    Query.equal("authorId", userId),
                    Query.limit(1), // for optimization
                ]
            }),
            tabledb.listRows({
                databaseId: db,
                tableId: answerCollection,
                queries: [
                    Query.equal("authorId", userId),
                    Query.limit(1), // for optimization
                ]
            }),
        ]);

        return (
            <div className={"flex h-[500px] w-full flex-col gap-4 lg:h-[250px] lg:flex-row"}>
                <MagicCard className="flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden p-20 shadow-2xl">
                    <div className="absolute inset-x-4 top-4">
                        <h2 className="text-xl font-medium">Reputation</h2>
                    </div>
                    <div className="absolute inset-x-4 top-4" >
                        <p className="z-10 whitespace-nowrap text-4xl font-medium text-gray-800 dark:text-gray-200">
                        <NumberTicker value={userData.prefs.reputation} />
                    </p>
                    </div>
                    <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
                </MagicCard>
                <MagicCard className="flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden p-20 shadow-2xl">
                    <div className="absolute inset-x-4 top-4">
                        <h2 className="text-xl font-medium">Questions asked</h2>
                    </div>
                    <p className="z-10 whitespace-nowrap text-4xl font-medium text-gray-800 dark:text-gray-200">
                        <NumberTicker value={questions.total} />
                    </p>
                    <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
                </MagicCard>
                <MagicCard className="flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden p-20 shadow-2xl">
                    <div className="absolute inset-x-4 top-4">
                        <h2 className="text-xl font-medium">Answers given</h2>
                    </div>
                    <p className="z-10 whitespace-nowrap text-4xl font-medium text-gray-800 dark:text-gray-200">
                        <NumberTicker value={answers.total} />
                    </p>
                    <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
                </MagicCard>
            </div>
        );
    } catch (error) {
        return (
            <div className="flex h-[500px] w-full items-center justify-center">
                <p className="text-xl text-gray-600 dark:text-gray-400">User not found</p>
            </div>
        );
    }
};

export default Page;