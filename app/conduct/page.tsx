"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function ConductPage() {
    return (
        <main className="relative min-h-screen bg-background text-white selection:bg-primary selection:text-black overflow-hidden">
            {/* Animated Grid Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 hacker-grid opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"></div>
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at center, rgba(0, 230, 118, 0.15) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    backgroundPosition: '0 0, 20px 20px'
                }}></div>
            </div>

            <div className="relative z-10">
                <Navbar />

                <section className="pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto overflow-visible">
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl md:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-white mb-6 animate-gradient">
                            CODE OF CONDUCT
                        </h1>
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary" />
                            <p className="text-xl text-primary font-mono">
                                // COMMUNITY STANDARDS
                            </p>
                            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary" />
                        </div>
                    </div>

                    <div className="prose prose-invert prose-green max-w-none">
                        <p className="text-lg text-gray-300 mb-8 font-mono border-l-4 border-primary pl-4">
                            We pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-8 mb-4 font-display text-primary">Our Standards</h2>
                        <p className="text-gray-400 mb-4">
                            Examples of behavior that contributes to creating a positive environment include:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-300 marker:text-primary">
                            <li>Using welcoming and inclusive language</li>
                            <li>Being respectful of differing viewpoints and experiences</li>
                            <li>Gracefully accepting constructive criticism</li>
                            <li>Focusing on what is best for the community</li>
                            <li>Showing empathy towards other community members</li>
                        </ul>

                        <p className="text-gray-400 mt-6 mb-4">
                            Examples of unacceptable behavior by participants include:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-300 marker:text-red-500">
                            <li>The use of sexualized language or imagery and unwelcome sexual attention or advances</li>
                            <li>Trolling, insulting/derogatory comments, and personal or political attacks</li>
                            <li>Public or private harassment</li>
                            <li>Publishing others' private information, such as a physical or electronic address, without explicit permission</li>
                            <li>Other conduct which could reasonably be considered inappropriate in a professional setting</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-white mt-8 mb-4 font-display text-primary">Enforcement</h2>
                        <p className="text-gray-300 mb-4">
                            Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team at <span className="text-primary font-mono">fossclubcev@cev.ac.in</span>. All complaints will be reviewed and investigated and will result in a response that is deemed necessary and appropriate to the circumstances. The project team is obligated to maintain confidentiality with regard to the reporter of an incident.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-8 mb-4 font-display text-primary">Attribution</h2>
                        <p className="text-sm text-gray-500">
                            This Code of Conduct is adapted from the <a href="https://www.contributor-covenant.org" target="_blank" className="text-primary hover:underline">Contributor Covenant</a>, version 2.1.
                        </p>
                    </div>
                </section>

                <Footer />
            </div>

            <style jsx>{`
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient {
                    background-size: 200% auto;
                    animation: gradient 3s ease infinite;
                }
            `}</style>
        </main>
    );
}
