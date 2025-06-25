"use client";

import { ScaleLoader } from "react-spinners";

export default function ButtonLoader({
  color = "#fff",
  height = 15,
  width = 2,
}: {
  color?: string;
  height?: number;
  width?: number;
}) {
  return (
    <div className="flex items-center justify-center">
      <ScaleLoader height={height} width={width} color={color} />
    </div>
  );
}
