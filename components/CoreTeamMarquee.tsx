"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  return (
    <motion.div
      className="group relative flex h-[420px] w-full flex-col overflow-hidden rounded-[24px] border border-emerald-400/25 bg-black/30 shadow-[0_0_40px_rgba(2,8,23,0.45)] backdrop-blur-xl"
      whileHover={{ y: -8, scale: 1.02, boxShadow: "0 0 0 1px rgba(16, 185, 129, 0.25), 0 0 35px rgba(16, 185, 129, 0.22)" }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
    >
      <div className="h-[calc(100%-96px)] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={member.image}
          alt={member.name}
          className="h-full w-full object-cover object-center brightness-100 contrast-110 transition duration-500 ease-out group-hover:scale-105"
          loading="lazy"
          decoding="async"
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

export function CoreTeamMarquee() {
  const [teamData, setTeamData] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    if (!isVisible) return;

    const fetchTeam = async () => {
      try {
        const response = await fetch("/api/data/team", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch team data");
        const data = await response.json();
        const coreTeamMembers = Array.isArray(data?.coreTeam) ? data.coreTeam : [];
        setTeamData(
          coreTeamMembers.map((member: Record<string, any>) => ({
            name: member.name || "",
            role: member.role || "",
            image: member.image_url || member.image || "/placeholder.jpg",
          }))
        );
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeam();
  }, [isVisible]);

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
        <div className="mx-auto max-w-7xl px-4">
          <div className="h-96 animate-pulse rounded-[2rem] border border-white/5 bg-gray-800/40"></div>
        </div>
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
