'use client';

import { motion } from 'framer-motion';

export function PageTransition({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerContainer({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.1,
                        delayChildren: delay,
                    }
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

import { AnimatePresence } from 'framer-motion';

export function AnimatedList({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <motion.div layout className={className}>
            <AnimatePresence mode='popLayout'>
                {children}
            </AnimatePresence>
        </motion.div>
    );
}

export function AnimatedListItem({ children, className, layoutId }: { children: React.ReactNode, className?: string, layoutId?: string }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ duration: 0.2 }}
            className={className}
            layoutId={layoutId} // Optional: for shared layout animations
        >
            {children}
        </motion.div>
    );
}
