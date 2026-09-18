"use client";

import { useState } from 'react';
import AdminTeamList from '@/components/admin/AdminTeamList';
import AdminEventList from '@/components/admin/AdminEventList';
import AdminContentList from '@/components/admin/AdminContentList';
import AdminGalleryList from '@/components/admin/AdminGalleryList';
import AdminFinanceList from '@/components/admin/AdminFinanceList';
import AdminPicksList from '@/components/admin/AdminPicksList';
import AdminRegistrationsList from '@/components/admin/AdminRegistrationsList';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'events' | 'team' | 'registrations' | 'content' | 'gallery' | 'finances' | 'picks'>('events');

    return (
        <div className="space-y-6">
            <header className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 to-gray-950 p-5 shadow-xl sm:p-7">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent sm:text-3xl">
                    Dashboard
                </h2>
                <p className="text-gray-400 mt-2">Manage your community content</p>
            </header>

            <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            <div className="flex min-w-max gap-1 rounded-xl border border-white/10 bg-gray-950/70 p-1.5">
                <button
                    onClick={() => setActiveTab('events')}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${activeTab === 'events'
                        ? 'bg-primary/15 text-primary shadow-sm'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                >
                    Events
                </button>
                <button
                    onClick={() => setActiveTab('team')}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${activeTab === 'team'
                        ? 'bg-primary/15 text-primary shadow-sm'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                >
                    Team Members
                </button>
                <button
                    onClick={() => setActiveTab('registrations')}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${activeTab === 'registrations'
                        ? 'bg-primary/15 text-primary shadow-sm'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                >
                    Registrations
                </button>
                <button
                    onClick={() => setActiveTab('content')}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${activeTab === 'content'
                        ? 'bg-primary/15 text-primary shadow-sm'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                >
                    Site Content
                </button>
                <button
                    onClick={() => setActiveTab('gallery')}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${activeTab === 'gallery'
                        ? 'bg-primary/15 text-primary shadow-sm'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                >
                    Gallery
                </button>
                <button
                    onClick={() => setActiveTab('finances')}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${activeTab === 'finances'
                        ? 'bg-primary/15 text-primary shadow-sm'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                >
                    Finances
                </button>
                <button
                    onClick={() => setActiveTab('picks')}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${activeTab === 'picks'
                        ? 'bg-[#D85A30]/15 text-[#D85A30] shadow-sm'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                >
                    Picks
                </button>
            </div>
            </div>

            <div className="mt-8">
                {activeTab === 'events' && <AdminEventList />}
                {activeTab === 'team' && <AdminTeamList />}
                {activeTab === 'registrations' && <AdminRegistrationsList />}
                {activeTab === 'content' && <AdminContentList />}
                {activeTab === 'gallery' && <AdminGalleryList />}
                {activeTab === 'finances' && <AdminFinanceList />}
                {activeTab === 'picks' && <AdminPicksList />}
            </div>
        </div>
    );
}
