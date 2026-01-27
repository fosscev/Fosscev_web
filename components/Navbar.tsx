"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    const isActive = (path: string) => pathname === path ? "text-primary" : "text-gray-400";

    return (
        <nav className="fixed top-0 z-50 w-full glass-nav px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-3 group">
                        <Image
                            src="/logo.png"
                            alt="FOSS Club CEV"
                            width={180}
                            height={50}
                            className="h-12 w-auto object-contain"
                            priority
                        />
                    </Link>

                    <div className="hidden md:flex gap-8 font-display items-center whitespace-nowrap">
                        <Link href="/" className={`${isActive('/')} hover:text-primary transition-colors duration-200`}>./Home</Link>
                        <Link href="/about" className={`${isActive('/about')} hover:text-primary transition-colors duration-200`}>./About</Link>
                        <Link href="/events" className={`${isActive('/events')} hover:text-primary transition-colors duration-200`}>./Events</Link>
                        <Link href="/team" className={`${isActive('/team')} hover:text-primary transition-colors duration-200`}>./Team</Link>

                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="p-2 rounded-full hover:bg-gray-800 dark:hover:bg-white/10 transition-colors text-gray-900 dark:text-white"
                            aria-label="Toggle theme"
                        >
                            {mounted && (theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
                        </button>

                        <button className="bg-primary hover:bg-primary-dark text-black px-4 py-2 rounded-md font-bold transition-all duration-200 hover:shadow-[0_0_10px_rgba(0,230,118,0.4)]">
                            Join Now
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="p-2 rounded-full hover:bg-gray-800 dark:hover:bg-white/10 transition-colors text-gray-900 dark:text-white"
                        >
                            {mounted && (theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-white hover:text-primary transition-colors p-2"
                            aria-label="Toggle menu"
                        >
                            <span className="material-symbols-outlined">
                                {isOpen ? 'close' : 'menu'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <div
                className={`md:hidden absolute left-0 w-full bg-surface/95 backdrop-blur-md border-b border-white/10 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="flex flex-col p-4 space-y-4 font-display">
                    <Link href="/" className="text-gray-400 hover:text-primary block py-2" onClick={() => setIsOpen(false)}>./Home</Link>
                    <Link href="/about" className="text-gray-400 hover:text-primary block py-2" onClick={() => setIsOpen(false)}>./About</Link>
                    <Link href="/events" className="text-gray-400 hover:text-primary block py-2" onClick={() => setIsOpen(false)}>./Events</Link>
                    <Link href="/team" className="text-gray-400 hover:text-primary block py-2" onClick={() => setIsOpen(false)}>./Team</Link>
                    <Link
                        href="https://fossunited.org/c/college-of-engineering-vadakara"
                        target="_blank"
                        className="bg-primary text-black px-4 py-3 rounded-md font-bold w-full text-center hover:bg-primary-dark transition-colors block"
                        onClick={() => setIsOpen(false)}
                    >
                        Join Now_
                    </Link>
                </div>
            </div>
        </nav>
    );
}
