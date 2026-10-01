import { useEffect, useRef } from "react";
import { logout, getToken } from "../utils/authUtils";

// Default inactivity timeout: 30 minutes of ZERO user activity
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

export function useInactivityTimer(timeoutMs: number = INACTIVITY_TIMEOUT_MS) {
  const lastActivityRef = useRef<number>(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
      "wheel",
      "focus",
      "input",
      "change"
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Check inactivity every 10 seconds
    intervalRef.current = setInterval(() => {
      if (getToken()) {
        const idleTime = Date.now() - lastActivityRef.current;
        if (idleTime >= timeoutMs) {
          logout("inactivity");
        }
      }
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [timeoutMs]);
}
