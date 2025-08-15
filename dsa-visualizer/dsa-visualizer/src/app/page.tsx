// Dựa trên: cubestar1/dsa-visualizer/dsa-visualizer-697c2f1f0742908985c830dfca74ac445cc4d3a4/app/page.tsx
import { Hero } from "@/components/landing/hero";
import { Navbar } from "@/components/navigation/navbar";
import { Features } from "@/components/landing/features";
import { TechStack } from "@/components/landing/tech-stack";
// import { Stats } from "@/components/landing/stats";
import { CTA } from "@/components/landing/cta";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
        {/* <Stats /> */}
        <Features />
        <TechStack />
        <CTA />
      </main>
      <footer className="border-t py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 DSA Visualizer. Được tạo với ❤️ để học tập.</p>
        </div>
      </footer>
    </div>
  );
}