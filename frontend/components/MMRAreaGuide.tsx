"use client";

import React, { useEffect, useState } from "react";
import {
  MapPin,
  ShieldCheck,
  Utensils,
  Train,
  Sparkles,
  Search,
} from "lucide-react";
import { contentApi } from "@/lib/api";

// ================= MMR REGIONAL RECOMMENDATIONS DATABASE =================

export interface AreaDetail {
  id: string;
  name: string;
  region: string;
  safetyScore: number;
  safetyTag: string;
  vibe: string;
  image?: string | null;
  websiteUrl?: string | null;
  highlyRecommended: {
    title: string;
    type: string;
    desc: string;
    highlight: string;
    image?: string | null;
    websiteUrl?: string | null;
  }[];
  foodHighlights: {
    spot: string;
    dish: string;
    type: string;
  }[];
  transitAndSafetyTip: string;
}


// ================= COMPONENT =================

export function MMRAreaGuide() {
  const [areas, setAreas] = useState<AreaDetail[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    contentApi
      .mmrAreas()
      .then((data) => {
        setAreas(data as AreaDetail[]);
        if (data.length > 0) setSelectedAreaId(data[0].id);
      })
      .catch((err) => setError(err.message || "Couldn't load area guide."))
      .finally(() => setLoading(false));
  }, []);

  const filteredAreas = areas.filter(
    (area) =>
      area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      area.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeArea = areas.find((a) => a.id === selectedAreaId) || areas[0];

  if (loading) {
    return <p className="text-xs text-slate-500 py-6 text-center">Loading area guide...</p>;
  }
  if (error) {
    return <p className="text-xs text-red-400 py-6 text-center">{error}</p>;
  }
  if (!activeArea) {
    return <p className="text-xs text-slate-500 py-6 text-center">No area data available.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Section Title */}
      <div>
        <h2 className="font-bold text-base text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-400" /> MMR Area-Wise Travel Guide
        </h2>
        <p className="text-xs text-slate-400">
          Curated recommendations across Andheri, Kandivali, Ghatkopar, Kurla & Nallasopara
        </p>
      </div>

      {/* Area Selector Tabs & Search */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search area (e.g. Andheri, Ghatkopar)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Horizontal Scrollable Area Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filteredAreas.map((area) => (
            <button
              key={area.id}
              onClick={() => setSelectedAreaId(area.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedAreaId === area.id
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-950"
                  : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
              }`}
            >
              {area.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Area Detail Card */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4 animate-fade-in">
        {activeArea.image && (
          <img
            src={activeArea.image}
            alt=""
            className="w-full h-32 object-cover rounded-xl"
          />
        )}
        {/* Area Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-white">{activeArea.name}</h3>
              <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                {activeArea.region}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{activeArea.vibe}</p>
            {activeArea.websiteUrl && (
              <a
                href={activeArea.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-2 text-[10px] font-bold text-emerald-400 hover:text-emerald-300"
              >
                Area page ↗
              </a>
            )}
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-black text-emerald-400 flex items-center gap-1 justify-end">
              <ShieldCheck className="w-3.5 h-3.5" /> {activeArea.safetyScore}%
            </span>
            <span className="text-[9px] text-slate-400 font-medium block mt-0.5">
              {activeArea.safetyTag}
            </span>
          </div>
        </div>

        {/* Highly Recommended Attractions */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Highly Recommended Spots
          </h4>

          <div className="grid gap-2">
            {activeArea.highlyRecommended.map((spot, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl space-y-1"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-white">{spot.title}</span>
                  <span className="text-[9px] font-extrabold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    {spot.highlight}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{spot.desc}</p>
                {spot.websiteUrl && (
                  <a href={spot.websiteUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-emerald-400">
                    More ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Must-Try Food & Khau Galli Highlights */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5" /> Food & Khau Galli Highlights
          </h4>

          <div className="grid grid-cols-1 gap-2">
            {activeArea.foodHighlights.map((food, idx) => (
              <div
                key={idx}
                className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs"
              >
                <div>
                  <p className="font-bold text-slate-200">{food.spot}</p>
                  <p className="text-[10px] text-orange-300">Must Try: {food.dish}</p>
                </div>
                <span className="text-[9px] text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                  {food.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Transit & Local Safety Tip */}
        <div className="bg-blue-950/30 border border-blue-800/40 p-3 rounded-xl text-xs space-y-1">
          <p className="font-bold text-blue-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <Train className="w-3.5 h-3.5 text-blue-400" /> Transit & Local Tip
          </p>
          <p className="text-slate-300 text-[11px] leading-relaxed">{activeArea.transitAndSafetyTip}</p>
        </div>
      </div>
    </div>
  );
}