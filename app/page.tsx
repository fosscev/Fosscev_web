"use client";

import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { Tracks } from "../components/Tracks";
import { TiltedScroll } from "../components/TiltedScroll";
import { Footer } from "../components/Footer";
import { CoreTeam } from "../components/CoreTeam";

export default function Home() {
  return (
    <div className="relative bg-background selection:bg-primary selection:text-black min-h-screen overflow-hidden">
      {/* Animated Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Main grid pattern */}
        <div className="absolute inset-0 hacker-grid opacity-20"></div>

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"></div>

        {/* Glowing dots at grid intersections */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(0, 230, 118, 0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px'
        }}></div>

        {/* Animated scan lines */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-vertical"></div>
        </div>
      </div>

      <div className="relative z-10">
        <Navbar />

        <main className="flex-col w-full">
          <Hero />
          <Tracks />
          <TiltedScroll />
          <CoreTeam />
        </main>

        <Footer />
      </div>
    </div>
  );
}
