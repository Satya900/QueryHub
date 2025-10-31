import React from "react";
import QuestionCard from "@/components/QuestionCard";
import { db, questionCollection, answerCollection, voteCollection } from "@/models/name";
import { databases, user, client } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { Query } from "node-appwrite";
import { TablesDB } from "node-appwrite";

const tabledb = new TablesDB(client);

const LatestQuestions = async () => {
  const questions = await tabledb.listRows({
    databaseId: db,
    tableId: questionCollection,
    queries: [
      Query.limit(5),
      Query.orderDesc("$createdAt"),
    ]
  });

  const docs = await Promise.all(
    questions.rows.map(async (ques) => {
      try {
        const [author, answers, votes] = await Promise.all([
          user.get<UserPrefs>(ques.authorId),
          tabledb.listRows({
            databaseId: db,
            tableId: answerCollection,
            queries: [
              Query.equal("questionId", ques.$id),
              Query.limit(1),
            ]
          }),
          databases.listDocuments(
            db,
            voteCollection,
            [
              Query.equal("type", "question"),
              Query.equal("typeId", ques.$id),
              Query.limit(1),
            ]
          ),
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
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Latest <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Discover the most recent questions from our community of developers
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-pink-400 mx-auto mt-6 rounded-full"></div>
        </div>
        <div className="space-y-8">
          {docs.map((question) => (
            <QuestionCard key={question.$id} ques={question} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestQuestions;
