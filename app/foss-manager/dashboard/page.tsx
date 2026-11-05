"use client";

import { useEffect, useState, type ReactNode } from 'react';
import { CalendarDays, ClipboardList, Images, UsersRound, Wallet, Sparkles, Menu, X } from 'lucide-react';
import AdminTeamList from '@/components/admin/AdminTeamList';
import AdminEventList from '@/components/admin/AdminEventList';
import AdminGalleryList from '@/components/admin/AdminGalleryList';
import AdminFinanceList from '@/components/admin/AdminFinanceList';
import AdminPicksList from '@/components/admin/AdminPicksList';
import AdminRegistrationsList from '@/components/admin/AdminRegistrationsList';

const navigation = [
    { id: 'events', label: 'Events', Icon: CalendarDays, description: 'Create and manage events' },
    { id: 'registrations', label: 'Registrations', Icon: ClipboardList, description: 'Review form responses' },
    { id: 'team', label: 'Team', Icon: UsersRound, description: 'Manage members and profiles' },
    { id: 'gallery', label: 'Gallery', Icon: Images, description: 'Update community photos' },
    { id: 'finances', label: 'Finances', Icon: Wallet, description: 'Publish finance reports' },
    { id: 'picks', label: 'Picks', Icon: Sparkles, description: 'Moderate community picks' },
] as const;

type AdminSection = (typeof navigation)[number]['id'];

const sectionContent: Record<AdminSection, ReactNode> = {
    events: <AdminEventList />,
    registrations: <AdminRegistrationsList />,
    team: <AdminTeamList />,
    gallery: <AdminGalleryList />,
    finances: <AdminFinanceList />,
    picks: <AdminPicksList />,
};

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<AdminSection>('events');
    const [isNavOpen, setIsNavOpen] = useState(false);
    const activeItem = navigation.find((item) => item.id === activeTab)!;
    const ActiveIcon = activeItem.Icon;

    useEffect(() => {
        if (!isNavOpen) return;
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsNavOpen(false);
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', closeOnEscape);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', closeOnEscape);
        };
    }, [isNavOpen]);

    const renderNavigation = () => navigation.map(({ id, label, Icon }) => {
        const isActive = activeTab === id;
        return (
            <button
                key={id}
                type="button"
                onClick={() => { setActiveTab(id); setIsNavOpen(false); }}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${isActive ? 'bg-primary/12 text-primary ring-1 ring-inset ring-primary/20' : 'text-gray-400 hover:bg-white/[0.045] hover:text-white'}`}
            >
                <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-primary' : 'text-gray-500 group-hover:text-gray-300'}`} />
                <span>{label}</span>
                {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
            </button>
        );
    });

    return (
        <div className="mx-auto max-w-[1600px] space-y-6 sm:space-y-8">
            <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#101714] via-gray-950 to-black p-5 shadow-2xl sm:p-8">
                <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
                <div className="relative">
                    <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-primary/80">FOSS CEV · CONTROL CENTER</p>
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Admin workspace</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">Manage events, submissions, people, and community resources from one place.</p>
                    <button type="button" onClick={() => setIsNavOpen(true)} aria-expanded={isNavOpen} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm font-medium text-gray-200 transition hover:border-primary/30 hover:text-primary lg:hidden">
                        <Menu className="h-4 w-4" /> Sections <span className="text-gray-500">·</span> {activeItem.label}
                    </button>
                </div>
            </header>

            <div className="grid min-w-0 gap-5 lg:grid-cols-[230px_minmax(0,1fr)] xl:gap-7">
                <nav aria-label="Admin sections" className="hidden h-fit rounded-2xl border border-white/10 bg-gray-950/80 p-2 lg:sticky lg:top-24 lg:block">
                    <div className="flex flex-col gap-1">{renderNavigation()}</div>
                </nav>

                <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e0d]/85 shadow-xl sm:rounded-3xl">
                    <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-4 sm:px-6 sm:py-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                            <ActiveIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="truncate text-base font-semibold text-white sm:text-lg">{activeItem.label}</h3>
                            <p className="hidden text-xs text-gray-500 sm:block">{activeItem.description}</p>
                        </div>
                    </div>
                    <div className="min-w-0 p-3 sm:p-5 lg:p-6">
                        {sectionContent[activeTab]}
                    </div>
                </section>
            </div>

            {isNavOpen && (
                <div className="fixed inset-0 z-[70] lg:hidden" role="presentation">
                    <button type="button" onClick={() => setIsNavOpen(false)} aria-label="Close section menu" className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <nav aria-label="Admin sections" aria-modal="true" role="dialog" className="absolute inset-y-0 left-0 flex w-[min(84vw,340px)] flex-col border-r border-white/10 bg-[#080c0a] p-4 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                            <div><p className="text-sm font-semibold text-white">FOSS Manager</p><p className="mt-1 text-xs text-gray-500">Choose a section</p></div>
                            <button type="button" onClick={() => setIsNavOpen(false)} aria-label="Close section menu" className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="flex flex-col gap-1">{renderNavigation()}</div>
                    </nav>
                </div>
            )}
        </div>
    );
}
