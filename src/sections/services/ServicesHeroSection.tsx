import { Badge } from "@/components/ui/Badge";
import { Heading } from "@/components/ui/Heading";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { getSectionConfigs } from "@/lib/cms/service";

export async function ServicesHeroSection() {
  const sections = await getSectionConfigs("services");
  const config = sections.find((s) => s.id === "services-hero");

  if (config && !config.isActive) return null;

  return (
    <SectionWrapper id="services-hero" className="pt-8 sm:pt-14 md:pt-20 lg:pt-24 text-center">
      <div className="mx-auto max-w-3xl">
        <Badge variant="accent">{config?.badge || "Our Expertise"}</Badge>
        <Heading as="h1" size="h1" className="mt-4">
          {config?.heading || "Scalable solutions for modern enterprises"}
        </Heading>
        <p className="mt-5 text-base text-slate-600 sm:text-lg">
          {config?.subheading ||
            "We combine deep technical expertise with strategic thinking to build software that works at scale. Explore our core service offerings."}
        </p>
      </div>
    </SectionWrapper>
  );
}
