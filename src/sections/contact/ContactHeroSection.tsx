import { Badge } from "@/components/ui/Badge";
import { Heading } from "@/components/ui/Heading";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

export function ContactHeroSection() {
  return (
    <SectionWrapper id="contact-hero" className="pt-8 sm:pt-14 md:pt-20 lg:pt-24 text-center">
      <div className="mx-auto max-w-3xl">
        <Badge variant="accent">Get in touch</Badge>
        <Heading as="h1" size="h1" className="mt-4">
          Let&apos;s turn your vision into reality.
        </Heading>
        <p className="mt-5 text-base text-slate-600 sm:text-lg">
          Have a complex problem or a bold idea? Our experts are ready to jump in and start building.
        </p>
      </div>
    </SectionWrapper>
  );
}
