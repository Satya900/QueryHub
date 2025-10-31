// Content questionId AuthorID 
import {Permission, TablesDB} from "node-appwrite"

import {db, answerCollection} from "../name"
import {client} from "./config"

const tablesDB = new TablesDB(client);

export default async function createAnswerCollection(){
    // create answers using createTables
    await tablesDB.createTable({
            databaseId: db,
            tableId: answerCollection,
            name: answerCollection,
            permissions: [
        Permission.create("users"),
        Permission.read("any"),
        Permission.read("users"),
        Permission.update("users"),
        Permission.delete("users"),
    ]});
    console.log("Answer Collection Created");

    // creating columns using createStringColumn
    await Promise.all([
            tablesDB.createStringColumn({
                databaseId: db,
                tableId: answerCollection,
                key: "content",
                size: 10000,
                required: true
                        }),
            tablesDB.createStringColumn({
                databaseId: db,
                tableId: answerCollection,
                key: "questionId",
                size: 255,
                required: true
                        }),
            tablesDB.createStringColumn({
                            databaseId: db,
                            tableId: answerCollection,
                            key: "authorId",
                            size: 255,
                            required: true
                        }),
            tablesDB.createStringColumn({
                            databaseId: db,
                            tableId: answerCollection,
                            key: "imageUrl",
                            size: 500,
                            required: false
                        }),
        ]);
        console.log("Answer Attributes Created");

        };
