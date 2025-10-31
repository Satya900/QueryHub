import { redirect } from 'next/navigation';
import { client } from "@/models/server/config";
import { db, questionCollection } from "@/models/name";
import { TablesDB } from "node-appwrite";
import slugify from "slugify";

const tablesDB = new TablesDB(client);

const Page = async ({ params }: { params: Promise<{ quesId: string }> }) => {
    const { quesId } = await params;
    
    try {
        const question = await tablesDB.getRow({
            databaseId: db,
            tableId: questionCollection,
            rowId: quesId
        });
        
        const slug = slugify(question.title, { lower: true });
        redirect(`/questions/${quesId}/${slug}`);
    } catch (error) {
        redirect('/questions');
    }
};

export default Page;