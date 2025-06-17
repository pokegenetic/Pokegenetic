import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
const RevealOnScroll = ({ children, delay = 0, duration = 0.5, className }) => {
    const controls = useAnimation();
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });
    React.useEffect(() => {
        if (inView) {
            controls.start('visible');
        }
        else {
            controls.start('hidden');
        }
    }, [controls, inView]);
    const variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                delay,
                duration,
                ease: 'easeOut',
            },
        },
    };
    return (_jsx(motion.div, { ref: ref, initial: "hidden", animate: controls, variants: variants, className: className, children: children }));
};
export default RevealOnScroll;
