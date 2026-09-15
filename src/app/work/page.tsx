import { CTABannerSection } from "@/sections/_shared/CTABannerSection";
import { CaseStudySection } from "@/sections/work/CaseStudySection";
import { ProjectsFilterSection } from "@/sections/work/ProjectsFilterSection";
import { ProjectsGridSection } from "@/sections/work/ProjectsGridSection";
import { ResultsSection } from "@/sections/work/ResultsSection";
import { WorkHeroSection } from "@/sections/work/WorkHeroSection";
import { PageOfflineNotice } from "@/components/layout/PageOfflineNotice";
import { getPageConfig, getProjects } from "@/lib/cms/service";

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const pageConfig = await getPageConfig("work");

  if (pageConfig && !pageConfig.isActive) {
    return (
      <PageOfflineNotice
        pageTitle={pageConfig.title || "Work"}
        offlineMessage={pageConfig.offlineMessage}
      />
    );
  }

  const projects = await getProjects(true);

  return (
    <>
      <WorkHeroSection />
      <ProjectsFilterSection />
      <ProjectsGridSection projects={projects} />
      <CaseStudySection />
      <ResultsSection />
      <CTABannerSection />
    </>
  );
}
