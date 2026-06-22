"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Scale, ChevronDown, AlertTriangle, Flag } from 'lucide-react';
import { VoteButtons } from './VoteButtons';
import { CommentSection } from './CommentSection';
import { ReportModal } from './ReportModal';
import { useRouter } from 'next/navigation';
import { FLAIR_COLORS, FLAIRS, type PicksPost, type Flair } from '@/lib/picks-db';
import { usePicksAuth } from './PicksAuthProvider';

interface PostCardProps {
    post: PicksPost;
    onAuthRequired: () => void;
    onPostUpdated?: () => void;
    isDetailedView?: boolean;
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

export function PostCard({ post, onAuthRequired, onPostUpdated, isDetailedView = false }: PostCardProps) {
    const { user, session } = usePicksAuth();
    const router = useRouter();

    const [currentScore, setCurrentScore] = useState(post.score);
    const [currentVote, setCurrentVote] = useState<number | null>(post.user_vote || null);
    const [showComments, setShowComments] = useState(isDetailedView);
    const [showReportModal, setShowReportModal] = useState(false);

    // Editing states
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(post.title);
    const [description, setDescription] = useState(post.description);
    const [toolName, setToolName] = useState(post.tool_name);
    const [flair, setFlair] = useState<Flair>(post.flair);
    const [license, setLicense] = useState(post.license);
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editSubmitting) return;

        setEditSubmitting(true);
        setEditError(null);

        try {
            const token = session?.access_token;
            
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`/api/picks/posts/${post.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    tool_name: toolName.trim(),
                    flair,
                    license: license.trim(),
                }),
            });

            if (res.ok) {
                setIsEditing(false);
                if (onPostUpdated) {
                    onPostUpdated();
                }
            } else {
                const data = await res.json();
                setEditError(data.error || 'Failed to update post');
            }
        } catch {
            setEditError('Something went wrong. Please try again.');
        } finally {
            setEditSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this pick?")) return;
        setIsDeleting(true);
        try {
            const token = session?.access_token;
            
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`/api/picks/posts/${post.id}`, {
                method: 'DELETE',
                headers,
            });

            if (res.ok) {
                if (onPostUpdated) {
                    onPostUpdated();
                }
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete post');
            }
        } catch {
            alert('Failed to delete post');
        } finally {
            setIsDeleting(false);
        }
    };

    const flairColor = FLAIR_COLORS[post.flair as Flair] || '#6B7280';

    const handleVoteChange = (newScore: number, newVote: number | null) => {
        setCurrentScore(newScore);
        setCurrentVote(newVote);
    };



    return (
        <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => {
                if (isDetailedView) return;
                // Don't navigate if clicking on buttons, inputs, links, etc.
                const target = e.target as HTMLElement;
                if (target.closest('button, a, input, select, textarea, form')) return;
                router.push(`/picks/${post.id}`);
            }}
            className={`group flex gap-3 bg-[#0a0a0a]/80 border border-white/[0.06] rounded-xl p-4 transition-all duration-200 ${
                !isDetailedView ? 'cursor-pointer hover:border-white/[0.1] hover:bg-[#0e0e0e]/80' : ''
            }`}
        >
            {/* Vote column */}
            <div className="flex-shrink-0 pt-1">
                <VoteButtons
                    postId={post.id}
                    score={currentScore}
                    userVote={currentVote}
                    onAuthRequired={onAuthRequired}
                    onVoteChange={handleVoteChange}
                />
            </div>

            {/* Content column */}
            <div className="flex-1 min-w-0">
                {isEditing ? (
                    <form onSubmit={handleEditSubmit} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Tool Name */}
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">
                                    Tool Name *
                                </label>
                                <input
                                    type="text"
                                    value={toolName}
                                    onChange={(e) => setToolName(e.target.value)}
                                    maxLength={100}
                                    required
                                    className="w-full px-3 py-1.5 bg-white/[0.04] border border-white/8 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-[#D85A30]/40 focus:ring-1 focus:ring-[#D85A30]/20 transition-all"
                                />
                            </div>

                            {/* Category/Flair */}
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">
                                    Category *
                                </label>
                                <div className="relative">
                                    <select
                                        value={flair}
                                        onChange={(e) => setFlair(e.target.value as Flair)}
                                        className="w-full px-3 py-1.5 bg-white/[0.04] border border-white/8 rounded-lg text-sm text-gray-200 appearance-none focus:outline-none focus:border-[#D85A30]/40 focus:ring-1 focus:ring-[#D85A30]/20 transition-all cursor-pointer"
                                    >
                                        {FLAIRS.map(f => (
                                            <option key={f} value={f} className="bg-[#1a1a1a] text-gray-200">{f}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                                Post Title *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={200}
                                required
                                className="w-full px-3 py-1.5 bg-white/[0.04] border border-white/8 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-[#D85A30]/40 focus:ring-1 focus:ring-[#D85A30]/20 transition-all"
                            />
                        </div>

                        {/* License */}
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                                License *
                            </label>
                            <input
                                type="text"
                                value={license}
                                onChange={(e) => setLicense(e.target.value)}
                                maxLength={50}
                                required
                                className="w-full px-3 py-1.5 bg-white/[0.04] border border-white/8 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-[#D85A30]/40 focus:ring-1 focus:ring-[#D85A30]/20 transition-all"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                                Description * <span className="text-gray-600">({description.length}/300)</span>
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value.slice(0, 300))}
                                maxLength={300}
                                rows={3}
                                required
                                className="w-full px-3 py-1.5 bg-white/[0.04] border border-white/8 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-[#D85A30]/40 focus:ring-1 focus:ring-[#D85A30]/20 transition-all resize-none"
                            />
                        </div>

                        {editError && (
                            <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <p className="text-xs text-red-400">{editError}</p>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    // Reset values
                                    setTitle(post.title);
                                    setDescription(post.description);
                                    setToolName(post.tool_name);
                                    setFlair(post.flair);
                                    setLicense(post.license);
                                    setEditError(null);
                                }}
                                className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={editSubmitting || !title.trim() || !toolName.trim() || !description.trim() || !license.trim()}
                                className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                    background: 'linear-gradient(135deg, #D85A30, #e06b3a)',
                                    color: '#fff',
                                }}
                            >
                                {editSubmitting ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        {/* Flair + Tool Name */}
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span
                                className="px-2 py-0.5 rounded text-xs font-mono font-semibold"
                                style={{
                                    backgroundColor: `${flairColor}18`,
                                    color: flairColor,
                                    border: `1px solid ${flairColor}30`,
                                }}
                            >
                                {flair}
                            </span>
                            <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                                🛠 {toolName}
                            </span>
                            {post.report_count ? (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] uppercase font-bold rounded tracking-wide ml-auto sm:ml-0" title={`${post.report_count} user report(s)`}>
                                    <AlertTriangle size={10} />
                                    Reported
                                </span>
                            ) : null}
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-semibold text-gray-100 mb-1 leading-snug">
                            {title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-400 leading-relaxed mb-3 break-words">
                            {description}
                        </p>

                        {/* Meta row */}
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2 flex-wrap">
                            <span className="flex items-center gap-1">
                                <div
                                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                                    style={{
                                        background: `hsl(${(post.author?.username || '').charCodeAt(0) * 37 % 360}, 50%, 25%)`,
                                        color: `hsl(${(post.author?.username || '').charCodeAt(0) * 37 % 360}, 70%, 75%)`,
                                    }}
                                >
                                    {(post.author?.username || '?')[0].toUpperCase()}
                                </div>
                                <span className="text-gray-400 font-medium">{post.author?.username || 'anonymous'}</span>
                            </span>
                            <span>·</span>
                            <span>{timeAgo(post.created_at)}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                                <Scale size={11} />
                                {license}
                            </span>
                        </div>

                        {/* Actions row */}
                        <div className="flex items-center gap-1 -ml-2">
                            <button
                                onClick={() => setShowComments(!showComments)}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-gray-500 hover:text-gray-300 hover:bg-white/[0.04] transition-colors"
                            >
                                <MessageCircle size={14} />
                                <span>Comments{post.comment_count ? ` (${post.comment_count})` : ''}</span>
                            </button>

                            {user && user.id === post.author_id && (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-gray-500 hover:text-gray-300 hover:bg-white/[0.04] transition-colors"
                                    >
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-red-500 hover:text-red-400 hover:bg-red-500/[0.04] transition-colors disabled:opacity-50"
                                    >
                                        <span>Delete</span>
                                    </button>
                                </>
                            )}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    user ? setShowReportModal(true) : onAuthRequired();
                                }}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/[0.04] transition-colors"
                            >
                                <Flag size={14} />
                                <span>Flag/Report</span>
                            </button>
                        </div>

                        {/* Inline comments */}
                        <AnimatePresence>
                            {showComments && (
                                <CommentSection
                                    postId={post.id}
                                    onAuthRequired={onAuthRequired}
                                />
                            )}
                        </AnimatePresence>
                        
                        <AnimatePresence>
                            {showReportModal && (
                                <ReportModal
                                    isOpen={showReportModal}
                                    onClose={() => setShowReportModal(false)}
                                    postId={post.id}
                                />
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </motion.article>
    );
}
