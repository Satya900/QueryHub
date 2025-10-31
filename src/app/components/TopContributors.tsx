import { cn } from "@/lib/utils";

import { AnimatedList } from "@/components/ui/animated-list";
import { Models, Query } from "node-appwrite";
import { user } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import convertDateToRelativeTime from "@/utils/relativeTime";
import { avatars } from "@/models/client/config";

const Notification = ({ user, index }: { user: Models.User<UserPrefs>; index: number }) => {
    const getRankBadge = (index: number) => {
        if (index === 0) return { emoji: "🥇", color: "from-yellow-400 to-yellow-600", text: "#1" };
        if (index === 1) return { emoji: "🥈", color: "from-gray-300 to-gray-500", text: "#2" };
        if (index === 2) return { emoji: "🥉", color: "from-amber-600 to-amber-800", text: "#3" };
        return { emoji: "🏆", color: "from-blue-400 to-purple-500", text: `#${index + 1}` };
    };

    const badge = getRankBadge(index);

    return (
        <figure
            className={cn(
                "relative mx-auto min-h-fit w-full max-w-[400px] transform cursor-pointer overflow-hidden rounded-2xl p-5",
                "transition-all duration-300 ease-in-out hover:scale-[102%] hover:shadow-2xl",
                "bg-white/5 backdrop-blur-sm border border-white/10",
                "hover:bg-white/10 hover:border-white/20",
                "group"
            )}
        >
            <div className="flex flex-row items-center gap-4">
                <div className="relative">
                    <picture>
                        <img
                            src={avatars.getInitials({
                                name: user.name,
                                width: 48,
                                height: 48
                            })}
                            alt={user.name}
                            className="rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300"
                        />
                    </picture>
                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-linear-to-r ${badge.color} flex items-center justify-center text-xs font-bold text-white shadow-lg`}>
                        {badge.text}
                    </div>
                </div>
                <div className="flex flex-col overflow-hidden flex-1">
                    <figcaption className="flex flex-row items-center gap-2 text-lg font-semibold text-white group-hover:text-orange-300 transition-colors duration-300">
                        <span className="text-base sm:text-lg truncate">{user.name}</span>
                        <span className="text-2xl">{badge.emoji}</span>
                    </figcaption>
                    <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-300">Reputation:</span>
                            <span className="text-sm font-bold text-yellow-400">{user.prefs.reputation}</span>
                        </div>
                        <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                        <span className="text-xs text-gray-400">
                            {convertDateToRelativeTime(new Date(user.$updatedAt))}
                        </span>
                    </div>
                </div>
            </div>
        </figure>
    );
};

export default async function TopContributors() {
    const topUsers = await user.list<UserPrefs>([Query.limit(8)]);

    return (
        <div className="relative w-full max-w-2xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                        <span className="text-4xl">🏆</span>
                        Top Contributors
                        <span className="text-4xl">🏆</span>
                    </h2>
                    <p className="text-gray-300">Our most valued community members</p>
                    <div className="w-24 h-1 bg-linear-to-r from-orange-400 to-pink-500 rounded-full mx-auto mt-4"></div>
                </div>
                <div className="relative flex max-h-[500px] min-h-[500px] w-full flex-col overflow-hidden">
                    <AnimatedList>
                        {topUsers.users.map((user, index) => (
                            <Notification user={user} index={index} key={user.$id} />
                        ))}
                    </AnimatedList>
                </div>
            </div>
        </div>
    );
}