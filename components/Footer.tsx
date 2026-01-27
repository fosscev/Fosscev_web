"use client";

import Link from "next/link";
import { SOCIAL_LINKS } from "@/lib/constants";
import { ExternalLink } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-background text-white pt-20 pb-0 overflow-hidden relative border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 mb-20 lg:mb-40">
                {/* Connect Section */}
                <div>
                    <h3 className="font-display font-bold text-2xl mb-6 text-primary">Connect_</h3>
                    <ul className="space-y-4 font-mono text-gray-400">
                        <li>
                            <a
                                href={SOCIAL_LINKS.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white hover:underline decoration-primary underline-offset-4 transition-colors flex items-center gap-2"
                            >
                                GitHub <ExternalLink className="w-3 h-3" />
                            </a>
                        </li>
                        <li>
                            <a
                                href={SOCIAL_LINKS.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white hover:underline decoration-primary underline-offset-4 transition-colors flex items-center gap-2"
                            >
                                LinkedIn <ExternalLink className="w-3 h-3" />
                            </a>
                        </li>
                        <li>
                            <a
                                href={SOCIAL_LINKS.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white hover:underline decoration-primary underline-offset-4 transition-colors flex items-center gap-2"
                            >
                                Instagram <ExternalLink className="w-3 h-3" />
                            </a>
                        </li>
                        <li>
                            <a
                                href={SOCIAL_LINKS.whatsapp}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white hover:underline decoration-primary underline-offset-4 transition-colors flex items-center gap-2"
                            >
                                WhatsApp <ExternalLink className="w-3 h-3" />
                            </a>
                        </li>
                        <li>
                            <a
                                href={SOCIAL_LINKS.telegram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white hover:underline decoration-primary underline-offset-4 transition-colors flex items-center gap-2"
                            >
                                Telegram <ExternalLink className="w-3 h-3" />
                            </a>
                        </li>
                        <li>
                            <a
                                href={SOCIAL_LINKS.email}
                                className="hover:text-white hover:underline decoration-primary underline-offset-4 transition-colors flex items-center gap-2"
                            >
                                Email <ExternalLink className="w-3 h-3" />
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="font-display font-bold text-2xl mb-6 text-primary">Quick_Links</h3>
                    <ul className="space-y-4 font-mono text-gray-400">
                        <li>
                            <Link href="/" className="hover:text-white hover:underline decoration-primary underline-offset-4 transition-colors">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/about" className="hover:text-white hover:underline decoration-primary underline-offset-4 transition-colors">
                                About
                            </Link>
                        </li>
                        <li>
                            <Link href="/events" className="hover:text-white hover:underline decoration-primary underline-offset-4 transition-colors">
                                Events
                            </Link>
                        </li>
                        <li>
                            <Link href="/team" className="hover:text-white hover:underline decoration-primary underline-offset-4 transition-colors">
                                Team
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Location & FOSS United */}
                <div>
                    <h3 className="font-display font-bold text-2xl mb-6 text-primary">Location_</h3>
                    <p className="font-mono text-gray-400 mb-6">
                        College of Engineering Vadakara<br />
                        Kerala, India
                    </p>

                    <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg hover:border-primary transition-colors">
                        <p className="text-xs text-gray-500 font-mono uppercase mb-2">Part of</p>
                        <a
                            href={SOCIAL_LINKS.fossUnited}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary font-bold font-display hover:text-white transition-colors"
                        >
                            FOSS United <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>

                    <p className="mt-8 text-gray-500 text-sm">© 2025 FOSS Community CEV</p>
                </div>
            </div>

            {/* Mega Type */}
            <div className="w-full relative flex justify-center -mb-[5vw] select-none pointer-events-none">
                <h1 className="font-display font-black text-[12vw] sm:text-[14vw] leading-[0.8] text-white/5 whitespace-nowrap tracking-tighter">
                    FOSS COMMUNITY
                </h1>
            </div>
        </footer>
    );
}
