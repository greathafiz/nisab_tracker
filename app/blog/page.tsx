import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { format } from "date-fns";
import { generateWebPageSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Image from "next/image";

export const metadata = {
    title: "Islamic Finance Blog | Nisab Tracker",
    description:
        "Learn about Zakat, Nisab, and Islamic finance. Expert guides, tutorials, and answers to your questions about Zakat calculation.",
};

export default function BlogPage() {
    const posts = getAllPosts();

    return (
        <div className="min-h-screen bg-stone-50">
            <JsonLd
                data={generateWebPageSchema(
                    "Islamic Finance Blog | Nisab Tracker",
                    "Learn about Zakat, Nisab, and Islamic finance. Expert guides, tutorials, and answers to your questions about Zakat calculation.",
                    "https://nisabtracker.com/blog"
                )}
            />

            <div className="bg-emerald-900 text-white py-16 md:py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Islamic Finance Insights
                    </h1>
                    <p className="text-xl text-emerald-100 max-w-2xl mx-auto leading-relaxed">
                        Expert guides on Zakat, Nisab, and managing your wealth according to
                        Islamic principles.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-stone-100 flex flex-col h-full"
                            >
                                <div className="h-48 bg-emerald-100 relative overflow-hidden">
                                    {post.image ? (
                                        <div className="absolute inset-0 bg-emerald-50 flex items-center justify-center text-emerald-200">
                                            <Image src={post.image} alt={post.title} fill className="object-cover" />
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 bg-emerald-50 flex items-center justify-center text-emerald-200">
                                            <span className="text-6xl opacity-20">📝</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                                        {post.category}
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center text-stone-500 text-xs mb-3 space-x-2">
                                        <span>{format(new Date(post.publishedAt), "MMM d, yyyy")}</span>
                                        <span>•</span>
                                        <span>{post.readingTime} read</span>
                                    </div>

                                    <h2 className="text-xl font-bold text-stone-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2">
                                        {post.title}
                                    </h2>

                                    <p className="text-stone-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                        {post.description}
                                    </p>

                                    <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs text-emerald-700 font-bold">
                                                {post.author.charAt(0)}
                                            </div>
                                            <span className="text-xs text-stone-600 font-medium">{post.author}</span>
                                        </div>
                                        <span className="text-emerald-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                                            Read Article →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="inline-block p-4 rounded-full bg-stone-100 mb-4">
                            <span className="text-4xl">✍️</span>
                        </div>
                        <h3 className="text-2xl font-bold text-stone-900 mb-2">
                            No articles yet
                        </h3>
                        <p className="text-stone-600">
                            Check back soon for our latest guides and updates.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
