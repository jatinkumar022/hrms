// components/MapModal.tsx
"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import markerIcon from "@/assets/marker.png";

const customMarker = new L.Icon({
  iconUrl: markerIcon.src,
  iconSize: [41, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
interface MapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lat: number;
  lng: number;
  label?: string;
}

export default function MapModal({
  open,
  onOpenChange,
  lat,
  lng,
  label,
}: MapModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="p-4">
          <DialogTitle>{label || "Location Map"}</DialogTitle>
        </DialogHeader>
        <div className="h-[400px] w-full">
          <MapContainer
            center={[lat, lng]}
            zoom={17}
            style={{ height: "100%", width: "100%" }}
            markerZoomAnimation={true}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]} icon={customMarker}>
              <Popup>{label || "Location"}</Popup>
            </Marker>
          </MapContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
