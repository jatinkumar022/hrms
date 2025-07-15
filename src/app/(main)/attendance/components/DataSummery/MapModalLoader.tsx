"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const MapModalLoader = ({ open, onOpenChange, lat, lng, label }: any) => {
  const MapModal = useMemo(
    () =>
      dynamic(() => import("./MapModal"), {
        ssr: false,
      }),
    []
  );

  return (
    <MapModal
      open={open}
      onOpenChange={onOpenChange}
      lat={lat}
      lng={lng}
      label={label}
    />
  );
};

export default MapModalLoader;
