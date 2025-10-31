import React from "react";
import HeroParallax from "@/components/ui/hero-parallax"
import HeroSectionHeader from "../components/HeroSectionHeader";
import { databases } from "@/models/server/config";
import { db, questionCollection } from "@/models/name";
import { Query } from "node-appwrite";
import slugify from "slugify";

export default async function HeroSection() {
    let questions;
    try {
        questions = await databases.listDocuments(
            db,
            questionCollection,
            [
                Query.orderDesc("$createdAt"),
                Query.limit(15),
            ]
        );
    } catch (error) {
        console.error("Error fetching questions:", error);
        questions = { documents: [] };
    }

    const questionProducts = questions.documents.map((q: any, index: number) => ({
        title: q.title,
        link: `/questions/${q.$id}/${slugify(q.title)}`,
        thumbnail: q.imageUrl || `https://picsum.photos/500/300?random=${index + 1}`
    }));

    return (
        <>
            <HeroSectionHeader />
            <HeroParallax products={questionProducts} />
        </>
    );
}