"use client";

import { RingLoader } from "react-spinners";

export default function FullPageLoader({
  color = "#3b82f6",
}: {
  color?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black bg-opacity-70 dark:bg-opacity-70">
      <RingLoader size={80} color={color} />
    </div>
  );
}
