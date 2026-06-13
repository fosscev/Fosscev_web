"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { usePicksAuth } from './PicksAuthProvider';
import type { PicksComment } from '@/lib/picks-db';

interface CommentSectionProps {
    postId: string;
    onAuthRequired: () => void;
}

function timeAgo(dateStr: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

export function CommentSection({ postId, onAuthRequired }: CommentSectionProps) {
    const { user, authId } = usePicksAuth();
    const [comments, setComments] = useState<PicksComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [body, setBody] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/picks/posts/${postId}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data.comments);
            }
        } catch {
            // Silently fail
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!authId) {
            onAuthRequired();
            return;
        }
        if (!body.trim() || submitting) return;

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch(`/api/picks/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ auth_id: authId, body: body.trim() }),
            });

            if (res.ok) {
                const data = await res.json();
                setComments(prev => [...prev, data.comment]);
                setBody('');
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to post comment');
            }
        } catch {
            setError('Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
        >
            <div
                className="mt-3 pt-3"
                style={{ borderTop: '1px solid rgba(0,230,118,0.06)' }}
            >
                {loading ? (
                    <div className="flex items-center gap-2 py-4 px-2">
                        <div
                            className="w-4 h-4 rounded-full"
                            style={{
                                border: '2px solid rgba(0,230,118,0.1)',
                                borderTopColor: '#00e676',
                                animation: 'spin 0.8s linear infinite',
                            }}
                        />
                        <span className="text-xs text-gray-600 font-mono">loading comments...</span>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {comments.length === 0 && (
                            <p className="text-xs text-gray-600 font-mono py-2 px-2">
                                <span className="text-[#00e676]/40">$</span> no comments yet — be the first!
                            </p>
                        )}

                        <AnimatePresence mode="popLayout">
                            {comments.map((comment) => {
                                const username = comment.author?.username || '?';
                                const hue = (username.charCodeAt(0) * 37) % 360;
                                return (
                                    <motion.div
                                        key={comment.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex gap-2.5 px-2 py-2 rounded-lg transition-colors"
                                        style={{ background: 'rgba(255,255,255,0.01)' }}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLElement).style.background = 'rgba(0,230,118,0.02)';
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.01)';
                                        }}
                                    >
                                        {/* Avatar */}
                                        <div
                                            className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
                                            style={{
                                                background: `hsl(${hue}, 40%, 18%)`,
                                                color: `hsl(${hue}, 60%, 65%)`,
                                                border: `1px solid hsl(${hue}, 40%, 28%)`,
                                            }}
                                        >
                                            {username[0].toUpperCase()}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-[11px] font-semibold text-gray-400 font-mono">
                                                    {comment.author?.username || 'anon'}
                                                </span>
                                                <span className="text-[10px] text-gray-700 font-mono">
                                                    {timeAgo(comment.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 leading-relaxed break-words">
                                                {comment.body}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {/* Comment input */}
                        <form onSubmit={handleSubmit} className="flex items-center gap-2 px-2 pt-2">
                            <input
                                type="text"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder={user ? "Add a comment..." : "Sign in to comment"}
                                maxLength={1000}
                                disabled={!user || submitting}
                                className="flex-1 px-3 py-1.5 rounded-lg text-xs text-gray-300 placeholder-gray-600 font-mono focus:outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                    background: 'rgba(0,230,118,0.03)',
                                    border: '1px solid rgba(0,230,118,0.08)',
                                }}
                                onFocus={e => {
                                    (e.target as HTMLElement).style.border = '1px solid rgba(0,230,118,0.2)';
                                    (e.target as HTMLElement).style.background = 'rgba(0,230,118,0.05)';
                                }}
                                onBlur={e => {
                                    (e.target as HTMLElement).style.border = '1px solid rgba(0,230,118,0.08)';
                                    (e.target as HTMLElement).style.background = 'rgba(0,230,118,0.03)';
                                }}
                                onClick={() => !user && onAuthRequired()}
                            />
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                type="submit"
                                disabled={!body.trim() || submitting || !user}
                                className="p-1.5 rounded-lg transition-all duration-150 disabled:opacity-25 flex-shrink-0"
                                style={{
                                    background: body.trim() ? 'rgba(0,230,118,0.1)' : 'transparent',
                                    color: body.trim() ? '#00e676' : '#525252',
                                    border: body.trim() ? '1px solid rgba(0,230,118,0.2)' : '1px solid transparent',
                                }}
                            >
                                <Send size={13} />
                            </motion.button>
                        </form>

                        {error && (
                            <p className="text-xs text-red-400/80 px-2 font-mono">{error}</p>
                        )}

                        {body.length > 0 && (
                            <div className="px-2">
                                <span className="text-[10px] text-gray-700 font-mono">{body.length}/1000</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
