import { CTABannerSection } from "@/sections/_shared/CTABannerSection";
import { ServicesGridSection } from "@/sections/services/ServicesGridSection";
import { ServicesHeroSection } from "@/sections/services/ServicesHeroSection";
import { ServicesInActionSection } from "@/sections/services/ServicesInActionSection";
import { PageOfflineNotice } from "@/components/layout/PageOfflineNotice";
import { getPageConfig, getServices } from "@/lib/cms/service";

export default async function ServicesPage() {
  const pageConfig = await getPageConfig("services");

  // Page-level active toggle check
  if (pageConfig && !pageConfig.isActive) {
    return (
      <PageOfflineNotice
        pageTitle={pageConfig.title || "Services"}
        offlineMessage={pageConfig.offlineMessage}
      />
    );
  }

  const services = await getServices(true);

  return (
    <>
      <ServicesHeroSection />
      <ServicesGridSection services={services} />
      <ServicesInActionSection />
      <CTABannerSection />
    </>
  );
}
