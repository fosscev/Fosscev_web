"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Image from "next/image";

const TeamMember = ({ name, role, index }: { name: string, role: string, index: number }) => {
    // Calculate position for 2x2 grid
    // index 0: top-left (0,0)
    // index 1: top-right (0, 1)
    // index 2: bottom-left (1, 0)
    // index 3: bottom-right (1, 1)
    const row = Math.floor(index / 2);
    const col = index % 2;

    return (
        <div className="group relative p-6 bg-surface border border-white/10 hover:border-primary transition-all duration-300">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Avatar Container */}
            <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(0,230,118,0.4)] transition-all duration-300">
                <div
                    className="absolute w-[200%] h-[200%]"
                    style={{
                        top: `${-row * 100}%`,
                        left: `${-col * 100}%`
                    }}
                >
                    <Image
                        src="/team_avatars.png"
                        alt={name}
                        fill
                        className="object-cover"
                    />
                </div>
            </div>

            <div className="text-center relative z-10">
                <h3 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-primary transition-colors">
                    {name}
                </h3>
                <div className="h-0.5 w-12 bg-primary/50 mx-auto mb-3" />
                <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">
                    {role}
                </p>
            </div>

            {/* Deco corners */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
};

export default function TeamPage() {
    const team = [
        { name: "Ghost_Protocol", role: "Lead Developer" },
        { name: "Void_Walker", role: "Security Researcher" },
        { name: "System_Crash", role: "Infrastructure" },
        { name: "Neon_Samurai", role: "Community Manager" },
    ];

    return (
        <main className="min-h-screen bg-background text-white selection:bg-primary selection:text-black">
            <Navbar />

            <section className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="mb-16">
                    <h1 className="text-6xl md:text-8xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 mb-6">
                        CORE_TEAM
                    </h1>
                    <p className="text-xl text-gray-400 font-mono max-w-2xl border-l-2 border-primary pl-6">
                        // MEET THE MINDS BEHIND THE CODE<br />
                        // EXECUTING VISION.EXE...
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {team.map((member, i) => (
                        <TeamMember
                            key={i}
                            index={i}
                            name={member.name}
                            role={member.role}
                        />
                    ))}
                </div>

                {/* Additional Info / Join Call */}
                <div className="mt-20 p-8 border border-white/10 bg-surface/50 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 0H100V100H0V0Z" stroke="#00E676" strokeWidth="2" />
                            <path d="M20 20H80V80H20V20Z" stroke="#00E676" strokeWidth="2" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-display font-bold text-white mb-4">
                        Do you have what it takes?
                    </h3>
                    <p className="text-gray-400 mb-6 font-mono">
                        We are strictly looking for contributors who are passionate about FOSS. <br />
                        Join the collective.
                    </p>
                    <button className="bg-transparent border border-primary text-primary hover:bg-primary hover:text-black px-6 py-3 font-bold transition-all duration-300 uppercase font-display">
                        Initialize_Application
                    </button>
                </div>
            </section>

            <Footer />
        </main>
    );
}
