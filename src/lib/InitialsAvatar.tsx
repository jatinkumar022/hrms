import React from "react";

export function getInitials(name?: string) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const InitialsAvatar: React.FC<{
  name?: string;
  size?: number; // px
  className?: string;
}> = ({ name, size, className = "" }) => (
  <div
    className={`rounded-full bg-zinc-900 flex items-center justify-center text-white font-normal select-none ${className}`}
    style={{ width: size, height: size, fontSize: size ? size / 2.5 : "" }}
  >
    {getInitials(name)}
  </div>
);
