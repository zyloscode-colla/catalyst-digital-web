import { BlogCard } from "@/components/features/BlogCard";
import { Heading } from "@/components/ui/Heading";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { getBlogPosts, getSectionConfigs } from "@/lib/cms/service";
import type { BlogPostItem } from "@/types/cms";

interface FeaturedPostSectionProps {
  posts?: BlogPostItem[];
}

export async function FeaturedPostSection({ posts: propPosts }: FeaturedPostSectionProps) {
  const sections = await getSectionConfigs("blog");
  const config = sections.find((s) => s.id === "blog-featured");

  if (config && !config.isActive) return null;

  const allPosts = propPosts || (await getBlogPosts(true));
  const featuredPost = allPosts.find((p) => p.isFeatured) || allPosts[0];

  return (
    <SectionWrapper id="featured-post" className="pt-6">
      {featuredPost ? (
        <div>
          <Heading as="h2" className="mb-6">
            Featured article
          </Heading>
          <BlogCard post={featuredPost} />
        </div>
      ) : (
        <article className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <Heading as="h2" size="h3">
            No featured blog available
          </Heading>
          <p className="mt-3 text-sm text-slate-600">
            Publish your first post to automatically show it as the featured article here.
          </p>
        </article>
      )}
    </SectionWrapper>
  );
}
