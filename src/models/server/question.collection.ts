import { Permission, TablesDB, IndexType } from "node-appwrite"
import { db, questionCollection } from "../name"
import { client } from "./config"

const tablesDB = new TablesDB(client)

export default async function createQuestionCollection() {
  try {
    // 1. Create the Questions Table
    await tablesDB.createTable({
      databaseId: db,
      tableId: questionCollection,
      name: questionCollection,
      permissions: [
        Permission.read("any"),       // anyone can read
        Permission.create("users"),   // only logged-in users can create
        Permission.update("users"),   // only logged-in users can update
        Permission.delete("users"),   // only logged-in users can delete
      ],
    })

    console.log("✅ Question Table created")

    // 2. Create Columns
    await Promise.all([
      tablesDB.createStringColumn({
        databaseId: db,
        tableId: questionCollection,
        key: "title",
        size: 255,
        required: true,
      }),
      tablesDB.createStringColumn({
        databaseId: db,
        tableId: questionCollection,
        key: "content",
        size: 10000,
        required: true,
      }),
      tablesDB.createStringColumn({
        databaseId: db,
        tableId: questionCollection,
        key: "authorId",
        size: 255,
        required: true,
      }),
      tablesDB.createStringColumn({
        databaseId: db,
        tableId: questionCollection,
        key: "tags",
        size: 255, // bumped a bit, or use JSON column if multiple tags
        required: false,
      }),
      tablesDB.createStringColumn({
        databaseId: db,
        tableId: questionCollection,
        key: "attachmentId",
        size: 255,
        required: false,
      }),
    ])

    console.log("✅ Columns created successfully");
    await new Promise((res) => setTimeout(res, 10000)); // wait 10 seconds for columns to be ready

    // 3. Create Indexes
    await Promise.all([
      tablesDB.createIndex({
        databaseId: db,
        tableId: questionCollection,
        key: "title_index",
        type: IndexType.Fulltext,
        columns: ["title"],
      }),
      tablesDB.createIndex({
        databaseId: db,
        tableId: questionCollection,
        key: "content_index",
        type: IndexType.Fulltext,
        columns: ["content"],
      }),
      tablesDB.createIndex({
        databaseId: db,
        tableId: questionCollection,
        key: "author_index",
        type: IndexType.Key,
        columns: ["authorId"],
      }),
      tablesDB.createIndex({
        databaseId: db,
        tableId: questionCollection,
        key: "tags_index",
        type: IndexType.Fulltext,
        columns: ["tags"],
      }),
    ])

    console.log("✅ Indexes created successfully")

  } catch (error) {
    console.error("❌ Failed to create Question Collection:", error)
    // optional: rethrow or handle gracefully depending on context
  }
}
