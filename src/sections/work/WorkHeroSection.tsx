import { Badge } from "@/components/ui/Badge";
import { Heading } from "@/components/ui/Heading";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { getSectionConfigs } from "@/lib/cms/service";

export async function WorkHeroSection() {
  const sections = await getSectionConfigs("work");
  const config = sections.find((s) => s.id === "work-hero");

  if (config && !config.isActive) return null;

  return (
    <SectionWrapper id="work-hero" className="pt-24 text-center">
      <div className="mx-auto max-w-3xl">
        <Badge variant="accent">{config?.badge || "Case Studies"}</Badge>
        <Heading as="h1" size="h1" className="mt-4">
          {config?.heading || "Our impact in action"}
        </Heading>
        <p className="mt-5 text-base text-slate-600 sm:text-lg">
          {config?.subheading ||
            "We do not just ship code. We solve business challenges with engineering excellence and measurable outcomes."}
        </p>
      </div>
    </SectionWrapper>
  );
}
