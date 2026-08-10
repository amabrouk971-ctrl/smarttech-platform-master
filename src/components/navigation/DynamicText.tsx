import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface DynamicTextProps {
  words: string[];
  intervalMs?: number;
  mode?: 'fade' | 'slide' | 'scale' | 'blur';
  className?: string;
}

export const DynamicText: React.FC<DynamicTextProps> = ({
  words,
  intervalMs = 2800,
  mode = 'blur',
  className = ''
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [words, intervalMs]);

  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    slide: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.1 }
    },
    blur: {
      initial: { opacity: 0, filter: 'blur(8px)', y: 10 },
      animate: { opacity: 1, filter: 'blur(0px)', y: 0 },
      exit: { opacity: 0, filter: 'blur(8px)', y: -10 }
    }
  };

  const selectedVariant = variants[mode];

  return (
    <span className={`inline-block relative ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={selectedVariant.initial}
          animate={selectedVariant.animate}
          exit={selectedVariant.exit}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};
