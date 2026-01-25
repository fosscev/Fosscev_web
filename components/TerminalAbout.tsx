"use client";

import { motion } from "framer-motion";

export function TerminalAbout() {
    return (
        <section className="py-20 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto terminal-window rounded-lg overflow-hidden border border-white/10 bg-[#0c0c0c]"
            >
                {/* Terminal Header */}
                <div className="bg-white/5 px-4 py-2 flex items-center gap-2 border-b border-white/10">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="flex-1 text-center">
                        <span className="text-xs text-gray-500 font-display">bash — 80x24</span>
                    </div>
                </div>

                {/* Terminal Content */}
                <div className="p-6 font-display text-sm md:text-base overflow-x-auto">
                    <div className="space-y-4">
                        <div className="flex">
                            <span className="text-primary mr-2">➜</span>
                            <span className="text-blue-400 mr-2">~</span>
                            <span className="text-white">cat about_us.txt</span>
                        </div>

                        <div className="text-gray-300 pl-4 space-y-2 border-l-2 border-white/10">
                            <p>
                                <span className="text-gray-500"># We are a community of open source enthusiasts.</span>
                            </p>
                            <p>
                                <span className="text-gray-500"># Our mission is to promote FOSS ideology.</span>
                            </p>
                            <br />
                            <p className="text-white">
                                We believe in the power of <span className="text-primary">collaboration</span> and <span className="text-primary">transparency</span>.
                                FOSS Community is a student-run organization dedicated to fostering
                                the open-source culture in our college.
                            </p>
                            <br />
                            <p>
                                <span className="text-purple-400">const</span> <span className="text-yellow-300">goal</span> = <span className="text-green-300">&quot;Build better software, together&quot;</span>;
                            </p>
                        </div>

                        <div className="flex items-center">
                            <span className="text-primary mr-2">➜</span>
                            <span className="text-blue-400 mr-2">~</span>
                            <span className="w-2 h-4 bg-primary animate-pulse" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
