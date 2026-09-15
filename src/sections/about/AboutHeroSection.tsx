import { Badge } from "@/components/ui/Badge";
import { Heading } from "@/components/ui/Heading";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { siteConfig } from "@/config/site";

export function AboutHeroSection() {
  return (
    <SectionWrapper id="about-hero" className="pt-8 sm:pt-14 md:pt-20 lg:pt-24 text-center">
      <div className="mx-auto max-w-3xl">
        <Badge variant="accent">Who We Are</Badge>
        <Heading as="h1" size="h1" className="mt-4">
          Empowering businesses through purpose-built technology.
        </Heading>
        <p className="mt-5 text-base text-slate-600 sm:text-lg">
          We are {siteConfig.name}, a product and engineering partner that helps teams move from ideas to measurable
          outcomes with confidence.
        </p>
      </div>
    </SectionWrapper>
  );
}
