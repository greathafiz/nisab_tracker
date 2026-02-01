import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { generateArticleSchema, generateBreadcrumbSchema, generateFAQSchema } from "@/lib/schema";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";

interface BlogPostPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({
    params,
}: BlogPostPageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        return {
            title: "Post Not Found",
        };
    }

    return {
        title: `${post.title} | Nisab Tracker`,
        description: post.description,
        keywords: [
            ...(post.keywords?.primary ? [post.keywords.primary] : []),
            ...(post.keywords?.secondary || []),
            ...(post.keywords?.longtail || []),
            ...post.tags
        ],
        openGraph: {
            title: post.title,
            description: post.description,
            type: "article",
            publishedTime: post.publishedAt,
            authors: [post.author],
            tags: post.tags,
        },
    };
}

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const articleSchema = generateArticleSchema({
        title: post.title,
        description: post.description,
        image: post.image,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt || post.publishedAt,
        authorName: post.author,
        slug: post.slug,
    });

    const breadcrumbSchema = generateBreadcrumbSchema([
        {
            name: "Blog",
            url: "/blog",
        },
        {
            name: post.category,
            url: `/blog/${post.category}`,
        },
    ]);

    return (
        <div className="min-h-screen bg-stone-50 pb-20">
            <JsonLd data={breadcrumbSchema} />
            <JsonLd data={articleSchema} />
            {post.faqs && post.faqs.length > 0 && (
                <JsonLd data={generateFAQSchema(post.faqs)} />
            )}

            <div className="bg-white border-b border-stone-200 pt-10 pb-16">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <div className="flex items-center justify-center space-x-2 text-sm text-emerald-600 font-medium mb-6">
                        <Link href="/blog" className="hover:underline">
                            Blog
                        </Link>
                        <span>/</span>
                        <span className="text-stone-500">{post.category}</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-stone-900 mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-center space-x-4 text-stone-500 text-sm">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                                {post.author.charAt(0)}
                            </div>
                            <span className="font-medium text-stone-900">{post.author}</span>
                        </div>
                        <span>•</span>
                        <time dateTime={post.publishedAt}>
                            {format(new Date(post.publishedAt), "MMMM d, yyyy")}
                        </time>
                        <span>•</span>
                        <span>{post.readingTime} read</span>
                    </div>
                </div>
            </div>

            <article className="container mx-auto px-4 max-w-3xl -mt-8">
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 md:p-12">
                    <div className="prose prose-stone prose-lg max-w-none prose-headings:text-emerald-950 prose-a:text-emerald-600 hover:prose-a:text-emerald-700 prose-img:rounded-xl">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
                    </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-2 justify-center">
                    {post.tags.map((tag) => (
                        <span
                            key={tag}
                            className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-sm font-medium"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link href="/blog">
                        <button className="text-emerald-600 font-semibold hover:text-emerald-700 hover:cursor-pointer hover:underline">
                            ← Back to All Articles
                        </button>
                    </Link>
                </div>
            </article>

            <div className="container mx-auto px-4 max-w-3xl mt-16">
                <div className="bg-emerald-900 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-4">Ready to calculate your Zakat?</h3>
                        <p className="text-emerald-100 mb-8 max-w-lg mx-auto">Use our free calculator with real-time Nisab values to ensure accuracy.</p>
                        <Link href="/zakat-calculator" className="group">
                            <button className="bg-white text-emerald-900 px-8 py-3 rounded-lg font-bold hover:bg-emerald-50 transition-colors shadow-lg group-hover:cursor-pointer">
                                Calculate Now
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
