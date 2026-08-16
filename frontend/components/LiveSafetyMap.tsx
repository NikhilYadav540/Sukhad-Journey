// components/LiveSafetyMap.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, ZoomControl, useMap, useMapEvents } from "react-leaflet";
import { divIcon } from "leaflet";
import { contentApi, type CrimeReportDTO, type DangerZoneDTO, type EmergencyServiceCategoryDTO } from "@/lib/api";
import { LocateFixed, MapPin, X } from "lucide-react";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

const GATEWAY: [number, number] = [18.922, 72.8347];
/** Thakur Educational Campus, Thakur Village, Kandivali East (nearest WR station: Borivali). */
const THAKUR_COLLEGE: [number, number] = [19.21407, 72.8648];

/** Desktop Chrome often returns ISP city (e.g. Nashik) with 10km+ accuracy. */
const MIN_USEFUL_ACCURACY_M = 4000;

function markerIcon(html: string, size = 22) {
  return divIcon({
    className: "sj-marker",
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

const CRIME_ICON = markerIcon(
  '<div style="width:14px;height:14px;background:#e11d48;border:2px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.45)"></div>',
  16
);
const HOSPITAL_ICON = markerIcon(
  '<div style="width:22px;height:22px;background:#059669;color:#fff;border:2px solid #fff;border-radius:6px;font:800 16px/18px ui-sans-serif,system-ui;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.4)">+</div>',
  22
);
const POLICE_ICON = markerIcon(
  '<div style="width:22px;height:22px;background:#2563eb;color:#fff;border:2px solid #fff;border-radius:50%;font:800 11px/18px ui-sans-serif,system-ui;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.4)">P</div>',
  22
);

const PRESETS: { label: string; coords: [number, number]; place: string }[] = [
  { label: "Thakur College", coords: THAKUR_COLLEGE, place: "Thakur College, Thakur Village, Kandivali East (Borivali)" },
  { label: "Gateway", coords: GATEWAY, place: "Gateway of India, Mumbai" },
];

interface LiveSafetyMapProps {
  isDanger: boolean;
  onLocationUpdate?: (name: string) => void;
  onCoordsChange?: (lat: number, lng: number) => void;
  requestedPin?: { lat: number; lng: number; place: string } | null;
  pickingArea?: boolean;
  onPickForAnalysis?: (lat: number, lng: number) => void;
  onUserGps?: (lat: number, lng: number) => void;
  route?: {
    fromLat: number;
    fromLng: number;
    toLat: number;
    toLng: number;
    toName: string;
  } | null;
  onClearRoute?: () => void;
}

type GpsStatus = "idle" | "locating" | "live" | "manual" | "inaccurate" | "denied" | "unavailable";

function RecenterAutomatically({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
}

function lookupPlaceName(lat: number, lng: number, onLocationUpdate?: (name: string) => void) {
  if (!onLocationUpdate) return;
  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
    .then((res) => res.json())
    .then((data) => {
      const address = data.address || {};
      onLocationUpdate(
        address.suburb || address.neighbourhood || address.road || address.city || "Current Location"
      );
    })
    .catch((err) => console.error("Geocoding failed:", err));
}

function readGpsError(err: unknown): GpsStatus {
  const code = typeof err === "object" && err && "code" in err ? Number((err as GeolocationPositionError).code) : 0;
  if (code === 1) return "denied";
  return "unavailable";
}

function MapClickToPin({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  useMapEvents({
    click(e) {
      onPickRef.current(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function ResizeWhenPicking({ picking }: { picking?: boolean }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 80);
    return () => clearTimeout(t);
  }, [picking, map]);
  return null;
}

function FitRoute({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length < 2) return;
    map.fitBounds(points, { padding: [36, 36], maxZoom: 16 });
  }, [points, map]);
  return null;
}

function InAppRouteLayer({
  route,
}: {
  route: { fromLat: number; fromLng: number; toLat: number; toLng: number; toName: string };
}) {
  const [path, setPath] = useState<[number, number][]>([
    [route.fromLat, route.fromLng],
    [route.toLat, route.toLng],
  ]);
  const [eta, setEta] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fallback: [number, number][] = [
      [route.fromLat, route.fromLng],
      [route.toLat, route.toLng],
    ];
    setPath(fallback);
    setEta(null);
    fetch(
      `https://router.project-osrm.org/route/v1/driving/${route.fromLng},${route.fromLat};${route.toLng},${route.toLat}?overview=full&geometries=geojson`
    )
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || data?.code !== "Ok" || !data.routes?.[0]) return;
        const coords = data.routes[0].geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]] as [number, number]
        );
        if (coords.length >= 2) setPath(coords);
        const km = (data.routes[0].distance / 1000).toFixed(1);
        const mins = Math.max(1, Math.round(data.routes[0].duration / 60));
        setEta(`${km} km · about ${mins} min`);
      })
      .catch(() => {
        if (!cancelled) setPath(fallback);
      });
    return () => {
      cancelled = true;
    };
  }, [route.fromLat, route.fromLng, route.toLat, route.toLng]);

  return (
    <>
      <Polyline positions={path} pathOptions={{ color: "#059669", weight: 5, opacity: 0.9, interactive: false }} />
      <Circle
        center={[route.fromLat, route.fromLng]}
        radius={40}
        pathOptions={{ color: "#2563eb", fillColor: "#3b82f6", fillOpacity: 0.25, interactive: false }}
      />
      <Marker position={[route.fromLat, route.fromLng]}>
        <Popup>You are here</Popup>
      </Marker>
      <Marker position={[route.toLat, route.toLng]}>
        <Popup>
          <strong>{route.toName}</strong>
          {eta ? (
            <>
              <br />
              {eta}
            </>
          ) : null}
        </Popup>
      </Marker>
      <FitRoute points={path} />
    </>
  );
}

export default function LiveSafetyMap({
  isDanger,
  onLocationUpdate,
  onCoordsChange,
  requestedPin,
  pickingArea,
  onPickForAnalysis,
  onUserGps,
  route,
  onClearRoute,
}: LiveSafetyMapProps) {
  const [position, setPosition] = useState<[number, number]>(THAKUR_COLLEGE);
  const [hasLocation, setHasLocation] = useState(true);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("manual");
  const [accuracyKm, setAccuracyKm] = useState<number | null>(null);
  const [zones, setZones] = useState<DangerZoneDTO[]>([]);
  const [crimes, setCrimes] = useState<CrimeReportDTO[]>([]);
  const [services, setServices] = useState<EmergencyServiceCategoryDTO[]>([]);
  const watchId = useRef<number | null>(null);

  const stopWatch = () => {
    if (watchId.current != null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  };

  const applyCoords = useCallback(
    (lat: number, lng: number, status: GpsStatus, place?: string) => {
      setPosition([lat, lng]);
      setHasLocation(true);
      setGpsStatus(status);
      onCoordsChange?.(lat, lng);
      if (status === "live") onUserGps?.(lat, lng);
      if (place) onLocationUpdate?.(place);
      else lookupPlaceName(lat, lng, onLocationUpdate);
    },
    [onLocationUpdate, onCoordsChange, onUserGps]
  );

  const startWatch = useCallback(() => {
    if (!("geolocation" in navigator)) return;
    stopWatch();
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (pos.coords.accuracy > MIN_USEFUL_ACCURACY_M) return;
        applyCoords(pos.coords.latitude, pos.coords.longitude, "live");
        setAccuracyKm(pos.coords.accuracy / 1000);
      },
      (err) => console.error("GPS watch:", err),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  }, [applyCoords]);

  const requestGps = (highAccuracy: boolean) =>
    new Promise<GeolocationPosition>((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        reject({ code: 2 });
        return;
      }
      if (!window.isSecureContext) {
        reject({ code: 1 });
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: highAccuracy,
        timeout: 10000,
        maximumAge: 0,
      });
    });

  const locate = useCallback(async () => {
    setGpsStatus("locating");
    try {
      const pos = await requestGps(true).catch(() => requestGps(false));
      const km = pos.coords.accuracy / 1000;
      setAccuracyKm(km);
      if (pos.coords.accuracy > MIN_USEFUL_ACCURACY_M) {
        stopWatch();
        setGpsStatus("inaccurate");
        return;
      }
      applyCoords(pos.coords.latitude, pos.coords.longitude, "live");
      startWatch();
    } catch (err) {
      console.error("GPS Error:", err);
      setGpsStatus(readGpsError(err));
    }
  }, [applyCoords, startWatch]);

  const usePreset = (coords: [number, number], place: string) => {
    stopWatch();
    setAccuracyKm(null);
    applyCoords(coords[0], coords[1], "manual", place);
  };

  useEffect(() => {
    onLocationUpdate?.("Thakur College, Thakur Village, Kandivali East (Borivali)");
    onCoordsChange?.(THAKUR_COLLEGE[0], THAKUR_COLLEGE[1]);
    contentApi.dangerZones().then(setZones).catch(() => setZones([]));
    contentApi.crimeReports().then(setCrimes).catch(() => setCrimes([]));
    contentApi.emergencyServices().then(setServices).catch(() => setServices([]));
    return () => stopWatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastRequestedKey = useRef("");

  useEffect(() => {
    if (!requestedPin) return;
    const key = `${requestedPin.lat},${requestedPin.lng},${requestedPin.place}`;
    if (lastRequestedKey.current === key) return;
    lastRequestedKey.current = key;
    stopWatch();
    setAccuracyKm(null);
    applyCoords(requestedPin.lat, requestedPin.lng, "manual", requestedPin.place);
  }, [requestedPin, applyCoords]);

  const hospitals = useMemo(
    () =>
      services
        .filter((c) => (c.icon_key || "").toLowerCase() === "hospital")
        .flatMap((c) => c.list.filter((i) => i.latitude != null && i.longitude != null)),
    [services]
  );
  const policePosts = useMemo(
    () =>
      services
        .filter((c) => (c.icon_key || "").toLowerCase() === "siren")
        .flatMap((c) => c.list.filter((i) => i.latitude != null && i.longitude != null)),
    [services]
  );

  const statusText =
    gpsStatus === "locating"
      ? "Waiting for Chrome location prompt…"
      : gpsStatus === "live"
        ? `Live GPS (±${accuracyKm ? accuracyKm.toFixed(1) : "?"} km)`
        : gpsStatus === "manual"
          ? "Using the area you selected"
          : gpsStatus === "inaccurate"
            ? `Chrome guessed the wrong city (ISP location, ±${accuracyKm?.toFixed(0) ?? "?"} km). Laptops rarely have real GPS — use Thakur College below.`
            : gpsStatus === "denied"
              ? "Chrome blocked GPS. Lock icon → Site settings → Location → Allow."
              : gpsStatus === "unavailable"
                ? "No GPS fix. On a laptop, use Thakur College instead."
                : "Default pin: Thakur College, Kandivali East (near Borivali).";

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={locate}
          className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] py-2.5 rounded-2xl shadow-sm"
        >
          <LocateFixed className={`w-4 h-4 ${gpsStatus === "locating" ? "animate-pulse" : ""}`} />
          {gpsStatus === "locating" ? "Locating…" : "Use my GPS"}
        </button>
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => usePreset(preset.coords, preset.place)}
            className="flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-[11px] py-2.5 rounded-2xl shadow-sm col-span-1"
          >
            <MapPin className="w-4 h-4 text-emerald-700" />
            {preset.label}
          </button>
        ))}
      </div>

      <div
        className={`relative w-full rounded-3xl overflow-hidden shadow-sm border transition-all ${
          pickingArea
            ? "h-80 border-amber-400 ring-4 ring-amber-200"
            : route
              ? "h-80 border-emerald-500 ring-4 ring-emerald-200"
              : "h-56 border-slate-200"
        }`}
      >
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom={false}
          zoomControl={false}
          className="h-full w-full z-0"
        >
          <ZoomControl position="bottomright" />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {hasLocation && !route && <RecenterAutomatically lat={position[0]} lng={position[1]} />}
          <ResizeWhenPicking picking={pickingArea || Boolean(route)} />
          <MapClickToPin
            onPick={(lat, lng) => {
              stopWatch();
              setAccuracyKm(null);
              applyCoords(lat, lng, "manual");
              if (pickingArea) onPickForAnalysis?.(lat, lng);
            }}
          />

          {!route && (
            <Marker
              position={position}
              eventHandlers={{
                click: () => {
                  if (pickingArea) onPickForAnalysis?.(position[0], position[1]);
                },
              }}
            >
              <Popup>{gpsStatus === "live" ? "You are here" : "Selected area"}</Popup>
            </Marker>
          )}

          {zones.map((zone) => {
            const color = zone.riskLevel === "red" ? "#e11d48" : zone.riskLevel === "yellow" ? "#d97706" : "#059669";
            return (
              <Circle
                key={zone.id}
                center={[zone.centerLat, zone.centerLng]}
                radius={zone.radiusMeters}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.28,
                  interactive: false,
                  bubblingMouseEvents: true,
                }}
              />
            );
          })}

          {isDanger && (
            <Circle
              center={position}
              radius={250}
              pathOptions={{
                color: "#e11d48",
                fillColor: "#e11d48",
                fillOpacity: 0.2,
                interactive: false,
                bubblingMouseEvents: true,
              }}
            />
          )}

          {crimes.map((crime) =>
            crime.latitude != null && crime.longitude != null ? (
              <Marker
                key={`crime-${crime.id}`}
                position={[crime.latitude, crime.longitude]}
                icon={CRIME_ICON}
                zIndexOffset={400}
              >
                <Popup>
                  <strong>{crime.crimeType}</strong>
                  <br />
                  {crime.locationLabel}
                  {crime.description ? (
                    <>
                      <br />
                      {crime.description}
                    </>
                  ) : null}
                </Popup>
              </Marker>
            ) : null
          )}
          {hospitals.map((item) => (
            <Marker
              key={`hosp-${item.name}`}
              position={[item.latitude as number, item.longitude as number]}
              icon={HOSPITAL_ICON}
              zIndexOffset={350}
            >
              <Popup>
                <strong>{item.name}</strong>
                <br />
                {item.location}
                {item.phone ? (
                  <>
                    <br />
                    {item.phone}
                  </>
                ) : null}
              </Popup>
            </Marker>
          ))}
          {policePosts.map((item) => (
            <Marker
              key={`pol-${item.name}`}
              position={[item.latitude as number, item.longitude as number]}
              icon={POLICE_ICON}
              zIndexOffset={350}
            >
              <Popup>
                <strong>{item.name}</strong>
                <br />
                {item.location}
                {item.phone ? (
                  <>
                    <br />
                    {item.phone}
                  </>
                ) : null}
              </Popup>
            </Marker>
          ))}

          {route && <InAppRouteLayer route={route} />}
        </MapContainer>
        {pickingArea && (
          <div className="absolute top-3 left-3 right-3 z-[500] pointer-events-none">
            <p className="text-sm font-black text-amber-950 bg-amber-400 border border-amber-300 rounded-2xl px-3 py-2.5 text-center shadow-lg ring-4 ring-amber-200 animate-pulse">
              Choose area — tap the map
            </p>
          </div>
        )}
        {route && !pickingArea && (
          <div className="absolute bottom-10 left-3 right-14 z-[500] flex items-start gap-2">
            <p className="flex-1 text-[11px] font-extrabold text-emerald-950 bg-white/95 border border-emerald-200 rounded-xl px-3 py-2 shadow-sm">
              From your pin to {route.toName}
            </p>
            <button
              type="button"
              onClick={onClearRoute}
              className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-600 font-semibold px-1">
        {isDanger ? "Caution: High risk area flagged in this grid." : `${statusText} Tap the map to drop a pin.`}
      </p>
      <div className="flex flex-wrap gap-2 px-1 text-[10px] font-bold text-slate-600">
        <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Green zone</span>
        <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Yellow zone</span>
        <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Red zone</span>
        <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-600 border border-white shadow" /> Theft / crime</span>
        <span className="inline-flex items-center gap-1"><span className="w-3.5 h-3.5 rounded bg-emerald-600 text-white text-[9px] leading-3.5 text-center">+</span> Hospital</span>
        <span className="inline-flex items-center gap-1"><span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[8px] leading-3.5 text-center">P</span> Police</span>
      </div>
      <style jsx global>{`
        .sj-marker { background: transparent !important; border: none !important; }
      `}</style>
    </div>
  );
}
