"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const QUOTES = [
    "Talk is cheap. Show me the code. — Linus Torvalds",
    "Given enough eyeballs, all bugs are shallow. — Eric S. Raymond",
    "Programs must be written for people to read, and only incidentally for machines to execute. — Hal Abelson",
    "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. — Martin Fowler",
    "Innovation happens when anyone can build on the work of others. — Open Source Mantra",
    "Open source is about collaborating; not competing. — Unknown"
];

export function LoadingScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [quoteIndex, setQuoteIndex] = useState(0);

    useEffect(() => {
        // Randomize quote on mount to keep it fresh
        setQuoteIndex(Math.floor(Math.random() * QUOTES.length));

        // Simulate progress and ensure we stay long enough to be "interesting"
        // It hides when window load is complete AND minimum time (2.5s) has passed
        let isWindowLoaded = document.readyState === "complete";
        
        const handleLoad = () => {
            isWindowLoaded = true;
        };
        
        if (!isWindowLoaded) {
            window.addEventListener("load", handleLoad);
        }

        const minTime = 2500; // minimum 2.5s to read quote
        const startTime = Date.now();
        
        const updateProgress = setInterval(() => {
            const elapsed = Date.now() - startTime;
            
            // Progress goes up to 90% based on time
            let newProgress = Math.min(90, (elapsed / minTime) * 90);
            
            if (isWindowLoaded && elapsed >= minTime) {
                newProgress = 100;
                clearInterval(updateProgress);
                setTimeout(() => setIsLoading(false), 400); // Small pause at 100%
            }
            
            setProgress(Math.floor(newProgress));
        }, 50);

        return () => {
            window.removeEventListener("load", handleLoad);
            clearInterval(updateProgress);
        };
    }, []);

    // Also change the quote every few seconds if it's taking remarkably long
    useEffect(() => {
        if (!isLoading) return;
        const quoteTimer = setInterval(() => {
            setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
        }, 3000);
        return () => clearInterval(quoteTimer);
    }, [isLoading]);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    key="loader"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background text-white overflow-hidden"
                >
                    {/* Background Noise & Overlay */}
                    <div className="absolute inset-0 bg-[#050505]">
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,230,118,0.08)_0%,transparent_50%)]"></div>
                        <div className="absolute inset-0 hacker-grid opacity-20"></div>
                    </div>

                    {/* Central Content */}
                    <div className="relative z-10 flex flex-col items-center w-full max-w-2xl px-6">
                        
                        {/* Fake Terminal Layout */}
                        <div className="w-full bg-black/40 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md shadow-2xl">
                            {/* Window Header */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                <div className="ml-2 text-xs font-mono text-gray-500 flex-1 text-center">boot_sequence.sh</div>
                            </div>
                            
                            {/* Terminal Body */}
                            <div className="p-6 md:p-8 flex flex-col items-center">
                                {/* Percentage & Logo */}
                                <div className="flex flex-col items-center mb-8">
                                    <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
                                        <motion.svg 
                                            className="w-full h-full text-primary absolute" 
                                            viewBox="0 0 100 100"
                                        >
                                            <circle 
                                                className="text-white/10 stroke-current" 
                                                strokeWidth="2" 
                                                cx="50" cy="50" r="40" 
                                                fill="transparent"
                                            ></circle>
                                            <motion.circle 
                                                className="text-primary stroke-current" 
                                                strokeWidth="4" 
                                                strokeLinecap="round" 
                                                cx="50" cy="50" r="40" 
                                                fill="transparent"
                                                strokeDasharray="251.2"
                                                initial={{ strokeDashoffset: 251.2 }}
                                                animate={{ strokeDashoffset: 251.2 - (progress / 100) * 251.2 }}
                                                transition={{ duration: 0.2, ease: "linear" }}
                                            ></motion.circle>
                                        </motion.svg>
                                        <div className="text-2xl font-display font-light text-white z-10">
                                            {progress}<span className="text-primary text-lg">%</span>
                                        </div>
                                    </div>
                                    <motion.div 
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        className="text-xs font-mono text-primary tracking-widest uppercase"
                                    >
                                        Initializing FOSS CEV
                                    </motion.div>
                                </div>

                                {/* Dynamic Quotes */}
                                <div className="min-h-[80px] flex items-center justify-center text-center">
                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={quoteIndex}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.5 }}
                                            className="text-sm md:text-base font-mono text-gray-400 italic"
                                        >
                                            "{QUOTES[quoteIndex].split('—')[0].trim()}"
                                            <br />
                                            <span className="text-xs text-primary font-bold not-italic mt-2 inline-block">
                                                — {QUOTES[quoteIndex].split('—')[1]?.trim()}
                                            </span>
                                        </motion.p>
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Progress Bar Line */}
                            <div className="h-1 w-full bg-white/5 relative overflow-hidden">
                                <motion.div 
                                    className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-primary/50 to-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.2 }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
