import { db } from "../name";

import createAnswerCollection from "./answer.collection";
import createCommentCollection from "./comment.collection";
import createQuestionCollection from "./question.collection";
import createVoteCollection from "./vote.collection";

import { TablesDB } from "node-appwrite";
import { client } from "./config";

const tablesDB = new TablesDB(client);

export default async function dbSetup() {
    try {
        await tablesDB.get({
            databaseId: db,
        })
        console.log("Database connected");
        
    } catch (error) {
        try {
            await tablesDB.create({
                databaseId: db,
                name: "QueryHub Database",
            })
            await Promise.all([
                createQuestionCollection(),
                createAnswerCollection(),
                createCommentCollection(),
                createVoteCollection(),
            ])
            console.log("Database created");
            console.log("Database connected");
        } catch (error) {
            console.log(error);
            console.log("Failed to create database");
        }
    }
    return tablesDB;
}