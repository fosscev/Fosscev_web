"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn } from 'lucide-react';
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
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="w-full max-w-sm bg-[#0e0e0e] border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-100">Join the conversation</h3>
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <p className="text-sm text-gray-400 mb-6">
                                Sign in to vote, comment, and share your favorite open-source tools with the FOSS CEV community.
                            </p>

                            <Link
                                href="/picks/signin"
                                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                                style={{
                                    background: 'linear-gradient(135deg, #D85A30, #e06b3a)',
                                    color: '#fff',
                                    boxShadow: '0 4px 20px rgba(216, 90, 48, 0.2)',
                                }}
                                onClick={onClose}
                            >
                                <LogIn size={16} />
                                Sign In / Sign Up
                            </Link>

                            <p className="text-xs text-gray-600 text-center mt-4">
                                We accept @cev.ac.in, @gmail.com, @outlook.com, and @yahoo.com emails
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
