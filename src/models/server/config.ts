import env from "@/app/env";

import {Avatars, Client, Databases, Users, Storage} from "node-appwrite";
const client = new Client();

client
    .setEndpoint(env.appwrite.endpoint) // Your API Endpoint
    .setProject(env.appwrite.projectId) // Your project ID
    .setKey(env.appwrite.apiKey) // Your secret API key
;

const databases = new Databases(client);
const avatars = new Avatars(client);
const storage = new Storage(client);
const user = new Users(client)

export {
    client, databases, avatars, storage, user
}