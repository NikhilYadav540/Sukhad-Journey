// components/LiveSafetyMap.tsx
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

interface LiveSafetyMapProps {
  isDanger: boolean;
  onLocationUpdate?: (name: string) => void; // 1. Added prop to send data back to dashboard
}

function RecenterAutomatically({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export default function LiveSafetyMap({ isDanger, onLocationUpdate }: LiveSafetyMapProps) {
  const [position, setPosition] = useState<[number, number]>([18.9220, 72.8347]);
  const [hasLocation, setHasLocation] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setHasLocation(true);
        },
        (err) => console.error("GPS Error:", err),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // 2. Fetch actual street/suburb name from OpenStreetMap
  useEffect(() => {
    if (hasLocation && onLocationUpdate) {
      const [lat, lng] = position;
      
      // Hit the free reverse geocoding endpoint
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then((res) => res.json())
        .then((data) => {
          const address = data.address || {};
          // Drill down to get the most specific local name available
          const placeName = address.suburb || address.neighbourhood || address.road || address.city || "Current Location";
          onLocationUpdate(placeName);
        })
        .catch((err) => console.error("Geocoding failed:", err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLocation]); // Only runs once when location lock is acquired

  return (
    <div className="relative h-56 w-full rounded-3xl overflow-hidden shadow-sm border border-slate-200">
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {hasLocation && <RecenterAutomatically lat={position[0]} lng={position[1]} />}
        
        <Marker position={position}>
          <Popup>{hasLocation ? "You are here!" : "Locating you..."}</Popup>
        </Marker>

        {isDanger && (
          <Circle
            center={position}
            radius={250}
            pathOptions={{ color: '#e11d48', fillColor: '#e11d48', fillOpacity: 0.2 }}
          />
        )}
      </MapContainer>

      {isDanger && (
        <div className="absolute bottom-3 left-3 right-3 bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-2xl text-xs flex items-center gap-2.5 shadow-sm z-[400]">
          <span className="font-medium">⚠️ Caution: High risk area flagged in this grid.</span>
        </div>
      )}
    </div>
  );
}