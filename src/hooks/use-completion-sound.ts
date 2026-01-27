'use client';

import { useCallback, useRef } from 'react';

/**
 * Custom hook to play a satisfying completion sound
 * Uses the Web Audio API to generate a pleasant chime sound
 */
export function useCompletionSound() {
    const audioContextRef = useRef<AudioContext | null>(null);

    const playCompletionSound = useCallback(() => {
        try {
            // Create or reuse AudioContext
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }

            const ctx = audioContextRef.current;

            // Resume context if suspended (required for some browsers)
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            const now = ctx.currentTime;

            // Create a satisfying two-tone chime sound
            const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 - a pleasant major chord arpeggio

            frequencies.forEach((freq, index) => {
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();

                // Use a soft sine wave for a pleasant tone
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(freq, now);

                // Stagger each note slightly for an arpeggio effect
                const startTime = now + index * 0.08;

                // Volume envelope: quick attack, gentle decay
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.02); // Quick attack
                gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5); // Gentle decay

                // Connect nodes
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);

                // Play the sound
                oscillator.start(startTime);
                oscillator.stop(startTime + 0.5);
            });

            // Add a subtle higher "sparkle" tone for extra satisfaction
            const sparkleOsc = ctx.createOscillator();
            const sparkleGain = ctx.createGain();

            sparkleOsc.type = 'sine';
            sparkleOsc.frequency.setValueAtTime(1046.5, now + 0.15); // C6

            sparkleGain.gain.setValueAtTime(0, now + 0.15);
            sparkleGain.gain.linearRampToValueAtTime(0.08, now + 0.17);
            sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

            sparkleOsc.connect(sparkleGain);
            sparkleGain.connect(ctx.destination);

            sparkleOsc.start(now + 0.15);
            sparkleOsc.stop(now + 0.6);

        } catch (error) {
            // Silently fail if audio is not supported
            console.warn('Could not play completion sound:', error);
        }
    }, []);

    return { playCompletionSound };
}
