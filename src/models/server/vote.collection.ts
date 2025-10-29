import {Permission, TablesDB} from "node-appwrite"

import {db, voteCollection} from "../name"
import {client} from "./config"

const tablesDB = new TablesDB(client);

export default async function createVoteCollection(){
    // create votes using createTables
    await tablesDB.createTable({
            databaseId: db,
            tableId: voteCollection,
            name: voteCollection,
            permissions: [
        Permission.create("users"),
        Permission.read("any"),
        Permission.read("users"),
        Permission.update("users"),
        Permission.delete("users"),
    ]});
    console.log("Vote Collection Created");

    // creating columns using createStringColumn
    await Promise.all([
            tablesDB.createEnumColumn({
                databaseId: db,
                tableId: voteCollection,
                key: "type",
                elements: ["question", "answer"],
                required: true
                        }),
            tablesDB.createStringColumn({
                databaseId: db,
                tableId: voteCollection,
                key: "typeId",
                size: 50,
                required: true
                        }),
            tablesDB.createEnumColumn({
                            databaseId: db,
                            tableId: voteCollection,
                            key: "voteStatus",
                            elements: ["upvote", "downvote"],
                            required: true
                        }),

            tablesDB.createStringColumn({
                            databaseId: db,
                            tableId: voteCollection,
                            key: "voteById",
                            size: 50,
                            required: true
                        })
        ]);
        console.log("Vote Attributes Created");

        };
