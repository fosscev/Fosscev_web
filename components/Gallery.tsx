"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";

const galleryImages = [
    // This would typically come from a fetch call
    { id: 1, title: "HackDay CEV", event: "Hackathon 2023", image: "/gallery/1.jpg" },
    { id: 2, title: "FOSS Meetup", event: "Community Event 2023", image: "/gallery/2.jpg" },
    { id: 3, title: "Intro to Git & GitHub", event: "Workshop 2023", image: "/gallery/3.jpg" },
    { id: 4, title: "Web Dev Bootcamp", event: "Workshop 2024", image: "/gallery/4.jpg" },
    { id: 5, title: "Python for Beginners", event: "Workshop 2024", image: "/gallery/5.jpg" },
    { id: 6, title: "Capture The Flag", event: "Cybersecurity 2024", image: "/gallery/6.jpg" },
];

const SkeletonPlaceholder = () => (
    <div className="relative h-[60vh] w-[400px] md:w-[500px] shrink-0 overflow-hidden bg-surface/80 border border-glass-border rounded-xl">
        <div 
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
            style={{ animation: 'var(--animate-shimmer) 2s infinite' }}
        />
        <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_10px_rgba(0,230,118,0.1)]"></div>
    </div>
);

const GalleryCard = ({ item }: { item: typeof galleryImages[0] }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    return (
        <div
            className="group relative h-[60vh] w-[400px] md:w-[500px] shrink-0 overflow-hidden bg-surface border border-white/10 rounded-xl transition-all duration-500 hover:scale-105"
        >
            <AnimatePresence>
                {isLoading && !hasError && (
                    <motion.div
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <SkeletonPlaceholder />
                    </motion.div>
                )}
            </AnimatePresence>

            {hasError && (
                 <div className="absolute inset-0 flex items-center justify-center bg-surface/90">
                    <div className="text-center text-gray-400">
                        <span className="text-4xl">🖼</span>
                        <p className="mt-2 font-mono">Image unavailable</p>
                    </div>
                </div>
            )}
            
            <AnimatePresence>
                {!hasError && (
                     <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isLoading ? 0 : 1 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 400px, 500px"
                            onLoad={() => setIsLoading(false)}
                            onError={() => {
                                setIsLoading(false);
                                setHasError(true);
                            }}
                            unoptimized // Assuming high-quality source images
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 w-full p-6">
                    <p className="text-primary font-mono text-sm mb-2">{item.event}</p>
                    <h4 className="text-white font-bold text-2xl">{item.title}</h4>
                </div>
            </div>

            {/* Glowing border effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 rounded-xl shadow-[0_0_30px_rgba(0,230,118,0.3)]"></div>
            </div>
        </div>
    );
};

export function Gallery() {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ["1%", "-95%"]);
    
    // Optional Enhancement: If data were fetched, you'd check a loading state here.
    // const { data, isLoading } = useQuery(...);
    // For now, we use the hardcoded array.

    return (
        <section ref={targetRef} className="relative h-[300vh] bg-background">
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
                <h2 className="absolute top-10 left-10 text-4xl md:text-6xl font-display font-bold text-white z-20 tracking-tighter uppercase mix-blend-difference">
                    Gallery_
                </h2>
                <motion.div style={{ x }} className="flex gap-10 pl-10 pr-10">
                    {galleryImages.map((item) => (
                        <GalleryCard key={item.id} item={item} />
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
