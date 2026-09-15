import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

export function CTABannerSection() {
  return (
    <SectionWrapper id="cta" dark>
      <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-10 md:p-12 text-center">
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-indigo-300">Ready to build?</p>
        <Heading as="h2" className="mt-3 text-white">
          Let&apos;s launch your next digital product with confidence.
        </Heading>
        <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
          Tell us what you are building, where you are blocked, and the momentum you need next.
        </p>
        <div className="mt-6 sm:mt-8 flex justify-center">
          <Button href="/contact" size="lg" className="w-full sm:w-auto">
            Book a discovery call
          </Button>
        </div>
      </div>
    </SectionWrapper>
  );
}
