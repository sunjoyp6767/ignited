import { LandingHeader } from "@/components/landing/landing-header";

export default function DefaultSubLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f6f3] text-[#2c2c2a]">
      <LandingHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
