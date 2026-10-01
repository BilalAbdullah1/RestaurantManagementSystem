import React, { useEffect, useState, useRef } from 'react';
import { loadingManager } from '../../utils/loadingManager';

export const TopProgressBar: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [animating, setAnimating] = useState(false);
  
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = loadingManager.subscribe((isLoading) => {
      if (isLoading) {
        // Clear any completion timers
        if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

        setVisible(true);
        setAnimating(true);
        // Start from at least 15%
        setProgress((prev) => (prev < 15 ? 15 : prev));

        // Incrementally trickle up to 88% while waiting for requests
        progressIntervalRef.current = setInterval(() => {
          setProgress((current) => {
            if (current < 50) return current + Math.random() * 12 + 4;
            if (current < 75) return current + Math.random() * 6 + 2;
            if (current < 88) return current + Math.random() * 2 + 0.5;
            return current;
          });
        }, 250);
      } else {
        // All active requests finished
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

        setProgress(100);

        // Hold at 100% briefly, then fade out
        finishTimeoutRef.current = setTimeout(() => {
          setAnimating(false);
          hideTimeoutRef.current = setTimeout(() => {
            setVisible(false);
            setProgress(0);
          }, 300);
        }, 200);
      }
    });

    return () => {
      unsubscribe();
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[3px] z-[999999] pointer-events-none overflow-hidden transition-opacity duration-300"
      style={{
        opacity: animating ? 1 : 0,
      }}
    >
      <div
        className="h-full bg-gradient-to-r from-brand-600 via-brand-400 to-indigo-500 transition-all duration-300 ease-out relative"
        style={{
          width: `${Math.min(progress, 100)}%`,
        }}
      >
        {/* Glowing Head of the Progress Bar */}
        <div
          className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-transparent to-white/40"
          style={{
            boxShadow: '0 0 10px #465fff, 0 0 5px #7592ff',
          }}
        />
      </div>
    </div>
  );
};

export default TopProgressBar;
