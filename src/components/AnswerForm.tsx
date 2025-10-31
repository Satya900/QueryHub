"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/Auth";

interface AnswerFormProps {
    questionId: string;
    onAnswerAdded: () => void;
}

const AnswerForm = ({ questionId, onAnswerAdded }: AnswerFormProps) => {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !user) return;

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/answer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    questionId,
                    content: content.trim(),
                    authorId: user.$id,
                }),
            });

            if (response.ok) {
                setContent("");
                onAnswerAdded();
            }
        } catch (error) {
            console.error("Error submitting answer:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
                <p className="text-gray-300">Please log in to answer this question.</p>
            </div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Your Answer</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your answer here..."
                    className="w-full h-32 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                    required
                />
                <button
                    type="submit"
                    disabled={isSubmitting || !content.trim()}
                    className="bg-linear-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300"
                >
                    {isSubmitting ? "Submitting..." : "Post Answer"}
                </button>
            </form>
        </div>
    );
};

export default AnswerForm;