"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/Auth";
import { IconChevronUp, IconChevronDown } from "@tabler/icons-react";

interface VoteButtonsProps {
    typeId: string;
    type: "question" | "answer";
    initialUpvotes: number;
    initialDownvotes: number;
    onVoteChange?: () => void;
}

type UserVoteState = "upvote" | "downvote" | null;

const VoteButtons = ({ typeId, type, initialUpvotes, initialDownvotes, onVoteChange }: VoteButtonsProps) => {
    const [score, setScore] = useState(initialUpvotes - initialDownvotes);
    const [userVote, setUserVote] = useState<UserVoteState>(null);
    const [isVoting, setIsVoting] = useState(false);
    const { user } = useAuthStore();

    // Fetch user's current vote status
    useEffect(() => {
        if (user) {
            fetchUserVote();
        }
    }, [user, typeId]);

    const fetchUserVote = async () => {
        try {
            const response = await fetch(`/api/vote/status?typeId=${typeId}&type=${type}&userId=${user?.$id}`);
            if (response.ok) {
                const data = await response.json();
                setUserVote(data.userVote);
            }
        } catch (error) {
            console.error("Error fetching user vote:", error);
        }
    };

    const handleVote = async (voteType: "upvote" | "downvote") => {
        if (!user || isVoting) return;

        setIsVoting(true);
        try {
            const response = await fetch("/api/vote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    typeId,
                    type,
                    voteType,
                    authorId: user.$id,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setScore(data.newScore);
                setUserVote(data.userVote);
                onVoteChange?.();
            }
        } catch (error) {
            console.error("Error voting:", error);
        } finally {
            setIsVoting(false);
        }
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center gap-2">
                <IconChevronUp className="w-6 h-6 text-gray-500" />
                <div className="text-2xl font-bold text-white">{score}</div>
                <IconChevronDown className="w-6 h-6 text-gray-500" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <button
                onClick={() => handleVote("upvote")}
                disabled={isVoting}
                className={`p-2 rounded-lg border transition-all duration-200 disabled:opacity-50 ${
                    userVote === "upvote"
                        ? "bg-green-500/30 border-green-400 text-green-400"
                        : "bg-white/10 hover:bg-green-500/20 border-white/20 hover:border-green-400/50 text-gray-300 hover:text-green-400"
                }`}
            >
                <IconChevronUp className="w-6 h-6" />
            </button>
            <div className={`text-2xl font-bold ${
                score > 0 ? "text-green-400" : score < 0 ? "text-red-400" : "text-white"
            }`}>
                {score}
            </div>
            <button
                onClick={() => handleVote("downvote")}
                disabled={isVoting}
                className={`p-2 rounded-lg border transition-all duration-200 disabled:opacity-50 ${
                    userVote === "downvote"
                        ? "bg-red-500/30 border-red-400 text-red-400"
                        : "bg-white/10 hover:bg-red-500/20 border-white/20 hover:border-red-400/50 text-gray-300 hover:text-red-400"
                }`}
            >
                <IconChevronDown className="w-6 h-6" />
            </button>
        </div>
    );
};

export default VoteButtons;