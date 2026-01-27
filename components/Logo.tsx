"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function Logo() {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-6 left-6 z-40"
        >
            <Link href="/" className="block group">
                <Image
                    src="/logo.png"
                    alt="FOSS Club CEV"
                    width={160}
                    height={45}
                    className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                    priority
                />
            </Link>
        </motion.div>
    );
}
