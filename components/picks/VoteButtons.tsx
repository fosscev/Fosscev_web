"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { usePicksAuth } from './PicksAuthProvider';

interface VoteButtonsProps {
    postId: string;
    score: number;
    userVote: number | null;
    onAuthRequired: () => void;
    onVoteChange: (newScore: number, newVote: number | null) => void;
}

export function VoteButtons({ postId, score, userVote, onAuthRequired, onVoteChange }: VoteButtonsProps) {
    const { authId } = usePicksAuth();
    const [loading, setLoading] = useState(false);

    const handleVote = async (value: 1 | -1) => {
        if (!authId) {
            onAuthRequired();
            return;
        }
        if (loading) return;

        // Optimistic update
        let optimisticScore = score;
        let optimisticVote: number | null = value;

        if (userVote === value) {
            optimisticScore -= value;
            optimisticVote = null;
        } else if (userVote) {
            optimisticScore += value * 2;
            optimisticVote = value;
        } else {
            optimisticScore += value;
            optimisticVote = value;
        }

        onVoteChange(optimisticScore, optimisticVote);
        setLoading(true);

        try {
            const res = await fetch(`/api/picks/posts/${postId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ auth_id: authId, value }),
            });

            if (res.ok) {
                const data = await res.json();
                onVoteChange(data.score, data.userVote);
            } else {
                onVoteChange(score, userVote);
            }
        } catch {
            onVoteChange(score, userVote);
        } finally {
            setLoading(false);
        }
    };

    const upvoted = userVote === 1;
    const downvoted = userVote === -1;

    return (
        <div className="flex flex-row items-center gap-1 select-none mr-2">
            <motion.button
                whileTap={{ scale: 1.25 }}
                onClick={() => handleVote(1)}
                disabled={loading}
                aria-label="Upvote"
                className="group p-1 rounded-lg transition-all duration-150 disabled:opacity-40"
                style={{
                    background: upvoted ? 'rgba(0,230,118,0.1)' : 'transparent',
                    border: upvoted ? '1px solid rgba(0,230,118,0.2)' : '1px solid transparent',
                }}
            >
                <ChevronUp
                    size={15}
                    strokeWidth={2.5}
                    style={{
                        color: upvoted ? '#00e676' : '#525252',
                        filter: upvoted ? 'drop-shadow(0 0 4px rgba(0,230,118,0.5))' : 'none',
                        transition: 'color 0.15s, filter 0.15s',
                    }}
                />
            </motion.button>

            <motion.span
                key={score}
                initial={{ scale: 1.3, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-xs font-bold font-mono tabular-nums min-w-[2ch] text-center leading-none"
                style={{
                    color: upvoted ? '#00e676' : downvoted ? '#818cf8' : '#6b7280',
                }}
            >
                {score}
            </motion.span>

            <motion.button
                whileTap={{ scale: 1.25 }}
                onClick={() => handleVote(-1)}
                disabled={loading}
                aria-label="Downvote"
                className="p-1 rounded-lg transition-all duration-150 disabled:opacity-40"
                style={{
                    background: downvoted ? 'rgba(129,140,248,0.1)' : 'transparent',
                    border: downvoted ? '1px solid rgba(129,140,248,0.2)' : '1px solid transparent',
                }}
            >
                <ChevronDown
                    size={15}
                    strokeWidth={2.5}
                    style={{
                        color: downvoted ? '#818cf8' : '#525252',
                        transition: 'color 0.15s',
                    }}
                />
            </motion.button>
        </div>
    );
}
