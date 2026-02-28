"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SOCIAL_LINKS } from "@/lib/constants";
import { supabase } from "@/lib/supabase";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/events", label: "Events" },
    { href: "/team", label: "Team" },
    { href: "/conduct", label: "Conduct" },
];

export function Logo() { return null; }

export function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [logoUrl, setLogoUrl] = useState("/logo.png");
    const pathname = usePathname();

    useEffect(() => {
        const { data } = supabase.storage.from("foss-images").getPublicUrl("logos/logo.png");
        if (data?.publicUrl) setLogoUrl(data.publicUrl);
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => { setMobileOpen(false); }, [pathname]);

    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href);

    return (
        <>
            {/* Floating pill */}
            <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
                <motion.header
                    initial={{ y: -60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-3xl pointer-events-auto rounded-2xl"
                    style={{
                        background: scrolled ? "rgba(5,5,5,0.86)" : "rgba(8,8,12,0.62)",
                        backdropFilter: "blur(22px)",
                        WebkitBackdropFilter: "blur(22px)",
                        border: "1px solid rgba(0,230,118,0.14)",
                        boxShadow: scrolled
                            ? "0 8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,230,118,0.06)"
                            : "0 4px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,230,118,0.04)",
                        transition: "background 0.3s, box-shadow 0.3s",
                    }}
                >
                    <div className="px-4 sm:px-5">
                        <div className="flex items-center justify-between h-14">

                            {/* Logo */}
                            <Link href="/" className="flex items-center group flex-shrink-0">
                                <Image
                                    src={logoUrl}
                                    alt="FOSS Club CEV"
                                    width={130}
                                    height={36}
                                    className="h-8 w-auto object-contain transition-all duration-300 group-hover:brightness-110"
                                    priority
                                    onError={() => setLogoUrl("/logo.png")}
                                />
                            </Link>

                            {/* Desktop nav */}
                            <nav className="hidden md:flex items-center gap-0.5">
                                {NAV_LINKS.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="relative px-3.5 py-1.5 rounded-lg text-sm font-mono transition-colors duration-200 group"
                                        style={{ color: isActive(link.href) ? "#00e676" : "#a3a3a3" }}
                                        onMouseEnter={(e) => {
                                            if (!isActive(link.href)) (e.currentTarget as HTMLElement).style.color = "#e0e0e0";
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive(link.href)) (e.currentTarget as HTMLElement).style.color = "#a3a3a3";
                                        }}
                                    >
                                        {isActive(link.href) && (
                                            <motion.span
                                                layoutId="nav-pill"
                                                className="absolute inset-0 rounded-lg"
                                                style={{ background: "rgba(0,230,118,0.1)", border: "1px solid rgba(0,230,118,0.22)" }}
                                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                            />
                                        )}
                                        <span
                                            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            style={{ background: "rgba(255,255,255,0.04)" }}
                                        />
                                        <span className="relative z-10">{link.label}</span>
                                    </Link>
                                ))}
                            </nav>

                            {/* Desktop CTA */}
                            <div className="hidden md:flex items-center">
                                <a
                                    href={SOCIAL_LINKS.whatsapp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-1.5 rounded-lg text-sm font-mono font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                                    style={{ background: "rgba(0,230,118,0.1)", border: "1px solid rgba(0,230,118,0.25)", color: "#00e676" }}
                                    onMouseEnter={(e) => {
                                        const el = e.currentTarget as HTMLElement;
                                        el.style.background = "rgba(0,230,118,0.18)";
                                        el.style.boxShadow = "0 0 14px rgba(0,230,118,0.2)";
                                    }}
                                    onMouseLeave={(e) => {
                                        const el = e.currentTarget as HTMLElement;
                                        el.style.background = "rgba(0,230,118,0.1)";
                                        el.style.boxShadow = "none";
                                    }}
                                >
                                    Join Community
                                </a>
                            </div>

                            {/* Mobile hamburger */}
                            <button
                                onClick={() => setMobileOpen((o) => !o)}
                                className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200"
                                style={{
                                    background: mobileOpen ? "rgba(0,230,118,0.12)" : "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    color: mobileOpen ? "#00e676" : "#a3a3a3",
                                }}
                                aria-label="Toggle navigation"
                            >
                                <AnimatePresence mode="wait">
                                    {mobileOpen ? (
                                        <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                                            <X size={16} />
                                        </motion.span>
                                    ) : (
                                        <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                                            <Menu size={16} />
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        </div>
                    </div>
                </motion.header>
            </div>

            {/* Mobile dropdown */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        key="mobile-menu"
                        initial={{ opacity: 0, y: -10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed top-[4.75rem] left-3 right-3 z-40 rounded-2xl overflow-hidden md:hidden"
                        style={{
                            background: "rgba(8,8,12,0.94)",
                            backdropFilter: "blur(24px)",
                            WebkitBackdropFilter: "blur(24px)",
                            border: "1px solid rgba(0,230,118,0.14)",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                        }}
                    >
                        <nav className="p-3 space-y-1">
                            {NAV_LINKS.map((link, i) => (
                                <motion.div key={link.href} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04, duration: 0.18 }}>
                                    <Link
                                        href={link.href}
                                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-mono transition-all duration-150"
                                        style={{
                                            background: isActive(link.href) ? "rgba(0,230,118,0.1)" : "transparent",
                                            border: isActive(link.href) ? "1px solid rgba(0,230,118,0.2)" : "1px solid transparent",
                                            color: isActive(link.href) ? "#00e676" : "#a3a3a3",
                                        }}
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: isActive(link.href) ? "#00e676" : "rgba(255,255,255,0.15)" }} />
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </nav>
                        <div className="mx-3 border-t" style={{ borderColor: "rgba(0,230,118,0.08)" }} />
                        <div className="p-3">
                            <a
                                href={SOCIAL_LINKS.whatsapp}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-full py-3 rounded-xl text-sm font-mono font-semibold active:scale-95 transition-transform"
                                style={{ background: "linear-gradient(135deg, #00e676, #00b4d8)", color: "#000", boxShadow: "0 0 20px rgba(0,230,118,0.25)" }}
                                onClick={() => setMobileOpen(false)}
                            >
                                Join Community →
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Backdrop */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
                )}
            </AnimatePresence>
        </>
    );
}
