"use client";

import { avatars } from "@/models/client/config";
import convertDateToRelativeTime from "@/utils/relativeTime";
import { generateProfileUrl } from "@/utils/profileUrl";
import Link from "next/link";
import AnswerForm from "./AnswerForm";
import CommentForm from "./CommentForm";
import VoteButtons from "./VoteButtons";
import { useRouter } from "next/navigation";

interface QuestionDetailClientProps {
    question: any;
    answers: any;
    upvotes: any;
    downvotes: any;
    comments: any;
    author: any;
    quesId: string;
}

const QuestionDetailClient = ({
    question,
    answers,
    upvotes,
    downvotes,
    comments,
    author,
    quesId,
}: QuestionDetailClientProps) => {
    const router = useRouter();

    const handleRefresh = () => {
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">{question.title}</h1>
                            <div className="flex flex-wrap gap-6 text-sm text-gray-300">
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                    Asked {convertDateToRelativeTime(new Date(question.$createdAt))}
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                    {answers.total} Answers
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                                    {upvotes.total + downvotes.total} Votes
                                </span>
                            </div>
                        </div>
                        <Link href="/questions/ask" className="bg-linear-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                            Ask a Question
                        </Link>
                    </div>
                    <div className="w-full h-px bg-linear-to-r from-transparent via-white/20 to-transparent mb-8"></div>
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex lg:flex-col items-center lg:items-start gap-4 lg:w-24">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                                <VoteButtons
                                    typeId={quesId}
                                    type="question"
                                    initialUpvotes={upvotes.total}
                                    initialDownvotes={downvotes.total}
                                    onVoteChange={handleRefresh}
                                />
                            </div>
                        </div>
                        <div className="flex-1 space-y-6">
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                <div className="prose prose-invert max-w-none">
                                    <div className="text-gray-100 leading-relaxed whitespace-pre-wrap">{question.content}</div>
                                </div>
                                {question.imageUrl && (
                                    <div className="mt-6">
                                        <img
                                            src={question.imageUrl}
                                            alt="Question attachment"
                                            className="w-full max-w-2xl rounded-xl border border-white/20 hover:border-white/40 transition-colors cursor-pointer"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                            onClick={() => window.open(question.imageUrl, '_blank')}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {JSON.parse(question.tags || '[]').map((tag: string) => (
                                    <Link
                                        key={tag}
                                        href={`/questions?tag=${tag}`}
                                        className="inline-flex items-center px-3 py-1.5 rounded-full bg-linear-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 text-blue-200 text-sm font-medium hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-200"
                                    >
                                        #{tag}
                                    </Link>
                                ))}
                            </div>
                            <div className="flex items-center justify-end">
                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 flex items-center gap-3">
                                    <img
                                        src={avatars.getInitials({ name: author.name, width: 40, height: 40 })}
                                        alt={author.name}
                                        className="w-10 h-10 rounded-full ring-2 ring-orange-400/50"
                                    />
                                    <div>
                                        <Link
                                            href={generateProfileUrl(author.$id, author.name)}
                                            className="text-orange-400 hover:text-orange-300 font-semibold transition-colors"
                                        >
                                            {author.name}
                                        </Link>
                                        <p className="text-gray-400 text-sm">
                                            <span className="text-yellow-400 font-bold">{author.prefs.reputation}</span> reputation
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {comments.total > 0 && (
                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                        Comments ({comments.total})
                                    </h3>
                                    <div className="space-y-4">
                                        {comments.rows.map((comment: any) => (
                                            <div key={comment.$id} className="border-l-4 border-blue-400/50 pl-4 py-2">
                                                <p className="text-gray-200 mb-2">{comment.content}</p>
                                                <p className="text-xs text-gray-400">
                                                    by <span className="text-orange-400 font-medium">{comment.author.name}</span>
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <CommentForm typeId={quesId} type="question" onCommentAdded={handleRefresh} />
                        </div>
                    </div>
                    
                    {answers.total > 0 && (
                        <div className="mt-12">
                            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                                <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                                {answers.total} {answers.total === 1 ? 'Answer' : 'Answers'}
                            </h2>
                            <div className="space-y-8">
                                {answers.rows.map((answer: any) => (
                                    <div key={answer.$id} className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                                        <div className="flex flex-col lg:flex-row">
                                            <div className="lg:w-24 p-6 flex lg:flex-col items-center gap-4">
                                                <div className="bg-white/10 rounded-xl p-3 text-center">
                                                    <VoteButtons
                                                        typeId={answer.$id}
                                                        type="answer"
                                                        initialUpvotes={answer.upvotesDocuments?.total || 0}
                                                        initialDownvotes={answer.downvotesDocuments?.total || 0}
                                                        onVoteChange={handleRefresh}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1 p-6">
                                                                <div className="prose prose-invert max-w-none mb-6">
                                                    <div className="text-gray-100 leading-relaxed whitespace-pre-wrap">{answer.content}</div>
                                                    {answer.imageUrl && (
                                                        <div className="mt-4">
                                                            <img
                                                                src={answer.imageUrl}
                                                                alt="Answer attachment"
                                                                className="w-full max-w-xl rounded-lg border border-white/20 hover:border-white/40 transition-colors"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                {answer.comments?.total > 0 && (
                                                    <div className="mb-4 space-y-3">
                                                        {answer.comments.rows.map((comment: any) => (
                                                            <div key={comment.$id} className="border-l-2 border-blue-400/30 pl-3 py-1">
                                                                <p className="text-gray-300 text-sm mb-1">{comment.content}</p>
                                                                <p className="text-xs text-gray-500">
                                                                    by <span className="text-blue-400">{comment.author.name}</span>
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={avatars.getInitials({ name: answer.author.name, width: 32, height: 32 })}
                                                            alt={answer.author.name}
                                                            className="w-8 h-8 rounded-full ring-2 ring-green-400/50"
                                                        />
                                                        <div>
                                                            <p className="text-green-400 font-semibold">{answer.author.name}</p>
                                                            <p className="text-gray-400 text-sm">{answer.author.reputation} reputation</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-400 text-sm">
                                                        {convertDateToRelativeTime(new Date(answer.$createdAt))}
                                                    </p>
                                                </div>
                                                <CommentForm typeId={answer.$id} type="answer" onCommentAdded={handleRefresh} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="mt-12">
                        <AnswerForm questionId={quesId} onAnswerAdded={handleRefresh} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionDetailClient;