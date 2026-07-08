"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useSiteContent } from "@/lib/useSiteContent";

interface TeamMember {
  name: string;
  role: string;
  image: string;
  github?: string;
  linkedin?: string;
  instagram?: string;
}

const MarqueeCard = ({ member }: { member: TeamMember }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      className="group relative flex h-[420px] w-full flex-col overflow-hidden rounded-[24px] border border-emerald-400/25 bg-black/30 shadow-[0_0_40px_rgba(2,8,23,0.45)] backdrop-blur-xl"
      whileHover={{ y: -8, scale: 1.02, boxShadow: "0 0 0 1px rgba(16, 185, 129, 0.25), 0 0 35px rgba(16, 185, 129, 0.22)" }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
    >
      <div className="h-[calc(100%-96px)] w-full overflow-hidden relative">
        {/* Shimmer Placeholder while loading image */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-900 overflow-hidden z-10 animate-pulse">
            <div 
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
              style={{ animation: 'var(--animate-shimmer) 2s infinite' }}
            />
          </div>
        )}

        <Image
          src={member.image}
          alt={member.name}
          fill
          sizes="(max-width: 768px) 46vw, (max-width: 1024px) 31vw, 24vw"
          loading="eager"
          onLoad={() => setImageLoaded(true)}
          className={`object-cover object-center brightness-100 contrast-110 transition duration-500 ease-out group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      <div className="flex h-[96px] flex-col items-center justify-center px-4 py-4 text-center sm:px-5">
        <h3 className="text-[1.05rem] font-semibold leading-none tracking-[0.02em] text-white sm:text-[1.2rem]">
          {member.name}
        </h3>
        <p className="mt-2 text-[0.72rem] font-mono uppercase leading-none tracking-[0.24em] text-emerald-400 sm:text-[0.75rem]">
          {member.role}
        </p>
      </div>

      <div className="pointer-events-none absolute inset-0 z-30 rounded-[24px] border border-white/10" />
      <div className="pointer-events-none absolute inset-0 z-30 rounded-[24px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]" />
    </motion.div>
  );
};

const memberOrder = [
  "Rishnu Lal N",
  "Roshith Krishna",
  "Sayanth P",
  "Anvar Sadath",
  "Lakshmi Reji Suresh",
  "Ashwandha RJ",
  "Sandra Sunil T",
  "Muhammad Shabaz",
  "Muhammad Aswlah",
  "Fathima P",
  "Hemanth Sudhan C",
  "Ananthanarayanan M",
] as const;

const CoreTeamSkeleton = () => {
  return (
    <div className="w-full overflow-hidden opacity-50 py-10">
      <div className="flex gap-6 justify-center">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[46vw] h-[420px] rounded-[24px] border border-emerald-400/10 bg-black/30 backdrop-blur-xl flex flex-col overflow-hidden relative sm:w-[31vw] lg:w-[24vw]"
          >
            {/* Image Placeholder */}
            <div className="h-[calc(100%-96px)] w-full bg-gray-900 relative overflow-hidden">
              <div 
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent"
                style={{ animation: 'var(--animate-shimmer) 2s infinite' }}
              />
            </div>
            
            {/* Text Placeholders */}
            <div className="flex h-[96px] flex-col items-center justify-center px-4 py-4 text-center sm:px-5 space-y-3">
              {/* Name Skeleton */}
              <div className="w-2/3 h-4 bg-gray-800 rounded relative overflow-hidden">
                <div 
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent"
                  style={{ animation: 'var(--animate-shimmer) 2s infinite' }}
                />
              </div>
              {/* Role Skeleton */}
              <div className="w-1/2 h-3 bg-emerald-950/40 rounded relative overflow-hidden">
                <div 
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent"
                  style={{ animation: 'var(--animate-shimmer) 2s infinite' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export function CoreTeamMarquee() {
  const [teamData, setTeamData] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);
  const [marqueeOffset, setMarqueeOffset] = useState(0);
  const progressRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  const { content: siteContent } = useSiteContent();
  const sectionContent = siteContent.core_team || { title: "Core Team" };

  const shouldReduceMotion = useReducedMotion();
  const [isHovering, setIsHovering] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Still observe visibility for heading fade-in transition
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "400px 0px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const marqueeEl = marqueeRef.current;
    if (!marqueeEl) return;

    const measureDimensions = () => {
      const firstTrackChild = marqueeEl.querySelector("[data-marquee-track] > div") as HTMLDivElement | null;
      if (firstTrackChild) {
        setCardWidth(firstTrackChild.getBoundingClientRect().width);
      }
    };

    measureDimensions();
    const resizeObserver = new ResizeObserver(measureDimensions);
    resizeObserver.observe(marqueeEl);

    return () => resizeObserver.disconnect();
  }, [isLoading]);

  // Fetch immediately on mount, retry up to 3 times
  useEffect(() => {
    let retries = 3;
    let active = true;

    const fetchTeam = async () => {
      try {
        const response = await fetch("/api/data/team", { cache: "no-store" });
        if (!active) return;
        if (!response.ok) throw new Error("Failed to fetch team data");
        const data = await response.json();
        const coreTeamMembers = Array.isArray(data?.coreTeam) ? data.coreTeam : [];
        
        if (coreTeamMembers.length === 0) throw new Error("No core team members returned");

        setTeamData(
          coreTeamMembers.map((member: Record<string, any>) => ({
            name: member.name || "",
            role: member.role || "",
            image: member.image_url || member.image || "/placeholder.jpg",
          }))
        );
        setError(null);
        setIsLoading(false);
      } catch (err) {
        console.error("Unexpected error loading team data:", err);
        if (retries > 0) {
          retries--;
          setTimeout(() => {
            if (active) fetchTeam();
          }, 2000);
        } else {
          if (active) {
            setError("Failed to load core team data");
            setIsLoading(false);
          }
        }
      }
    };

    fetchTeam();

    return () => {
      active = false;
    };
  }, []);

  const orderedMembers = useMemo(() => {
    if (!teamData.length) return [];
    const memberMap = new Map(teamData.map((member) => [member.name, member]));
    return memberOrder
      .map((name) => memberMap.get(name))
      .filter((member): member is TeamMember => Boolean(member));
  }, [teamData]);

  const marqueeMembers = useMemo(() => {
    return orderedMembers.length > 0 ? [...orderedMembers, ...orderedMembers] : [];
  }, [orderedMembers]);

  useEffect(() => {
    if (shouldReduceMotion || !cardWidth || !orderedMembers.length) {
      setMarqueeOffset(0);
      progressRef.current = 0;
      startTimeRef.current = null;
      return;
    }

    const isPaused = isHovering || isFocused;
    const loopDuration = 32;
    const distance = cardWidth * orderedMembers.length;
    let rafId = 0;

    const updatePosition = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp - progressRef.current * loopDuration * 1000;
      }

      const elapsed = (timestamp - startTimeRef.current) / 1000;
      const nextProgress = (elapsed % loopDuration) / loopDuration;
      progressRef.current = nextProgress;
      setMarqueeOffset(-distance * nextProgress);

      rafId = window.requestAnimationFrame(updatePosition);
    };

    if (!isPaused) {
      rafId = window.requestAnimationFrame(updatePosition);
    }

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [cardWidth, isFocused, isHovering, orderedMembers.length, shouldReduceMotion]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsHovering(true);
      } else if (!isHovering && !isFocused && !shouldReduceMotion) {
        setIsHovering(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isFocused, isHovering, shouldReduceMotion]);

  if (isLoading) {
    return (
      <section ref={sectionRef} className="relative overflow-hidden py-20">
        <CoreTeamSkeleton />
      </section>
    );
  }

  if (error) {
    return (
      <section ref={sectionRef} className="relative overflow-hidden py-20 text-center">
        <p className="text-red-500 font-mono">{error}</p>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-20"
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 620px" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_46%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className={`mx-auto mb-16 max-w-7xl px-4 text-center transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
        <h2 className="text-3xl font-light tracking-tight text-white md:text-5xl">{sectionContent.title}</h2>
        <div className="mx-auto mt-6 h-px w-12 bg-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.7)]"></div>
      </div>

      <div
        ref={marqueeRef}
        className="w-full overflow-hidden"
        style={{ maskImage: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.95) 8%, rgba(0,0,0,0.95) 92%, transparent 100%)", WebkitMaskImage: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.95) 8%, rgba(0,0,0,0.95) 92%, transparent 100%)" }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onFocusCapture={() => setIsFocused(true)}
        onBlurCapture={() => setIsFocused(false)}
      >
        <motion.div
          data-marquee-track
          className="flex will-change-transform"
          style={{ x: marqueeOffset, transform: "translate3d(0,0,0)" }}
        >
          {marqueeMembers.map((member, index) => (
            <div
              key={`${member.name}-${index}`}
              className="mr-3 flex-shrink-0 w-[46vw] px-1 sm:mr-4 sm:w-[31vw] sm:px-2 lg:mr-6 lg:w-[24vw] lg:px-3"
            >
              <MarqueeCard member={member} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
