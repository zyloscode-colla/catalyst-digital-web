import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { getSectionConfigs, getSiteSettings } from "@/lib/cms/service";

export async function HeroSection() {
  const [sections, settings] = await Promise.all([
    getSectionConfigs("home"),
    getSiteSettings(),
  ]);

  const config = sections.find((s) => s.id === "home-hero");
  if (config && !config.isActive) return null;

  return (
    <SectionWrapper id="hero" className="pt-24">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            {config?.badge || "Digital product partner"}
          </p>
          <Heading as="h1" size="display" className="mt-4">
            {config?.heading || `Build reliable digital experiences with ${settings.siteName}`}
          </Heading>
          <p className="mt-6 max-w-2xl text-lg text-slate-600">
            {config?.subheading || settings.tagline}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href="/contact" size="lg">
              Start a project
            </Button>
            <Button href="/work" variant="outline" size="lg">
              View our work
            </Button>
          </div>
        </div>
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
          <Image
            src="/hero/how-we-help.jpg"
            alt="How we help illustration"
            fill
            priority
            className="object-cover"
          />
        </div>
      </div>
    </SectionWrapper>
  );
}
