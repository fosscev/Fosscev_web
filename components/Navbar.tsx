"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Info, Calendar, Users as UsersIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SOCIAL_LINKS } from "@/lib/constants";
import { Logo } from "@/components/Logo";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    // Track scroll - show navbar after scrolling past landing page
    useEffect(() => {
        const handleScroll = () => {
            // Show navbar after scrolling 80vh (most of landing page)
            setScrolled(window.scrollY > window.innerHeight * 0.8);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isActive = (path: string) => pathname === path;

    const menuItems = [
        { path: "/", label: "Home", icon: Home },
        { path: "/about", label: "About", icon: Info },
        { path: "/events", label: "Events", icon: Calendar },
        { path: "/team", label: "Team", icon: UsersIcon },
    ];

    return (
        <>
            {/* Fixed Logo - Always visible */}
            <Logo />

            {/* Compact Hamburger Button - Only shows when scrolled */}
            <AnimatePresence>
                {scrolled && (
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        transition={{ duration: 0.3 }}
                        className="fixed top-6 right-6 z-50"
                    >
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="w-14 h-14 bg-surface/90 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300 shadow-lg hover:shadow-primary/50 group"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? (
                                <X className="w-6 h-6 text-white group-hover:text-black transition-colors" />
                            ) : (
                                <Menu className="w-6 h-6 text-white group-hover:text-black transition-colors" />
                            )}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Full Screen Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl"
                        onClick={() => setIsOpen(false)}
                    >
                        <div className="h-full flex flex-col items-center justify-center p-8">
                            {/* Menu Items */}
                            <nav className="space-y-6">
                                {menuItems.map((item, index) => (
                                    <motion.div
                                        key={item.path}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Link
                                            href={item.path}
                                            onClick={() => setIsOpen(false)}
                                            className={`group flex items-center gap-4 text-4xl md:text-6xl font-display font-bold transition-all duration-300 ${isActive(item.path)
                                                ? "text-primary"
                                                : "text-gray-400 hover:text-white"
                                                }`}
                                        >
                                            <item.icon className={`w-10 h-10 md:w-14 md:h-14 transition-all duration-300 ${isActive(item.path)
                                                ? "text-primary"
                                                : "text-gray-600 group-hover:text-primary"
                                                }`} />
                                            <span className="relative">
                                                {item.label}
                                                <span className="absolute -bottom-2 left-0 w-0 h-1 bg-primary group-hover:w-full transition-all duration-300"></span>
                                            </span>
                                        </Link>
                                    </motion.div>
                                ))}
                            </nav>

                            {/* Join Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mt-12"
                            >
                                <Link
                                    href={SOCIAL_LINKS.whatsapp}
                                    target="_blank"
                                    className="inline-block bg-primary hover:bg-primary-dark text-black px-8 py-4 rounded-lg font-bold text-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,230,118,0.5)] hover:scale-105"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Join Community →
                                </Link>
                            </motion.div>

                            {/* Footer Info */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="absolute bottom-8 text-center"
                            >
                                <p className="text-gray-500 font-mono text-sm">
                                    FOSS Community CEV
                                </p>
                                <p className="text-gray-600 font-mono text-xs mt-1">
                                    Building the future, one commit at a time
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
