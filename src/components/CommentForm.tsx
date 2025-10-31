"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/Auth";

interface CommentFormProps {
    typeId: string;
    type: "question" | "answer";
    onCommentAdded: () => void;
}

const CommentForm = ({ typeId, type, onCommentAdded }: CommentFormProps) => {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const { user } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !user) return;

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/comment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    typeId,
                    type,
                    content: content.trim(),
                    authorId: user.$id,
                }),
            });

            if (response.ok) {
                setContent("");
                setShowForm(false);
                onCommentAdded();
            }
        } catch (error) {
            console.error("Error submitting comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="mt-4">
            {!showForm ? (
                <button
                    onClick={() => setShowForm(true)}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                    Add a comment
                </button>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full h-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none text-sm"
                        required
                    />
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={isSubmitting || !content.trim()}
                            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
                        >
                            {isSubmitting ? "Posting..." : "Post Comment"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowForm(false);
                                setContent("");
                            }}
                            className="text-gray-400 hover:text-gray-300 px-4 py-2 text-sm transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default CommentForm;