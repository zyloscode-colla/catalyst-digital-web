import { Badge } from "@/components/ui/Badge";
import { Heading } from "@/components/ui/Heading";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

export function BlogHeroSection() {
  return (
    <SectionWrapper id="blog-hero" className="pt-8 sm:pt-14 md:pt-20 lg:pt-24 text-center">
      <div className="mx-auto max-w-3xl">
        <Badge variant="accent">Latest Updates</Badge>
        <Heading as="h1" size="h1" className="mt-4">
          Our insights
        </Heading>
        <p className="mt-5 text-base text-slate-600 sm:text-lg">
          Thoughts, patterns, and lessons from our work across design, engineering, and digital delivery.
        </p>
        <div className="mx-auto mt-8 max-w-xl rounded-full border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-400">
          Search posts (coming soon)
        </div>
      </div>
    </SectionWrapper>
  );
}
