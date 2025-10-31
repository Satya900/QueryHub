import QuestionForm from "@/components/QuestionForm";

export default function AskQuestionPage() {
    return (
        <div className="container mx-auto px-4 pb-20 pt-36">
            <div className="mb-10">
                <h1 className="text-3xl font-bold">Ask a Question</h1>
                <p className="mt-2 text-gray-400">
                    Get help from the community by asking a detailed question.
                </p>
            </div>
            <div className="max-w-4xl">
                <QuestionForm />
            </div>
        </div>
    );
}