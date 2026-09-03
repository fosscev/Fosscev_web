"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface GalleryItem {
    id: string | number;
    title: string;
    event: string;
    image: string;
}

const EmptyGalleryBox = () => (
    <div className="h-[60vh] w-[400px] md:w-[500px] shrink-0 border-2 border-dashed border-gray-800 rounded-xl flex items-center justify-center bg-gray-900/20">
        <div className="text-gray-500 font-mono text-sm tracking-widest uppercase">Loading Gallery...</div>
    </div>
);

const GalleryCard = ({ item }: { item: GalleryItem }) => {
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
                        className="absolute inset-0 bg-gray-900 flex items-center justify-center"
                    >
                        <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
                    </motion.div>
                )}
            </AnimatePresence>

            {hasError && (
                 <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-center text-gray-500">
                        <span className="text-3xl">🖼</span>
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
                            unoptimized
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
    
    const [images, setImages] = useState<GalleryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const { data: files, error } = await supabase.storage
                    .from('event-photos')
                    .list('', { limit: 12, sortBy: { column: 'created_at', order: 'desc' } });

                if (!error && files) {
                    const validFiles = files.filter(f => f.name && !f.name.startsWith('.') && f.id);
                    const formatted = validFiles.map((file, idx) => {
                        const { data: urlData } = supabase.storage.from('event-photos').getPublicUrl(file.name);
                        return {
                            id: file.id || String(idx),
                            title: file.name.split('.')[0].replace(/_/g, ' '),
                            event: "Community Gallery",
                            image: urlData.publicUrl
                        };
                    });
                    setImages(formatted);
                }
            } catch (err) {
                console.error("Error fetching gallery", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchImages();
    }, []);

    return (
        <section ref={targetRef} className="relative h-[300vh] bg-background">
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
                <h2 className="absolute top-10 left-10 text-4xl md:text-6xl font-display font-bold text-white z-20 tracking-tighter uppercase mix-blend-difference">
                    Gallery_
                </h2>
                <motion.div style={{ x }} className="flex gap-10 pl-10 pr-10">
                    {isLoading ? (
                        <>
                            <EmptyGalleryBox />
                            <EmptyGalleryBox />
                            <EmptyGalleryBox />
                            <EmptyGalleryBox />
                        </>
                    ) : images.length > 0 ? (
                        images.map((item) => (
                            <GalleryCard key={item.id} item={item} />
                        ))
                    ) : (
                        <div className="text-gray-400 text-xl font-mono mt-20 ml-20">No images available in gallery.</div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
