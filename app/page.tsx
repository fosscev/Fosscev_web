"use client";

import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { WhatWeDo } from "../components/WhatWeDo";
import { Tracks } from "../components/Tracks";
import { TiltedScroll } from "../components/TiltedScroll";
import { Footer } from "../components/Footer";
import { CoreTeam } from "../components/CoreTeam";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function Home() {
  return (
    <div className="relative selection:bg-primary selection:text-black min-h-screen overflow-x-hidden">
      <LoadingScreen />
      <div className="relative z-10">
        <Navbar />

        <main className="flex-col w-full">
          <Hero />
          <WhatWeDo />
          <Tracks />
          <TiltedScroll />
          <CoreTeam />
        </main>

        <Footer />
      </div>
    </div>
  );
}
