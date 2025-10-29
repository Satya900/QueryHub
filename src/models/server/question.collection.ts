import {Permission, TablesDB, IndexType} from "node-appwrite"

import {db, questionCollection} from "../name"
import {client} from "./config"

const tablesDB = new TablesDB(client);


export default async function createQuestionCollection(){
    // create questions using createTables
    await tablesDB.createTable({
        databaseId: db,
        tableId: questionCollection,
        name: questionCollection,
        permissions: [
            Permission.read("any"),
            Permission.read("users"),
            Permission.create("users"),
            Permission.update("users"),
            Permission.delete("users"),
]

    })

    console.log("Question Table is created");

    // creating columns using createStringColumn
    await Promise.all(
        [
            tablesDB.createStringColumn({
                databaseId: db,
                tableId: questionCollection,
                key: "title",
                size: 255,
                required: true
            }),
            tablesDB.createStringColumn({
                databaseId: db,
                tableId: questionCollection,
                key: "content",
                size: 10000,
                required: true
            }),
            tablesDB.createStringColumn({
                databaseId: db,
                tableId: questionCollection,
                key: "authorId",
                size: 255,
                required: true
            }),
            tablesDB.createStringColumn({
                databaseId: db,
                tableId: questionCollection,
                key: "tags",
                size: 50,
                required: true
            }),
            tablesDB.createStringColumn({
                databaseId: db,
                tableId: questionCollection,
                key: "attachmentId",
                size: 50,
                required: false
            }),
        ]
    )

    console.log("Question Table Columns are created");

    await Promise.all([
        tablesDB.createIndex({
            databaseId: db,
            tableId: questionCollection,
            key: "title",
            type: IndexType.Fulltext,
            columns: ["title"]
        }),
        tablesDB.createIndex({
            databaseId: db,
            tableId: questionCollection,
            key: "content",
            type: IndexType.Fulltext,
            columns: ["content"]
        }),
        tablesDB.createIndex({
            databaseId: db,
            tableId: questionCollection,
            key: "authorId",
            type: IndexType.Key,
            columns: ["authorId"]
        }),
        tablesDB.createIndex({
            databaseId: db,
            tableId: questionCollection,
            key: "tags",
            type: IndexType.Fulltext,
            columns: ["tags"]
        }),
        tablesDB.createIndex({
            databaseId: db,
            tableId: questionCollection,
            key: "attachmentId",
            type: IndexType.Key,
            columns: ["attachmentId"]
        })
    ])

    console.log("Question Table Indexes are created");
}