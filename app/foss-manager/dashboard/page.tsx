"use client";

import { useState } from 'react';
import AdminTeamList from '@/components/admin/AdminTeamList';
import AdminEventList from '@/components/admin/AdminEventList';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'events' | 'team'>('events');

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
            </div>

            <div className="mt-8">
                {activeTab === 'events' ? <AdminEventList /> : <AdminTeamList />}
            </div>
        </div>
    );
}
