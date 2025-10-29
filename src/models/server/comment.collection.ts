// type content typeID authorID
import {Permission, TablesDB} from "node-appwrite"

import {db, commentCollection} from "../name"
import {client} from "./config"

const tablesDB = new TablesDB(client);

export default async function createCommentCollection(){
    // create comments using createTables
    await tablesDB.createTable({
            databaseId: db,
            tableId: commentCollection,
            name: commentCollection,
            permissions: [
        Permission.create("users"),
        Permission.read("any"),
        Permission.read("users"),
        Permission.update("users"),
        Permission.delete("users"),
    ]});
    console.log("Comment Collection Created");

    // creating columns using createStringColumn
    await Promise.all([
            tablesDB.createStringColumn({
                databaseId: db,
                tableId: commentCollection,
                key: "content",
                size: 10000,
                required: true
                        }),
            tablesDB.createEnumColumn({
                databaseId: db,
                tableId: commentCollection,
                key: "type",
                elements: ["question","answer"],
                required: true
                        }),
            tablesDB.createStringColumn({
                            databaseId: db,
                            tableId: commentCollection,
                            key: "typeId",
                            size: 50,
                            required: true
                        }),

            tablesDB.createStringColumn({
                            databaseId: db,
                            tableId: commentCollection,
                            key: "authorId",
                            size: 255,
                            required: true
                        }),
        ]);
        console.log("Comment Attributes Created");

        };
