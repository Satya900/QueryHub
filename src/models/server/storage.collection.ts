/* eslint-disable @typescript-eslint/no-unused-vars */
import {Permission, TablesDB} from "node-appwrite"

import {db, questionAttachmentBucket} from "../name"
import {storage} from "./config"

// const tablesDB = new TablesDB(client);

export default async function getOrCreateQuestionAttachmentBucket(){        
    try {
        await storage.getBucket({ bucketId: questionAttachmentBucket })
        console.log("storage connected");
        
        // Update bucket with correct extensions
        try {
            await storage.updateBucket({
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
                maximumFileSize: 10485760,
                allowedFileExtensions: [],
            })
            console.log("Storage Updated");
        } catch (updateError) {
            console.log("error updating bucket", updateError);
        }
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
                allowedFileExtensions: [],  

            })

            console.log("Storage Created");
            console.log("Storage Connected");
        } catch (error) {
            console.log("error in creating question attachment bucket", error);
        }
    }
}