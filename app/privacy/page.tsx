"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
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
                            PRIVACY POLICY
                        </h1>
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary" />
                            <p className="text-xl text-primary font-mono">
                                // DATA PROTECTION
                            </p>
                            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary" />
                        </div>
                    </div>

                    <div className="prose prose-invert prose-green max-w-none space-y-8">

                        <div className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-primary/50 transition-colors">
                            <h2 className="text-2xl font-bold text-white mb-4 font-display text-primary flex items-center gap-2">
                                <span className="text-primary">//</span> Collection of Data
                            </h2>
                            <p className="text-gray-300">
                                Currently, we <strong className="text-white">do not</strong> collect any personal data from visitors to our website. You can browse our site anonymously without creating an account.
                            </p>
                            <p className="text-gray-300 mt-2">
                                We only store public event data and information regarding our team members, which is displayed publicly on the site to facilitate community engagement.
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-primary/50 transition-colors">
                            <h2 className="text-2xl font-bold text-white mb-4 font-display text-primary flex items-center gap-2">
                                <span className="text-primary">//</span> Cookies & Tracking
                            </h2>
                            <p className="text-gray-300">
                                FOSS CEV respects your privacy. We <strong className="text-white">do not</strong> use cookies for advertising, tracking, or marketing purposes.
                            </p>
                            <p className="text-gray-300 mt-2">
                                Any local storage used by the website is strictly for functional purposes (like remembering your theme preference or minimizing repeat animations) and is not shared with third parties.
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-primary/50 transition-colors">
                            <h2 className="text-2xl font-bold text-white mb-4 font-display text-primary flex items-center gap-2">
                                <span className="text-primary">//</span> Third-Party Services
                            </h2>
                            <p className="text-gray-300">
                                Our website may contain links to external sites (such as GitHub, LinkedIn, or registration forms). We are not responsible for the privacy practices or content of these external sites. We encourage you to review their privacy policies.
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-primary/50 transition-colors">
                            <h2 className="text-2xl font-bold text-white mb-4 font-display text-primary flex items-center gap-2">
                                <span className="text-primary">//</span> Contact Us
                            </h2>
                            <p className="text-gray-300">
                                If you have any questions about this Privacy Policy, please contact us at <span className="text-primary font-mono">fossclubcev@cev.ac.in</span>.
                            </p>
                        </div>

                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-sm text-gray-500 font-mono">
                            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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
