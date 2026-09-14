import { CTABannerSection } from "@/sections/_shared/CTABannerSection";
import { ClientsSection } from "@/sections/home/ClientsSection";
import { HeroSection } from "@/sections/home/HeroSection";
import { ServicesOverviewSection } from "@/sections/home/ServicesOverviewSection";
import { StatsSection } from "@/sections/home/StatsSection";
import { TeamPreviewSection } from "@/sections/home/TeamPreviewSection";
import { PageOfflineNotice } from "@/components/layout/PageOfflineNotice";
import { getPageConfig } from "@/lib/cms/service";

export default async function HomePage() {
  const pageConfig = await getPageConfig("home");

  if (pageConfig && !pageConfig.isActive) {
    return (
      <PageOfflineNotice
        pageTitle={pageConfig.title || "Home"}
        offlineMessage={pageConfig.offlineMessage}
      />
    );
  }

  return (
    <>
      <HeroSection />
      <StatsSection />
      <ServicesOverviewSection />
      <TeamPreviewSection />
      <ClientsSection />
      <CTABannerSection />
    </>
  );
}