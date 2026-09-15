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
    <SectionWrapper id="hero" className="pt-8 sm:pt-14 md:pt-20 lg:pt-24">
      <div className="grid gap-8 sm:gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-indigo-600">
            {config?.badge || "Digital product partner"}
          </p>
          <Heading as="h1" size="display" className="mt-3 sm:mt-4">
            {config?.heading || `Build reliable digital experiences with ${settings.siteName}`}
          </Heading>
          <p className="mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed">
            {config?.subheading || settings.tagline}
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Button href="/contact" size="lg" className="w-full sm:w-auto">
              Start a project
            </Button>
            <Button href="/work" variant="outline" size="lg" className="w-full sm:w-auto">
              View our work
            </Button>
          </div>
        </div>
        <div className="relative aspect-[16/10] sm:aspect-[4/3] lg:aspect-square w-full max-w-lg mx-auto lg:max-w-none overflow-hidden rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
          <Image
            src="/hero/how-we-help.jpg"
            alt="How we help illustration"
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </SectionWrapper>
  );
}
