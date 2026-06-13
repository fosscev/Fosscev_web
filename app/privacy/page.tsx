"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
    return (
        <main className="relative min-h-screen text-white selection:bg-primary selection:text-black overflow-hidden">
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
                                You can browse most of our site anonymously. However, our <strong className="text-white">Open Source Picks</strong> feature requires an account, and we collect the following data when you register:
                            </p>
                            <ul className="list-disc pl-6 space-y-1.5 text-gray-300 mt-3 marker:text-primary">
                                <li><strong className="text-white">Email address</strong> — used for account verification (OTP) and account recovery</li>
                                <li><strong className="text-white">Username</strong> — auto-derived from your email prefix, displayed publicly on posts and comments</li>
                                <li><strong className="text-white">Posts, votes, and comments</strong> — content you create is stored and displayed publicly</li>
                                <li><strong className="text-white">Flair preferences</strong> — your voting patterns are used to personalize your &quot;For You&quot; feed (not shared with third parties)</li>
                            </ul>
                            <p className="text-gray-300 mt-3">
                                We also store public event data and information regarding our team members, which is displayed publicly on the site.
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-primary/50 transition-colors">
                            <h2 className="text-2xl font-bold text-white mb-4 font-display text-primary flex items-center gap-2">
                                <span className="text-primary">//</span> Authentication &amp; Security
                            </h2>
                            <p className="text-gray-300">
                                Account authentication is handled by <strong className="text-white">Supabase Auth</strong> (an open-source platform). Your password is hashed using bcrypt and is <strong className="text-white">never stored in plain text</strong>.
                            </p>
                            <ul className="list-disc pl-6 space-y-1.5 text-gray-300 mt-3 marker:text-primary">
                                <li>Email verification uses a <strong className="text-white">6-digit OTP</strong> with a 10-minute expiry, sent only during account creation</li>
                                <li>Sessions use <strong className="text-white">HTTP-only cookies</strong> with the PKCE security flow to prevent token interception</li>
                                <li>Rate limiting is applied to sign-in attempts, OTP requests, posts, comments, and votes to prevent abuse</li>
                                <li>We accept registrations only from verified email domains (@cev.ac.in, @gmail.com, @outlook.com, @yahoo.com) to prevent spam</li>
                            </ul>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-primary/50 transition-colors">
                            <h2 className="text-2xl font-bold text-white mb-4 font-display text-primary flex items-center gap-2">
                                <span className="text-primary">//</span> Data Storage
                            </h2>
                            <p className="text-gray-300">
                                All user data is stored in a <strong className="text-white">Supabase-managed PostgreSQL database</strong> with Row Level Security (RLS) policies to ensure users can only access and modify their own data. Supabase servers are hosted on AWS infrastructure.
                            </p>
                            <p className="text-gray-300 mt-2">
                                We retain your data for as long as your account is active. You may request account deletion by contacting us, and all associated data (posts, comments, votes) will be permanently removed.
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-primary/50 transition-colors">
                            <h2 className="text-2xl font-bold text-white mb-4 font-display text-primary flex items-center gap-2">
                                <span className="text-primary">//</span> Cookies &amp; Tracking
                            </h2>
                            <p className="text-gray-300">
                                FOSS CEV respects your privacy. We <strong className="text-white">do not</strong> use cookies for advertising, tracking, or marketing purposes.
                            </p>
                            <p className="text-gray-300 mt-2">
                                We use <strong className="text-white">essential cookies only</strong>: authentication session tokens (HTTP-only, SameSite) for Open Source Picks login, and local storage for functional purposes like theme preferences. These are never shared with third parties.
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-primary/50 transition-colors">
                            <h2 className="text-2xl font-bold text-white mb-4 font-display text-primary flex items-center gap-2">
                                <span className="text-primary">//</span> Third-Party Services
                            </h2>
                            <p className="text-gray-300">
                                We use the following third-party services:
                            </p>
                            <ul className="list-disc pl-6 space-y-1.5 text-gray-300 mt-3 marker:text-primary">
                                <li><strong className="text-white">Supabase</strong> — database hosting, authentication, and email OTP delivery (<a href="https://supabase.com/privacy" target="_blank" className="text-primary hover:underline">Supabase Privacy Policy</a>)</li>
                                <li><strong className="text-white">Google Fonts</strong> — typography (Inter, JetBrains Mono)</li>
                            </ul>
                            <p className="text-gray-300 mt-3">
                                Our website may also contain links to external sites (GitHub, LinkedIn, etc.). We are not responsible for the privacy practices of these external sites.
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-primary/50 transition-colors">
                            <h2 className="text-2xl font-bold text-white mb-4 font-display text-primary flex items-center gap-2">
                                <span className="text-primary">//</span> Your Rights
                            </h2>
                            <p className="text-gray-300">
                                You have the right to:
                            </p>
                            <ul className="list-disc pl-6 space-y-1.5 text-gray-300 mt-3 marker:text-primary">
                                <li>Access the personal data we hold about you</li>
                                <li>Request correction of inaccurate data</li>
                                <li>Request deletion of your account and all associated data</li>
                                <li>Withdraw from the Open Source Picks platform at any time</li>
                            </ul>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-primary/50 transition-colors">
                            <h2 className="text-2xl font-bold text-white mb-4 font-display text-primary flex items-center gap-2">
                                <span className="text-primary">//</span> Contact Us
                            </h2>
                            <p className="text-gray-300">
                                If you have any questions about this Privacy Policy or want to exercise your data rights, please contact us at <span className="text-primary font-mono">fossclubcev@cev.ac.in</span>.
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
