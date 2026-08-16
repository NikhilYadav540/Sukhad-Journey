"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  ChevronDown,
  ExternalLink,
  Hospital,
  MapPin,
  Pill,
  Route,
  ScanSearch,
  ShieldAlert,
  ShoppingBasket,
  Siren,
  Star,
  Hotel,
  Utensils,
  Store,
  Gamepad2,
} from "lucide-react";
import { contentApi, type AnalyzedPlaceDTO, type AreaAnalysisDTO } from "@/lib/api";

const FALLBACK_IMG =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Mumbai_03-2016_30_Gateway_of_India.jpg?width=1280";

export type AreaChoice = { name: string; lat: number; lng: number; token?: number };

function exactLocation(place: AnalyzedPlaceDTO) {
  if (place.latitude != null && place.longitude != null) {
    return `${place.latitude.toFixed(5)}, ${place.longitude.toFixed(5)}`;
  }
  return place.locationLabel || "Location on map";
}

function WebsiteLink({ href, label = "Website" }: { href?: string | null; label?: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-[11px] font-extrabold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all"
    >
      {label} <ExternalLink className="w-3 h-3" />
    </a>
  );
}

function PlaceCard({
  place,
  rank,
  onNavigate,
}: {
  place: AnalyzedPlaceDTO;
  rank: number;
  onNavigate?: (place: AnalyzedPlaceDTO) => void;
}) {
  const rankLabel = rank === 1 ? "Closest to your pin" : rank === 2 ? "2nd closest" : "3rd closest";
  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
        <img
          src={place.image || FALLBACK_IMG}
          alt={place.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMG;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="text-[10px] font-extrabold bg-white/90 backdrop-blur-md text-purple-900 px-2.5 py-1 rounded-full border border-white/50">
            {place.locationLabel || place.kind}
          </span>
          <span className="text-[10px] font-bold bg-emerald-500 text-white px-2.5 py-1 rounded-full">
            {place.distanceKm.toFixed(1)} km away
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider block">
            {place.category || place.kind}
          </span>
          <h3 className="font-extrabold text-base leading-tight drop-shadow-sm">{place.name}</h3>
          <span className="text-[10px] font-bold text-emerald-200">{rankLabel}</span>
        </div>
      </div>
      <div className="p-4 space-y-2.5">
        {place.description && (
          <p className="text-[13px] text-slate-700 leading-relaxed">{place.description}</p>
        )}
        <p className="text-[11px] text-slate-500 font-semibold flex items-start gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
          <span>
            Exact location: {exactLocation(place)}
            {place.locationLabel ? ` · ${place.locationLabel}` : ""}
          </span>
        </p>
        {place.phone && (
          <a href={`tel:${place.phone}`} className="text-[11px] font-bold text-emerald-800">
            Call {place.phone}
          </a>
        )}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="mr-auto text-slate-500 font-semibold text-[11px]">
            {place.distanceKm.toFixed(1)} km from pin
          </div>
          <WebsiteLink href={place.websiteUrl} label="Website" />
          <button
            type="button"
            onClick={() => onNavigate?.(place)}
            className="bg-purple-50 hover:bg-purple-100 text-purple-800 font-extrabold px-3 py-1.5 rounded-xl border border-purple-200 flex items-center gap-1 text-[11px]"
          >
            Navigate <Route className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AccordionBar({
  id,
  title,
  icon: Icon,
  items,
  openId,
  onToggle,
  onNavigate,
}: {
  id: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  items: AnalyzedPlaceDTO[];
  openId: string | null;
  onToggle: (id: string) => void;
  onNavigate?: (place: AnalyzedPlaceDTO) => void;
}) {
  const open = openId === id;
  const countLabel = items.length === 0 ? "No available" : `${items.length}`;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
      >
        <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-sm text-slate-900">{title}</p>
          <p className="text-[11px] text-slate-500 font-semibold">
            {items.length === 0 ? "No available" : `${items.length} closest by distance from your pin`}
          </p>
        </div>
        <span
          className={`text-[10px] font-black px-2 py-1 rounded-lg ${
            items.length === 0 ? "bg-slate-100 text-slate-500" : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {countLabel}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-3 border-t border-slate-100 pt-3">
          {items.length === 0 ? (
            <p className="text-xs font-bold text-slate-500 px-1 py-2">No available</p>
          ) : (
            items.map((place, idx) => (
              <PlaceCard
                key={`${place.kind}-${place.name}-${place.distanceKm}`}
                place={place}
                rank={idx + 1}
                onNavigate={onNavigate}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function AreaAnalysis({
  afterButton,
  picking,
  pickedArea,
  onStartPick,
  onCancelPick,
  onSelectArea,
  onNavigate,
}: {
  afterButton?: ReactNode;
  picking: boolean;
  pickedArea: AreaChoice | null;
  onStartPick: () => void;
  onCancelPick: () => void;
  onSelectArea?: (area: AreaChoice) => void;
  onNavigate?: (place: AnalyzedPlaceDTO) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AreaAnalysisDTO | null>(null);
  const [analyzedAs, setAnalyzedAs] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [handledKey, setHandledKey] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  const runAnalyze = async (area: AreaChoice) => {
    setLoading(true);
    setError(null);
    setOpenId(null);
    onSelectArea?.(area);
    try {
      const data = await contentApi.analyzeArea(area.lat, area.lng, 8);
      setResult(data);
      setAnalyzedAs(area.name);
      window.setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not analyze this area.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!pickedArea) return;
    const key = `${pickedArea.token ?? ""}:${pickedArea.lat},${pickedArea.lng}`;
    if (key === handledKey) return;
    setHandledKey(key);
    void runAnalyze(pickedArea);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedArea]);

  const zoneColor =
    result?.zoneRisk === "red"
      ? "bg-rose-50 border-rose-200 text-rose-900"
      : result?.zoneRisk === "yellow"
        ? "bg-amber-50 border-amber-200 text-amber-900"
        : "bg-emerald-50 border-emerald-200 text-emerald-900";

  return (
    <div className="space-y-4">
      {loading && (
        <div className="fixed inset-0 z-[3000] bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center px-6">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
          <p className="mt-5 text-white font-extrabold text-lg text-center">Analyzing this area…</p>
          <p className="mt-1 text-emerald-100 text-sm font-semibold text-center">
            Finding the closest hospitals, pharmacies, shops and more
          </p>
        </div>
      )}

      {picking ? (
        <div className="space-y-2">
          <div className="w-full flex items-center justify-center gap-2 bg-amber-400 text-amber-950 font-black text-sm py-3.5 rounded-2xl ring-4 ring-amber-200 animate-pulse shadow-md">
            <MapPin className="w-4 h-4 shrink-0" />
            Choose area — tap the map above
          </div>
          <button type="button" onClick={onCancelPick} className="w-full text-xs font-bold text-slate-500 py-1">
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onStartPick}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-sm active:scale-[0.99] transition-all"
        >
          <ScanSearch className={`w-4 h-4 ${loading ? "animate-pulse" : ""}`} />
          Analyze this area
        </button>
      )}

      {afterButton}

      {error && (
        <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl px-3 py-2">
          {error}
        </p>
      )}

      {result && (
        <div ref={resultsRef} className="space-y-3 scroll-mt-24">
          <div className={`rounded-2xl border px-4 py-3 ${zoneColor}`}>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Analyzed area</p>
            <p className="font-extrabold text-sm">{analyzedAs}</p>
            <p className="text-[11px] mt-0.5 font-semibold">
              {result.originLat.toFixed(5)}, {result.originLng.toFixed(5)} · within {result.radiusKm} km
            </p>
            <p className="font-bold text-sm mt-2">
              {result.zoneName || "No mapped safety zone at this pin"}
            </p>
            {result.zoneDescription && (
              <p className="text-[11px] mt-1 leading-relaxed">{result.zoneDescription}</p>
            )}
          </div>

          <AccordionBar id="crimes" title="Recent crimes" icon={ShieldAlert} items={result.crimes} openId={openId} onToggle={(id) => setOpenId(openId === id ? null : id)} onNavigate={onNavigate} />
          <AccordionBar id="hospitals" title="Near hospital" icon={Hospital} items={result.hospitals} openId={openId} onToggle={(id) => setOpenId(openId === id ? null : id)} onNavigate={onNavigate} />
          <AccordionBar id="pharmacies" title="Near pharmacy" icon={Pill} items={result.pharmacies} openId={openId} onToggle={(id) => setOpenId(openId === id ? null : id)} onNavigate={onNavigate} />
          <AccordionBar id="groceries" title="Near grocery shop" icon={ShoppingBasket} items={result.groceries} openId={openId} onToggle={(id) => setOpenId(openId === id ? null : id)} onNavigate={onNavigate} />
          <AccordionBar id="attractions" title="Near tourist spot" icon={Star} items={result.attractions} openId={openId} onToggle={(id) => setOpenId(openId === id ? null : id)} onNavigate={onNavigate} />
          <AccordionBar id="malls" title="Near mall" icon={Store} items={result.malls || []} openId={openId} onToggle={(id) => setOpenId(openId === id ? null : id)} onNavigate={onNavigate} />
          <AccordionBar id="gaming" title="Near gaming cafe" icon={Gamepad2} items={result.gaming || []} openId={openId} onToggle={(id) => setOpenId(openId === id ? null : id)} onNavigate={onNavigate} />
          <AccordionBar id="hotels" title="Near hotel" icon={Hotel} items={result.hotels} openId={openId} onToggle={(id) => setOpenId(openId === id ? null : id)} onNavigate={onNavigate} />
          <AccordionBar id="food" title="Near food" icon={Utensils} items={result.food} openId={openId} onToggle={(id) => setOpenId(openId === id ? null : id)} onNavigate={onNavigate} />
          <AccordionBar id="police" title="Near police" icon={Siren} items={result.police} openId={openId} onToggle={(id) => setOpenId(openId === id ? null : id)} onNavigate={onNavigate} />
        </div>
      )}
    </div>
  );
}
