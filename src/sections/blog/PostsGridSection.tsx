import { BlogCard } from "@/components/features/BlogCard";
import { Heading } from "@/components/ui/Heading";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { getBlogPosts, getSectionConfigs } from "@/lib/cms/service";
import type { BlogPostItem } from "@/types/cms";

interface PostsGridSectionProps {
  posts?: BlogPostItem[];
}

export async function PostsGridSection({ posts: propPosts }: PostsGridSectionProps) {
  const sections = await getSectionConfigs("blog");
  const config = sections.find((s) => s.id === "blog-posts-grid");

  if (config && !config.isActive) return null;

  const allPosts = propPosts || (await getBlogPosts(true));
  const remainingPosts = allPosts.slice(1);

  return (
    <SectionWrapper id="posts-grid" className="pt-6">
      <Heading as="h2">{config?.heading || "Recent articles"}</Heading>
      {remainingPosts.length > 0 ? (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {remainingPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <article className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-base font-medium text-slate-900">No blogs available yet.</p>
          <p className="mt-2 text-sm text-slate-600">Once posts are added, they will appear here automatically.</p>
        </article>
      )}
    </SectionWrapper>
  );
}
