"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, Terminal } from 'lucide-react';
import Link from 'next/link';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50"
                        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div
                            className="w-full max-w-sm rounded-2xl p-6 shadow-2xl relative overflow-hidden"
                            style={{
                                background: 'rgba(10,10,10,0.95)',
                                border: '1px solid rgba(0,230,118,0.12)',
                                boxShadow: '0 0 60px rgba(0,230,118,0.05), 0 25px 60px rgba(0,0,0,0.5)',
                                backdropFilter: 'blur(20px)',
                            }}
                        >
                            {/* Green glow top */}
                            <div
                                className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 pointer-events-none"
                                style={{
                                    background: 'radial-gradient(ellipse at 50% 0%, rgba(0,230,118,0.08) 0%, transparent 70%)',
                                }}
                            />

                            {/* Header */}
                            <div className="flex items-center justify-between mb-5 relative z-10">
                                <div className="flex items-center gap-2.5">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                                        style={{
                                            background: 'rgba(0,230,118,0.1)',
                                            border: '1px solid rgba(0,230,118,0.2)',
                                        }}
                                    >
                                        <Terminal size={14} className="text-[#00e676]" />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-100 font-mono">
                                        Join the community
                                    </h3>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-lg transition-colors"
                                    style={{ color: '#525252' }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLElement).style.color = '#a3a3a3';
                                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLElement).style.color = '#525252';
                                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <p className="text-sm text-gray-500 mb-6 font-mono leading-relaxed relative z-10">
                                Sign in to vote, comment, and share your favorite open-source tools with FOSS CEV.
                            </p>

                            <Link
                                href="/picks/signin"
                                onClick={onClose}
                                className="w-full py-2.5 rounded-xl text-sm font-semibold font-mono transition-all duration-200 flex items-center justify-center gap-2 relative z-10 group overflow-hidden"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(0,230,118,0.15) 0%, rgba(0,168,84,0.1) 100%)',
                                    color: '#00e676',
                                    border: '1px solid rgba(0,230,118,0.25)',
                                    boxShadow: '0 0 20px rgba(0,230,118,0.08)',
                                }}
                            >
                                <LogIn size={14} />
                                Sign In / Sign Up
                            </Link>

                            <p className="text-[10px] text-gray-700 text-center mt-4 font-mono relative z-10">
                                @cev.ac.in · @gmail.com · @outlook.com · @yahoo.com
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
