import { CTABannerSection } from "@/sections/_shared/CTABannerSection";
import { BlogHeroSection } from "@/sections/blog/BlogHeroSection";
import { BlogSidebarSection } from "@/sections/blog/BlogSidebarSection";
import { FeaturedPostSection } from "@/sections/blog/FeaturedPostSection";
import { LoadMoreSection } from "@/sections/blog/LoadMoreSection";
import { PostsGridSection } from "@/sections/blog/PostsGridSection";
import { PageOfflineNotice } from "@/components/layout/PageOfflineNotice";
import { getBlogPosts, getPageConfig } from "@/lib/cms/service";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const pageConfig = await getPageConfig("blog");

  if (pageConfig && !pageConfig.isActive) {
    return (
      <PageOfflineNotice
        pageTitle={pageConfig.title || "Blog"}
        offlineMessage={pageConfig.offlineMessage}
      />
    );
  }

  const posts = await getBlogPosts(true);

  return (
    <>
      <BlogHeroSection />
      <FeaturedPostSection posts={posts} />
      <PostsGridSection posts={posts} />
      <BlogSidebarSection />
      <LoadMoreSection />
      <CTABannerSection />
    </>
  );
}
