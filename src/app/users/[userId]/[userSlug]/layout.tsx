import { avatars } from "@/models/client/config";
import { user } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import convertDateToRelativeTime from "@/utils/relativeTime";
import React from "react";
import EditButton from "../[userSlug]/EditButton";
import Navbar from "../[userSlug]/Navbar";
import { IconClockFilled, IconUserFilled } from "@tabler/icons-react";

const Layout = async ({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ userId: string; userSlug: string }>;
}) => {
    const { userId } = await params;
    let userData;
    try {
        userData = await user.get<UserPrefs>(userId);
    } catch (error) {
        console.error("Error fetching user data:", error);
        userData = {
            $id: userId,
            name: "Unknown User",
            email: "unknown@example.com",
            $createdAt: new Date().toISOString(),
            $updatedAt: new Date().toISOString(),
            prefs: { reputation: 0 }
        };
    }

    return (
        <div className="container mx-auto space-y-4 px-4 pb-20 pt-32">
            <div className="flex flex-col gap-4 sm:flex-row">
                <div className="w-40 shrink-0">
                    <picture className="block w-full">
                        <img
                            src={avatars.getInitials({ name: userData.name, width: 200, height: 200 })}
                            alt={userData.name}
                            className="h-full w-full rounded-xl object-cover"
                        />
                    </picture>
                </div>
                <div className="w-full">
                    <div className="flex items-start justify-between">
                        <div className="block space-y-0.5">
                            <h1 className="text-3xl font-bold text-white">{userData.name}</h1>
                            <p className="text-lg text-gray-300">{userData.email}</p>
                            <p className="flex items-center gap-1 text-sm font-bold text-gray-400">
                                <IconUserFilled className="w-4 shrink-0" /> Dropped{" "}
                                {convertDateToRelativeTime(new Date(userData.$createdAt))},
                            </p>
                            <p className="flex items-center gap-1 text-sm text-gray-400">
                                <IconClockFilled className="w-4 shrink-0" /> Last activity&nbsp;
                                {convertDateToRelativeTime(new Date(userData.$updatedAt))}
                            </p>
                        </div>
                        <div className="shrink-0">
                            <EditButton />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
                <Navbar />
                <div className="w-full">{children}</div>
            </div>
        </div>
    );
};

export default Layout;