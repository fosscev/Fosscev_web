"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePicksAuth } from './PicksAuthProvider';

export function ProfileIcon() {
    const { user, signOut } = usePicksAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    const initial = (user.username || '?')[0].toUpperCase();
    const hue = (user.username || '').charCodeAt(0) * 37 % 360;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-1.5 py-1.5 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
            >
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm"
                    style={{
                        background: `hsl(${hue}, 50%, 25%)`,
                        color: `hsl(${hue}, 70%, 75%)`,
                    }}
                >
                    {initial}
                </div>
                <ChevronDown size={14} className="text-gray-500 mr-1" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-[#0e0e0e] border border-white/[0.08] rounded-xl shadow-2xl py-1 z-50 overflow-hidden"
                    >
                        <div className="px-4 py-3 border-b border-white/5 mb-1">
                            <p className="text-sm font-bold text-white truncate">{user.username}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>

                        <div className="px-1 py-1">
                            <Link
                                href="/picks/profile"
                                onClick={() => setIsOpen(false)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <User size={15} />
                                Profile & Saved
                            </Link>

                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    signOut();
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <LogOut size={15} />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
