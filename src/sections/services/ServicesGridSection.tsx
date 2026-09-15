import { ServiceCard } from "@/components/features/ServiceCard";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { getSectionConfigs, getServices } from "@/lib/cms/service";
import type { ServiceItem } from "@/types/cms";

interface ServicesGridSectionProps {
  services?: ServiceItem[];
}

export async function ServicesGridSection({ services: propServices }: ServicesGridSectionProps) {
  const sections = await getSectionConfigs("services");
  const config = sections.find((s) => s.id === "services-grid");

  if (config && !config.isActive) return null;

  const services = propServices || (await getServices(true));

  return (
    <SectionWrapper id="services-grid">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </SectionWrapper>
  );
}
