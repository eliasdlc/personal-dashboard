
'use client';

import { useEffect, useState } from 'react';

/**
 * Simple confetti effect using CSS animations or canvas.
 * For simplicity and zero-dep, we'll use a CSS-based approach with fixed particles.
 */
export function Confetti({ active }: { active: boolean }) {
    const [particles, setParticles] = useState<{ id: number, x: number, color: string, delay: number }[]>([]);

    useEffect(() => {
        if (active) {
            const colors = ['#FFC700', '#FF0000', '#2E3192', '#41BBC7'];
            const newParticles = Array.from({ length: 50 }).map((_, i) => ({
                id: i,
                x: Math.random() * 100,
                color: colors[Math.floor(Math.random() * colors.length)],
                delay: Math.random() * 0.5
            }));
            setParticles(newParticles);
        } else {
            setParticles([]);
        }
    }, [active]);

    if (!active) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute top-0 w-2 h-2 rounded-full animate-fall"
                    style={{
                        left: `${p.x}%`,
                        backgroundColor: p.color,
                        animationDelay: `${p.delay}s`,
                        animationDuration: '2.5s'
                    }}
                />
            ))}
        </div>
    );
}
