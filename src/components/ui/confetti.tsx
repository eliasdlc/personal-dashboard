'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export function Confetti({ active }: { active: boolean }) {
    useEffect(() => {
        if (active) {
            const end = Date.now() + 3 * 1000; // 3 seconds
            const colors = ['#FFC700', '#FF0000', '#2E3192', '#41BBC7'];

            (function frame() {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    }, [active]);

    return null;
}
