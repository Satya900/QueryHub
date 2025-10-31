"use client";
import React from "react";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { IconHome, IconMessage, IconWorldQuestion } from "@tabler/icons-react";
import { useAuthStore } from "@/store/Auth";
import { generateProfileUrl } from "@/utils/profileUrl";

export default function Header() {
    const { user } = useAuthStore();

    const navItems = [
        {
            name: "Home",
            link: "/",
            icon: <IconHome className="h-4 w-4 text-neutral-500 dark:text-white" />,
        },
        {
            name: "Questions",
            link: "/questions",
            icon: <IconWorldQuestion className="h-4 w-4 text-neutral-500 dark:text-white" />,
        },
    ];

    if (user) {
        try {
            const profileUrl = generateProfileUrl(user.$id, user.name);
            navItems.push({
                name: "Profile",
                link: profileUrl,
                icon: <IconMessage className="h-4 w-4 text-neutral-500 dark:text-white" />,
            });
        } catch (error) {
            console.error('Profile URL generation failed in header:', error);
            navItems.push({
                name: "Profile",
                link: `/users/${user.$id}`,
                icon: <IconMessage className="h-4 w-4 text-neutral-500 dark:text-white" />,
            });
        }
    }

    return (
        <div className="relative w-full">
            <FloatingNav navItems={navItems} />
        </div>
    );
}