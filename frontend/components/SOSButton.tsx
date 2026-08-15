"use client";
import React, { useEffect, useRef, useState } from "react";
import { ShieldAlert } from "lucide-react";

export function SOSButton({ onTriggerSOS }: { onTriggerSOS: () => void }) {
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPressTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => clearPressTimer, []);

  const startPress = () => {
    if (timerRef.current) return;
    setIsPressing(true);
    let count = 0;
    timerRef.current = setInterval(() => {
      count += 10;
      setProgress(count);
      if (count >= 100) {
        clearPressTimer();
        setIsPressing(false);
        setProgress(0);
        onTriggerSOS();
      }
    }, 150);
  };

  const cancelPress = () => {
    clearPressTimer();
    setIsPressing(false);
    setProgress(0);
  };

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <button
        type="button"
        onPointerDown={startPress}
        onPointerUp={cancelPress}
        onPointerCancel={cancelPress}
        onPointerLeave={cancelPress}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && !event.repeat) startPress();
        }}
        onKeyUp={(event) => {
          if (event.key === "Enter" || event.key === " ") cancelPress();
        }}
        aria-label="Hold for one and a half seconds to open the emergency call dialer"
        className={`relative w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl ${
          isPressing ? "scale-95 bg-red-700" : "bg-red-600 hover:bg-red-500 animate-pulse"
        }`}
      >
        <ShieldAlert className="w-12 h-12 text-white mb-1" />
        <span className="text-white font-black text-lg tracking-wider">HOLD SOS</span>

        {isPressing && (
          <div className="absolute inset-0 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin" />
        )}
      </button>
      <p className="text-xs text-slate-400 mt-2 font-medium">Hold for 1.5s to alert nearest police</p>
    </div>
  );
}
