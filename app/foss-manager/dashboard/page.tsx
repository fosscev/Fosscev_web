"use client";

import { useState } from 'react';
import AdminTeamList from '@/components/admin/AdminTeamList';
import AdminEventList from '@/components/admin/AdminEventList';
import AdminContentList from '@/components/admin/AdminContentList';
import AdminGalleryList from '@/components/admin/AdminGalleryList';
import AdminFinanceList from '@/components/admin/AdminFinanceList';
import AdminPicksList from '@/components/admin/AdminPicksList';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'events' | 'team' | 'content' | 'gallery' | 'finances' | 'picks'>('events');

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Dashboard
                </h2>
                <p className="text-gray-400 mt-2">Manage your community content</p>
            </header>

            <div className="flex space-x-4 border-b border-gray-800 pb-1">
                <button
                    onClick={() => setActiveTab('events')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'events'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                >
                    Events
                </button>
                <button
                    onClick={() => setActiveTab('team')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'team'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                >
                    Team Members
                </button>
                <button
                    onClick={() => setActiveTab('content')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'content'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                >
                    Site Content
                </button>
                <button
                    onClick={() => setActiveTab('gallery')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'gallery'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                >
                    Gallery
                </button>
                <button
                    onClick={() => setActiveTab('finances')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'finances'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                >
                    Finances
                </button>
                <button
                    onClick={() => setActiveTab('picks')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'picks'
                        ? 'border-[#D85A30] text-[#D85A30]'
                        : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                >
                    Picks
                </button>
            </div>

            <div className="mt-8">
                {activeTab === 'events' && <AdminEventList />}
                {activeTab === 'team' && <AdminTeamList />}
                {activeTab === 'content' && <AdminContentList />}
                {activeTab === 'gallery' && <AdminGalleryList />}
                {activeTab === 'finances' && <AdminFinanceList />}
                {activeTab === 'picks' && <AdminPicksList />}
            </div>
        </div>
    );
}
