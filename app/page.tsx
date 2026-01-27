"use client";

import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { Tracks } from "../components/Tracks";
import { TiltedScroll } from "../components/TiltedScroll";
import { Footer } from "../components/Footer";
import { CoreTeam } from "../components/CoreTeam";

export default function Home() {
  return (
    <div className="bg-background selection:bg-primary selection:text-black min-h-screen">
      <div className="fixed inset-0 pointer-events-none hacker-grid z-0 opacity-20" />
      <Navbar />

      <main className="flex-col w-full">
        <Hero />
        <Tracks />
        <TiltedScroll />
        <CoreTeam />
      </main>

      <Footer />
    </div>
  );
}
