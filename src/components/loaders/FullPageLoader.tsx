"use client";

import { RingLoader } from "react-spinners";

export default function FullPageLoader({ show = true }: { show?: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 dark:bg-black/30 backdrop-blur-sm">
      <div className="relative">
        {/* Outer ring */}
        <RingLoader size={90} color="#007aff" />
        {/* Inner ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <RingLoader size={60} color="#ffa700" />
        </div>
      </div>
    </div>
  );
}
