import React from "react";
import { getInitials } from "./getInitials";

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
