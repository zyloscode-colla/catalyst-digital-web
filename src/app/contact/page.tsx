import { ContactDetailsSection } from "@/sections/contact/ContactDetailsSection";
import { ContactFormSection } from "@/sections/contact/ContactFormSection";
import { ContactHeroSection } from "@/sections/contact/ContactHeroSection";
import { FaqSection } from "@/sections/contact/FaqSection";
import { OfficeSection } from "@/sections/contact/OfficeSection";
import { TrustSection } from "@/sections/contact/TrustSection";
import { PageOfflineNotice } from "@/components/layout/PageOfflineNotice";
import { getPageConfig } from "@/lib/cms/service";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const pageConfig = await getPageConfig("contact");

  if (pageConfig && !pageConfig.isActive) {
    return (
      <PageOfflineNotice
        pageTitle={pageConfig.title || "Contact"}
        offlineMessage={pageConfig.offlineMessage}
      />
    );
  }

  return (
    <>
      <ContactHeroSection />
      <ContactFormSection />
      <ContactDetailsSection />
      <OfficeSection />
      <TrustSection />
      <FaqSection />
    </>
  );
}
