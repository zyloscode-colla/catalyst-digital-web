import { CTABannerSection } from "@/sections/_shared/CTABannerSection";
import { AboutHeroSection } from "@/sections/about/AboutHeroSection";
import { StatsSection } from "@/sections/about/StatsSection";
import { TeamSection } from "@/sections/about/TeamSection";
import { TimelineSection } from "@/sections/about/TimelineSection";
import { ValuesSection } from "@/sections/about/ValuesSection";
import { PageOfflineNotice } from "@/components/layout/PageOfflineNotice";
import { getPageConfig } from "@/lib/cms/service";

export default async function AboutPage() {
  const pageConfig = await getPageConfig("about");

  if (pageConfig && !pageConfig.isActive) {
    return (
      <PageOfflineNotice
        pageTitle={pageConfig.title || "About"}
        offlineMessage={pageConfig.offlineMessage}
      />
    );
  }

  return (
    <>
      <AboutHeroSection />
      <TimelineSection />
      <TeamSection />
      <ValuesSection />
      <StatsSection />
      <CTABannerSection />
    </>
  );
}
