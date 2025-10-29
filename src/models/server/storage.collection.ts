/* eslint-disable @typescript-eslint/no-unused-vars */
import {Permission, TablesDB} from "node-appwrite"

import {db, questionAttachmentBucket} from "../name"
import {storage} from "./config"

// const tablesDB = new TablesDB(client);

export default async function getOrCreateQuestionAttachmentBucket(){        
    try {
        await storage.getBucket({ bucketId: questionAttachmentBucket })
        console.log("storage connected");
    } catch (error) {
        try {
            await storage.createBucket({
                bucketId: questionAttachmentBucket,
                name: "Question Attachments",
                permissions: [
                    Permission.create("users"),
                    Permission.read("any"),
                    Permission.read("users"),
                    Permission.update("users"),
                    Permission.delete("users"),
                ],
                fileSecurity: false,
                maximumFileSize: 10485760, // 10 MB
                allowedFileExtensions:[".png", ".jpg", ".jpeg", ".gif", ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".txt", ".zip", ".rar"],  

            })

            console.log("Storage Created");
            console.log("Storage Connected");
        } catch (error) {
            console.log("error in creating question attachment bucket", error);
        }
    }
}