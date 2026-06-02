"use client";

import { ThemeProvider } from "@/components/ui/ThemeToggle";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingCTA from "@/components/layout/FloatingCTA";
import ChatWidget from "@/components/ui/ChatWidget";
import Hero from "@/components/sections/Hero";
import TrustBar from "@/components/sections/TrustBar";
import ProblemSolution from "@/components/sections/ProblemSolution";
import Features from "@/components/sections/Features";
import AIWorkflow from "@/components/sections/AIWorkflow";
import UseCases from "@/components/sections/UseCases";
import ROISection from "@/components/sections/ROISection";
import Integrations from "@/components/sections/Integrations";
import Pricing from "@/components/sections/Pricing";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import CTASection from "@/components/sections/CTASection";

export default function Home() {
  return (
    <ThemeProvider>
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <ProblemSolution />
        <Features />
        <AIWorkflow />
        <UseCases />
        <ROISection />
        <Integrations />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
      <FloatingCTA />
      <ChatWidget />
    </ThemeProvider>
  );
}