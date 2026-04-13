import { HomeLandingContent } from "@/components/landing/home-landing-content";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f2e8] text-[#2c2c2a]">
      <LandingHeader />
      <HomeLandingContent />
      <LandingFooter />
    </div>
  );
}
