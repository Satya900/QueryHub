"use client";

import React from "react";
import { BorderBeam } from "./ui/border-beam";
import Link from "next/link";
import { Models } from "appwrite";
import slugify from "slugify";
import { avatars } from "@/models/client/config";
import { generateProfileUrl } from "@/utils/profileUrl";
import convertDateToRelativeTime from "@/utils/relativeTime";
import VoteButtons from "./VoteButtons";

interface QuestionDocument extends Models.Document {
    totalVotes: number;
    totalAnswers: number;
    title: string;
    tags: string[];
    author: {
        $id: string;
        name: string;
        reputation: number;
    };
}

const QuestionCard = ({ ques }: { ques: Models.Document }) => {

    const [height, setHeight] = React.useState(0);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (ref.current) {
            setHeight(ref.current.clientHeight);
        }
    }, [ref]);

    return (
     <div
            ref={ref}
            className="relative flex flex-col gap-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-6 duration-300 hover:from-white/10 hover:to-white/15 hover:border-white/20 sm:flex-row backdrop-blur-sm group"
        >
            <BorderBeam size={height} duration={12} delay={9} />
            <div className="relative shrink-0 flex sm:flex-col gap-4 sm:gap-2 text-sm">
                <div className="bg-white/10 rounded-xl px-3 py-2 text-center border border-white/20">
                    <VoteButtons
                        typeId={ques.$id}
                        type="question"
                        initialUpvotes={(ques as QuestionDocument).totalVotes}
                        initialDownvotes={0}
                    />
                </div>
                <div className="bg-white/10 rounded-xl px-3 py-2 text-center border border-white/20">
                    <p className="font-bold text-white">{(ques as QuestionDocument).totalAnswers}</p>
                    <p className="text-xs text-gray-300 uppercase tracking-wide">Answers</p>
                </div>
            </div>
            <div className="relative w-full space-y-4">
                <Link
                    href={`/questions/${ques.$id}/${slugify((ques as QuestionDocument).title)}`}
                    className="block group-hover:text-orange-400 transition-colors duration-200"
                >
                    <h2 className="text-xl font-semibold text-white leading-tight hover:text-orange-400 transition-colors">{(ques as QuestionDocument).title}</h2>
                </Link>
                <div className="flex flex-wrap gap-2 mb-4">
                    {(() => {
                        const tags = (ques as QuestionDocument).tags;
                        const tagArray = Array.isArray(tags) ? tags : (typeof tags === 'string' ? JSON.parse(tags || '[]') : []);
                        return tagArray.map((tag: string) => (
                            <Link
                                key={tag}
                                href={`/questions?tag=${tag}`}
                                className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 text-blue-200 text-xs font-medium hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-200"
                            >
                                #{tag}
                            </Link>
                        ));
                    })()}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <img
                            src={avatars.getInitials({ name: (ques as QuestionDocument).author.name, width: 32, height: 32 })}
                            alt={(ques as QuestionDocument).author.name}
                            className="rounded-full ring-2 ring-orange-400/50"
                        />
                        <div>
                            <Link
                                href={generateProfileUrl((ques as QuestionDocument).author.$id, (ques as QuestionDocument).author.name)}
                                className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
                            >
                                {(ques as QuestionDocument).author.name}
                            </Link>
                            <p className="text-gray-400 text-xs">
                                <span className="text-yellow-400 font-semibold">{(ques as QuestionDocument).author.reputation}</span> reputation
                            </p>
                        </div>
                    </div>
                    <span className="text-gray-400 text-sm">asked {convertDateToRelativeTime(new Date(ques.$createdAt))}</span>
                </div>
            </div>
        </div>
    );
}

export default QuestionCard;