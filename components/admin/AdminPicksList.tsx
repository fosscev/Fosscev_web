"use client";

import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { supabase } from '@/lib/supabase';
import { FLAIR_COLORS, type Flair } from '@/lib/picks-db';
import { Trash2, RotateCcw, AlertTriangle, Search, Filter, MessageCircle } from 'lucide-react';
=======
import { FLAIR_COLORS, type Flair } from '@/lib/picks-db';
import { Trash2, RotateCcw, AlertTriangle, Search, Filter, MessageCircle, ThumbsUp, Flag } from 'lucide-react';
import { useAdminAuth } from './AdminAuthProvider';
>>>>>>> 448d8de (feat: enhance picks system and event details)

interface AdminPost {
    id: string;
    title: string;
    tool_name: string;
    description: string;
    flair: string;
    license: string;
    score: number;
    is_removed: boolean;
    removed_reason: string | null;
    created_at: string;
    author: { id: string; username: string; email: string } | null;
    comment_count: number;
<<<<<<< HEAD
}

type FilterMode = 'all' | 'flagged' | 'removed';
=======
    report_count: number;
    reports: { reason: string; created_at: string }[];
}

type FilterMode = 'all' | 'flagged' | 'removed' | 'active'; // keep 'flagged' as tab value but label it 'Reported'
type ModerationStatus = 'active' | 'removed' | 'reported';
>>>>>>> 448d8de (feat: enhance picks system and event details)

export default function AdminPicksList() {
    const [posts, setPosts] = useState<AdminPost[]>([]);
    const [loading, setLoading] = useState(true);
<<<<<<< HEAD
    const [filter, setFilter] = useState<FilterMode>('all');
=======
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterMode>('active');
>>>>>>> 448d8de (feat: enhance picks system and event details)
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
<<<<<<< HEAD

    useEffect(() => {
        fetchPosts();
    }, [filter, page]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
=======
    const { accessToken } = useAdminAuth();

    useEffect(() => {
        if (accessToken) {
            fetchPosts();
        }
    }, [filter, page, accessToken]);

    const fetchPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!accessToken) return;
>>>>>>> 448d8de (feat: enhance picks system and event details)

            const params = new URLSearchParams({
                filter,
                page: page.toString(),
            });

            const res = await fetch(`/api/picks/admin/posts?${params}`, {
                headers: {
<<<<<<< HEAD
                    'Authorization': `Bearer ${session.access_token}`,
=======
                    'Authorization': `Bearer ${accessToken}`,
>>>>>>> 448d8de (feat: enhance picks system and event details)
                },
            });

            if (res.ok) {
                const data = await res.json();
                setPosts(data.posts);
                setTotal(data.total);
<<<<<<< HEAD
            }
        } catch (err) {
            console.error('Error fetching admin posts:', err);
=======
            } else {
                const errData = await res.json().catch(() => ({}));
                setError(errData.reason || errData.error || 'Failed to retrieve posts from server');
            }
        } catch (err: any) {
            console.error('Error fetching admin posts:', err);
            setError(err.message || 'A network error occurred while contacting the server');
>>>>>>> 448d8de (feat: enhance picks system and event details)
        } finally {
            setLoading(false);
        }
    };

<<<<<<< HEAD
    const handleAction = async (postId: string, action: 'remove' | 'restore', reason?: string) => {
        setActionLoading(postId);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch('/api/picks/admin/posts', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ post_id: postId, action, reason }),
            });

            if (res.ok) {
                fetchPosts();
=======
    const handleAction = async (postId: string, action: 'remove' | 'restore' | 'flag' | 'unflag', reason?: string) => {
        setActionLoading(postId);
        try {
            if (!accessToken) return;

            // For flag/unflag, update score as a moderation signal
            if (action === 'flag') {
                const res = await fetch('/api/picks/admin/posts', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ post_id: postId, action: 'flag' }),
                });
                if (res.ok) fetchPosts();
            } else if (action === 'unflag') {
                const res = await fetch('/api/picks/admin/posts', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ post_id: postId, action: 'unflag' }),
                });
                if (res.ok) fetchPosts();
            } else {
                const res = await fetch('/api/picks/admin/posts', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ post_id: postId, action, reason }),
                });

                if (res.ok) {
                    fetchPosts();
                }
>>>>>>> 448d8de (feat: enhance picks system and event details)
            }
        } catch (err) {
            console.error('Action error:', err);
        } finally {
            setActionLoading(null);
        }
    };

<<<<<<< HEAD
=======
    // Get moderation status
    const getModerationStatus = (post: AdminPost): ModerationStatus => {
        if (post.is_removed) return 'removed';
        if (post.report_count > 0) return 'reported';
        return 'active';
    };

    const getStatusColor = (status: ModerationStatus) => {
        switch (status) {
            case 'active': return 'green';
            case 'reported': return 'yellow';
            case 'removed': return 'red';
        }
    };

>>>>>>> 448d8de (feat: enhance picks system and event details)
    const filteredPosts = search
        ? posts.filter(p =>
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.author?.username.toLowerCase().includes(search.toLowerCase()) ||
            p.tool_name.toLowerCase().includes(search.toLowerCase())
        )
        : posts;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h3 className="text-xl font-bold text-white">Open Source Picks</h3>
                <span className="text-sm text-gray-400">{total} total posts</span>
            </div>

            {/* Filter bar */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
<<<<<<< HEAD
                    {(['all', 'flagged', 'removed'] as FilterMode[]).map(f => (
                        <button
                            key={f}
                            onClick={() => { setFilter(f); setPage(1); }}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === f
                                ? 'bg-[#D85A30]/20 text-[#D85A30]'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {f === 'flagged' && <AlertTriangle size={12} className="inline mr-1" />}
                            {f.charAt(0).toUpperCase() + f.slice(1)}
=======
                    {(['active', 'removed'] as FilterMode[]).map(f => (
                        <button
                            key={f}
                            onClick={() => { setFilter(f); setPage(1); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${filter === f
                                ? 'bg-[#D85A30] text-white'
                                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {f}
>>>>>>> 448d8de (feat: enhance picks system and event details)
                        </button>
                    ))}
                </div>

                <div className="relative flex-1 max-w-xs">
<<<<<<< HEAD
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
=======
                    {/* Search icon placeholder */}
>>>>>>> 448d8de (feat: enhance picks system and event details)
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search posts..."
                        className="w-full pl-9 pr-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#D85A30]/50"
                    />
                </div>
            </div>

            {/* Posts table */}
            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading posts...</div>
<<<<<<< HEAD
=======
            ) : error ? (
                <div className="text-center py-12 text-red-400/90 bg-red-500/5 rounded-xl border border-red-500/10 p-6 max-w-lg mx-auto">
                    <p className="font-semibold mb-2">Moderation Error</p>
                    <p className="text-xs font-mono leading-relaxed">{error}</p>
                </div>
>>>>>>> 448d8de (feat: enhance picks system and event details)
            ) : filteredPosts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    {search ? 'No posts match your search' : 'No posts found'}
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredPosts.map(post => {
                        const flairColor = FLAIR_COLORS[post.flair as Flair] || '#6B7280';
                        return (
                            <div
                                key={post.id}
                                className={`bg-gray-800/30 border rounded-lg p-4 transition-colors ${post.is_removed
                                    ? 'border-red-500/20 opacity-60'
<<<<<<< HEAD
                                    : post.score < -3
=======
                                    : post.report_count > 0
>>>>>>> 448d8de (feat: enhance picks system and event details)
                                        ? 'border-yellow-500/20'
                                        : 'border-gray-700/50'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span
                                                className="px-1.5 py-0.5 rounded text-xs font-mono"
                                                style={{
                                                    backgroundColor: `${flairColor}20`,
                                                    color: flairColor,
                                                }}
                                            >
                                                {post.flair}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                🛠 {post.tool_name}
                                            </span>
                                            <span className="text-xs text-gray-600">·</span>
<<<<<<< HEAD
                                            <span className="text-xs text-gray-500">
                                                Score: <span className={post.score < 0 ? 'text-red-400' : 'text-gray-300'}>{post.score}</span>
=======
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <ThumbsUp size={10} />
                                                <span className={post.score < 0 ? 'text-red-400' : 'text-gray-300'}>{post.score}</span>
>>>>>>> 448d8de (feat: enhance picks system and event details)
                                            </span>
                                            <span className="text-xs text-gray-600">·</span>
                                            <span className="text-xs text-gray-500 flex items-center gap-0.5">
                                                <MessageCircle size={10} />
                                                {post.comment_count}
                                            </span>
                                            {post.is_removed && (
                                                <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                                                    Removed
                                                </span>
                                            )}
                                        </div>

                                        <h4 className="text-sm font-medium text-gray-200 mb-0.5">
                                            {post.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 mb-1 line-clamp-2">
                                            {post.description}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                            <span>by {post.author?.username || 'unknown'}</span>
                                            <span>·</span>
                                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                            <span>·</span>
                                            <span>{post.license}</span>
                                        </div>
                                        {post.removed_reason && (
                                            <p className="text-xs text-red-400/70 mt-1">
                                                Reason: {post.removed_reason}
                                            </p>
                                        )}
<<<<<<< HEAD
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 flex-shrink-0">
=======

                                        {post.report_count > 0 && (
                                            <div className="mt-3 pt-3 border-t border-gray-700/50">
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400 mb-2">
                                                    <Flag size={12} />
                                                    <span>{post.report_count} User Report{post.report_count !== 1 ? 's' : ''}</span>
                                                </div>
                                                <div className="space-y-1.5">
                                                    {post.reports.map((report, idx) => (
                                                        <div key={idx} className="bg-red-500/5 border border-red-500/10 rounded px-2.5 py-1.5 text-xs text-red-300/80 break-words">
                                                            <span className="text-gray-500 text-[10px] block mb-0.5">{new Date(report.created_at).toLocaleString()}</span>
                                                            {report.reason}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
>>>>>>> 448d8de (feat: enhance picks system and event details)
                                        {post.is_removed ? (
                                            <button
                                                onClick={() => handleAction(post.id, 'restore')}
                                                disabled={actionLoading === post.id}
<<<<<<< HEAD
                                                className="flex items-center gap-1 px-2.5 py-1.5 bg-green-500/10 text-green-400 text-xs rounded-md hover:bg-green-500/20 transition-colors disabled:opacity-50"
=======
                                                className="flex items-center gap-1 px-2.5 py-1.5 bg-green-500/10 text-green-400 text-xs rounded-md hover:bg-green-500/20 transition-colors disabled:opacity-50 whitespace-nowrap"
>>>>>>> 448d8de (feat: enhance picks system and event details)
                                            >
                                                <RotateCcw size={12} />
                                                Restore
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleAction(post.id, 'remove', 'Removed by admin')}
                                                disabled={actionLoading === post.id}
<<<<<<< HEAD
                                                className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 text-red-400 text-xs rounded-md hover:bg-red-500/20 transition-colors disabled:opacity-50"
=======
                                                className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 text-red-400 text-xs rounded-md hover:bg-red-500/20 transition-colors disabled:opacity-50 whitespace-nowrap"
>>>>>>> 448d8de (feat: enhance picks system and event details)
                                            >
                                                <Trash2 size={12} />
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {total > 20 && (
                <div className="flex justify-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 text-sm text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                    >
                        ← Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-500">
                        Page {page} of {Math.ceil(total / 20)}
                    </span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= Math.ceil(total / 20)}
                        className="px-3 py-1 text-sm text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}
