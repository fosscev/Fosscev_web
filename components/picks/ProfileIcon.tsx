"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePicksAuth } from './PicksAuthProvider';

export function ProfileIcon() {
    const { user, signOut } = usePicksAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
                className="flex items-center gap-1.5 px-1.5 py-1.5 rounded-xl transition-all duration-150"
                style={{
                    border: isOpen ? '1px solid rgba(0,230,118,0.2)' : '1px solid transparent',
                    background: isOpen ? 'rgba(0,230,118,0.05)' : 'transparent',
                }}
                onMouseEnter={e => {
                    if (!isOpen) {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                        (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.08)';
                    }
                }}
                onMouseLeave={e => {
                    if (!isOpen) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.border = '1px solid transparent';
                    }
                }}
            >
                <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono"
                    style={{
                        background: `hsl(${hue}, 40%, 20%)`,
                        color: `hsl(${hue}, 60%, 70%)`,
                        border: `1px solid hsl(${hue}, 40%, 30%)`,
                    }}
                >
                    {initial}
                </div>
                <ChevronDown
                    size={12}
                    className="transition-transform duration-200"
                    style={{
                        color: '#525252',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-48 rounded-xl py-1 z-50 overflow-hidden"
                        style={{
                            background: 'rgba(10,10,10,0.95)',
                            border: '1px solid rgba(0,230,118,0.1)',
                            backdropFilter: 'blur(16px)',
                            boxShadow: '0 16px 40px rgba(0,0,0,0.5), 0 0 20px rgba(0,230,118,0.04)',
                        }}
                    >
                        <div
                            className="px-4 py-3 mb-1"
                            style={{ borderBottom: '1px solid rgba(0,230,118,0.06)' }}
                        >
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <div
                                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                                    style={{ background: '#00e676', boxShadow: '0 0 5px #00e676' }}
                                />
                                <p className="text-xs font-semibold text-gray-200 font-mono truncate">{user.username}</p>
                            </div>
                            <p className="text-[10px] text-gray-600 font-mono truncate">{user.email}</p>
                        </div>

                        <div className="px-1">
                            <Link
                                href="/picks/profile"
                                onClick={() => setIsOpen(false)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 rounded-lg transition-all duration-150 font-mono"
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLElement).style.color = '#00e676';
                                    (e.currentTarget as HTMLElement).style.background = 'rgba(0,230,118,0.06)';
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLElement).style.color = '';
                                    (e.currentTarget as HTMLElement).style.background = '';
                                }}
                            >
                                <User size={13} />
                                Profile & Saved
                            </Link>

                            <button
                                onClick={async () => {
                                    setIsOpen(false);
                                    await signOut();
                                    router.push('/picks');
                                    router.refresh();
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-all duration-150 font-mono"
                                style={{ color: '#f87171' }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)';
                                    (e.currentTarget as HTMLElement).style.color = '#fca5a5';
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLElement).style.background = '';
                                    (e.currentTarget as HTMLElement).style.color = '#f87171';
                                }}
                            >
                                <LogOut size={13} />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
