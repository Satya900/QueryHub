"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import React from "react";

const Navbar = () => {
    const { userId, userSlug } = useParams();
    const pathname = usePathname();

    const items = [
        {
            name: "Summary",
            href: `/users/${userId}/${userSlug}`,
        },
        {
            name: "Questions",
            href: `/users/${userId}/${userSlug}/questions`,
        },
        {
            name: "Answers",
            href: `/users/${userId}/${userSlug}/answers`,
        },
        {
            name: "Votes",
            href: `/users/${userId}/${userSlug}/votes`,
        },
    ];

    return (
        <ul className="flex w-full shrink-0 gap-1 overflow-auto rounded-lg border border-white/20 bg-white/10 p-3 sm:w-40 sm:flex-col">
            {items.map(item => (
                <li key={item.name}>
                    <Link
                        href={item.href}
                        className={`block w-full rounded-full px-3 py-1.5 text-sm font-medium duration-200 ${
                            pathname === item.href ? "bg-orange-500 text-white" : "text-gray-300 hover:bg-white/20 hover:text-white"
                        }`}
                    >
                        {item.name}
                    </Link>
                </li>
            ))}
        </ul>
    );
};

export default Navbar;