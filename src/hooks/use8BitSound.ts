import { useCallback, useEffect, useRef } from 'react';

export function use8BitSound() {
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        return () => {
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                // Context is kept alive intentionally for performance
            }
        };
    }, []);

    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                audioContextRef.current = new AudioContextClass();
            }
        }
        const ctx = audioContextRef.current;
        if (ctx && ctx.state === 'suspended') {
            ctx.resume().catch(() => { });
        }
        return ctx;
    }, []);

    const playTone = useCallback((frequency: number, type: OscillatorType = 'square', duration: number = 0.1, startTimeOffset: number = 0, slideTo?: number) => {
        const ctx = getAudioContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;

        const now = ctx.currentTime + startTimeOffset + 0.04;

        osc.frequency.setValueAtTime(frequency, now);
        if (slideTo) {
            osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
        }

        const attackTime = 0.02;
        const releaseTime = 0.05;

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + attackTime);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration + releaseTime);

        osc.onended = () => {
            osc.disconnect();
            gain.disconnect();
        };

    }, [getAudioContext]);

    const playTaskComplete = useCallback(() => {
        const now = 0.05;
        const speed = 0.08;
        const C5 = 523.25;
        const E5 = 659.25;
        const G5 = 783.99;
        const B5 = 987.77;
        const C6 = 1046.50;

        playTone(C5, 'square', 0.08, now);
        playTone(E5, 'square', 0.08, now + speed);
        playTone(G5, 'square', 0.08, now + speed * 2);
        playTone(B5, 'square', 0.08, now + speed * 3);

        playTone(C6, 'square', 0.3, now + speed * 4, C6 + 15);
        playTone(C6 * 2, 'sine', 0.3, now + speed * 4);
        playTone(C5 / 2, 'triangle', 0.3, now + speed * 4);
    }, [playTone]);

    const playSubtaskNote = useCallback((index: number) => {
        const sequence = [
            261.63,
            293.66,
            329.63,
            392.00,
            440.00,
            523.25,
            587.33,
            659.25,
            783.99,
            880.00
        ];

        const safeIndex = index % sequence.length;

        let freq = sequence[safeIndex];
        const isHighTier = index >= sequence.length;

        if (isHighTier) {
            freq = freq * 2;
        }

        const duration = isHighTier ? 0.08 : 0.1;
        const endFreq = freq * 1.05;

        playTone(freq, 'square', duration, 0, endFreq);

    }, [playTone]);

    return { playTaskComplete, playSubtaskNote };
}