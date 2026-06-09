"use client";

import { useEffect } from 'react';
import Lenis from 'lenis';

export function SmoothScroll({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            wheelMultiplier: 1,
            touchMultiplier: 2,
        });

        let rafId: number;

        function raf(time: number) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }

        // Delay starting Lenis until after initial paint to avoid fighting Chrome's compositor during load
        const startTimer = setTimeout(() => {
            rafId = requestAnimationFrame(raf);
        }, 100);

        return () => {
            clearTimeout(startTimer);
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}
