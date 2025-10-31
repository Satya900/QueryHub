"use client";

// React and UI imports
import React from "react";
import { Meteors } from "@/components/ui/meteors";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Store and utility imports
import { useAuthStore } from "@/store/Auth";
import { cn } from "@/lib/utils";
import slugify from "slugify";

// Icon and navigation imports
import { IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

// Appwrite imports and configuration
import { Models, ID } from "appwrite";
import { storage } from "@/models/client/config";
import { questionAttachmentBucket } from "@/models/name";

// Rich Text Editor component
import RTE from "./RTE";

// Placeholder confetti function for celebration effects
interface ConfettiOptions {
    particleCount: number;
    angle: number;
    spread: number;
    startVelocity: number;
    origin: { x: number; y: number };
    colors: string[];
}

const confetti = (options: ConfettiOptions) => {
    console.log('Confetti:', options);
};


/**
 * Reusable container component with meteors background effect
 * Used for form input sections with consistent styling
 */
const LabelInputContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div
            className={cn(
                "relative flex w-full flex-col space-y-2 overflow-hidden rounded-xl border border-white/20 bg-slate-950 p-4",
                className
            )}
        >
            {/* Animated meteors background effect */}
            <Meteors number={30} />
            {children}
        </div>
    );
};


/**
 * QuestionForm component for creating and editing questions
 * @param question - Optional existing question for editing mode
 */
const QuestionForm = ({question}: {question ?: Models.Document}) => {
    // Get current user from auth store
    const { user } = useAuthStore();
    
    // State for individual tag input
    const [tag, setTag] = React.useState("");
    
    // Router for navigation after form submission
    const router = useRouter();

    // Define question type for better type safety
    interface QuestionData {
        title?: string;
        content?: string;
        tags?: string[];
        attachmentId?: string;
    }

    // Main form data state - initialized with existing question data if editing
    const [formData, setFormData] = React.useState({
        title: String((question as QuestionData)?.title || ""),           // Question title
        content: String((question as QuestionData)?.content || ""),       // Question content/description
        authorId: user?.$id || "",                               // Current user's ID
        tags: new Set(((question as QuestionData)?.tags || []) as string[]), // Tags as Set for uniqueness
        attachment: null as File | null,                          // Optional file attachment
    });

    // Update authorId when user is loaded
    React.useEffect(() => {
        if (user?.$id && !formData.authorId) {
            setFormData(prev => ({ ...prev, authorId: user.$id }));
        }
    }, [user?.$id, formData.authorId]);

    // Loading state for form submission
    const [loading, setLoading] = React.useState(false);
    
    // Error message state
    const [error, setError] = React.useState("");

    /**
     * Loads confetti animation for celebration after successful form submission
     * Creates animated confetti from both sides of the screen
     */
    const loadConfetti = () => {
        const timeInMS = 3000; // Animation duration: 3 seconds
        const end = Date.now() + timeInMS;
        const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"]; // Colorful palette

        // Animation frame function for continuous confetti
        const frame = () => {
            if (Date.now() > end) return; // Stop after duration

            // Left side confetti
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                startVelocity: 60,
                origin: { x: 0, y: 0.5 }, // Left side origin
                colors: colors,
            });
            
            // Right side confetti
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                startVelocity: 60,
                origin: { x: 1, y: 0.5 }, // Right side origin
                colors: colors,
            });

            // Continue animation
            requestAnimationFrame(frame);
        };

        frame(); // Start animation
    }

    /**
     * Creates a new question via API
     * Handles file upload and API call
     */
    const create = async () => {
        let imageUrl = "";
        
        // Upload image to Cloudinary if attachment exists
        if (formData.attachment) {
            const uploadFormData = new FormData();
            uploadFormData.append('file', formData.attachment);
            
            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData
            });
            
            if (!uploadResponse.ok) {
                throw new Error('Failed to upload image');
            }
            
            const uploadResult = await uploadResponse.json();
            imageUrl = uploadResult.imageUrl;
        }

        // Create new question via API
        const response = await fetch('/api/question', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: formData.title,
                content: formData.content,
                authorId: formData.authorId,
                tags: Array.from(formData.tags),
                imageUrl: imageUrl,
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to create question');
        }

        const result = await response.json();
        
        // Celebrate successful creation
        loadConfetti();

        return result.data;
    };
    /**
     * Updates an existing question via API
     * Handles attachment replacement if new file is provided
     */
    const update = async () => {
        if (!question) throw new Error("Please provide a question");

        let imageUrl = (question as any).imageUrl || "";
        
        // Upload new image if attachment exists
        if (formData.attachment) {
            const uploadFormData = new FormData();
            uploadFormData.append('file', formData.attachment);
            
            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData
            });
            
            if (!uploadResponse.ok) {
                throw new Error('Failed to upload image');
            }
            
            const uploadResult = await uploadResponse.json();
            imageUrl = uploadResult.imageUrl;
        }

        // Update question via API
        const response = await fetch('/api/question', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                questionId: question.$id,
                title: formData.title,
                content: formData.content,
                tags: Array.from(formData.tags),
                imageUrl: imageUrl
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to update question');
        }

        const result = await response.json();
        return result.data;
    };

    /**
     * Handles form submission for both create and update operations
     * Validates form data and navigates to question page on success
     */
    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Validate required fields (attachment is optional for updates)
        if (!formData.title || !formData.content || !formData.authorId) {
            setError(() => "Please fill out all fields");
            return;
        }

        // Set loading state and clear errors
        setLoading(() => true);
        setError(() => "");

        try {
            // Call appropriate function based on mode (edit vs create)
            const response = question ? await update() : await create();

            // Navigate to the question page with SEO-friendly URL
            router.push(`/questions/${response.$id}/${slugify(formData.title)}`);
        } catch (error) {
            // Handle and display errors
            setError(() => error instanceof Error ? error.message : "An error occurred");
        }

        // Reset loading state
        setLoading(() => false);
    }

    // TODO: Add form UI implementation
    return (
        <form className="space-y-4" onSubmit={submit}>

            {error && (
                <LabelInputContainer>
                    <div className="text-center">
                        <span className="text-red-500">{error}</span>
                    </div>
                </LabelInputContainer>
            )}

            <LabelInputContainer>
                <Label htmlFor="title">
                    Title Address
                    <br />
                    <small>
                        Be specific and imagine you&apos;re asking a question to another person.
                    </small>
                </Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="e.g. Is there an R function for finding the index of an element in a vector?"
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
            </LabelInputContainer>
            <LabelInputContainer>
                <Label htmlFor="content">
                    What are the details of your problem?
                    <br />
                    <small>
                        Introduce the problem and expand on what you put in the title. Minimum 20
                        characters.
                    </small>
                </Label>
                <RTE
                    value={formData.content}
                    onChange={value => setFormData(prev => ({ ...prev, content: value || "" }))}
                />
            </LabelInputContainer>
            <LabelInputContainer>
                <Label htmlFor="image">
                    Image
                    <br />
                    <small>
                        Add image to your question to make it more clear and easier to understand.
                    </small>
                </Label>
                <Input
                    id="image"
                    name="image"
                    accept="image/*"
                    placeholder="e.g. Is there an R function for finding the index of an element in a vector?"
                    type="file"
                    onChange={e => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        setFormData(prev => ({
                            ...prev,
                            attachment: files[0],
                        }));
                    }}
                />
            </LabelInputContainer>
            <LabelInputContainer>
                <Label htmlFor="tag">
                    Tags
                    <br />
                    <small>
                        Add tags to describe what your question is about. Start typing to see
                        suggestions.
                    </small>
                </Label>
                <div className="flex w-full gap-4">
                    <div className="w-full">
                        <Input
                            id="tag"
                            name="tag"
                            placeholder="e.g. (java c objective-c)"
                            type="text"
                            value={tag}
                            onChange={e => setTag(() => e.target.value)}
                        />
                    </div>
                    <button
                        className="relative shrink-0 rounded-full border border-slate-600 bg-slate-700 px-8 py-2 text-sm text-white transition duration-200 hover:shadow-2xl hover:shadow-white/10"
                        type="button"
                        title="Add tag"
                        onClick={() => {
                            if (tag.length === 0) return;
                            setFormData(prev => ({
                                ...prev,
                                tags: new Set([...Array.from(prev.tags), tag]),
                            }));
                            setTag(() => "");
                        }}
                    >
                        <div className="absolute inset-x-0 -top-px mx-auto h-px w-1/2 bg-linear-to-r from-transparent via-teal-500 to-transparent shadow-2xl" />
                        <span className="relative z-20">Add</span>
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {Array.from(formData.tags).map((tag, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="group relative inline-block rounded-full bg-slate-800 p-px text-xs font-semibold leading-6 text-white no-underline shadow-2xl shadow-zinc-900">
                                <span className="absolute inset-0 overflow-hidden rounded-full">
                                    <span className="absolute inset-0 rounded-full bg-[radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                </span>
                                <div className="relative z-10 flex items-center space-x-2 rounded-full bg-zinc-950 px-4 py-0.5 ring-1 ring-white/10">
                                    <button
                                        title="Remove tag"
                                        onClick={() => {
                                            setFormData(prev => ({
                                                ...prev,
                                                tags: new Set(
                                                    Array.from(prev.tags).filter(t => t !== tag)
                                                ),
                                            }));
                                        }}
                                        type="button"
                                    >
                                        <IconX size={12} />
                                    </button>
                                    <span>{tag}</span>
                                </div>
                                <span className="absolute bottom-0 left-4.5 h-px w-[calc(100%-2.25rem)] bg-linear-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                            </div>
                        </div>
                    ))}
                </div>
            </LabelInputContainer>
            
            <button
                className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-size-[200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                type="submit"
                title="Submit question"
                disabled={loading}
            >
                {question ? "Update" : "Publish"}
            </button>
        </form>
    )
};

export default QuestionForm;
