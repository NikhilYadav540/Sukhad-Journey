"use client";

import React, { useState } from "react";
import {
  MapPin,
  Star,
  ShieldCheck,
  Utensils,
  Compass,
  AlertTriangle,
  Train,
  Sparkles,
  Search,
} from "lucide-react";

// ================= MMR REGIONAL RECOMMENDATIONS DATABASE =================

export interface AreaDetail {
  id: string;
  name: string;
  region: "Western Line" | "Central Line" | "Extended MMR";
  safetyScore: number;
  safetyTag: string;
  vibe: string;
  highlyRecommended: {
    title: string;
    type: string;
    desc: string;
    highlight: string;
  }[];
  foodHighlights: {
    spot: string;
    dish: string;
    type: string;
  }[];
  transitAndSafetyTip: string;
}

const MMR_AREAS: AreaDetail[] = [
  {
    id: "andheri",
    name: "Andheri (West & East)",
    region: "Western Line",
    safetyScore: 92,
    safetyTag: "High Security • Active Nightlife",
    vibe: "Bustling transit hub, Bollywood studios, coastal sunsets & commercial centers.",
    highlyRecommended: [
      {
        title: "Versova Beach & Promenade",
        type: "Coastal Spot",
        desc: "Lesser-crowded coastal promenade famous for quiet sunset walks and trendy cafes.",
        highlight: "⭐ Highly Recommended for Sunsets",
      },
      {
        title: "Mahakali Caves (Kondivite)",
        type: "Heritage Site",
        desc: "19 ancient rock-cut Buddhist caves dating back to the 1st century BCE in Andheri East.",
        highlight: "🏛️ Ancient Heritage Gem",
      },
      {
        title: "Lokhandwala Market",
        type: "Shopping Hub",
        desc: "Famous vibrant open market for street fashion, footwear, and boutique shopping.",
        highlight: "🛍️ Top Shopping Spot",
      },
    ],
    foodHighlights: [
      { spot: "Versova Social & Cafe", dish: "Seafood Bowls & Artisanal Coffee", type: "Cafe / Bistro" },
      { spot: "Lokhandwala Khau Galli", dish: "Frankies, Momos & Shawarma Stalls", type: "Street Food" },
    ],
    transitAndSafetyTip: "Major interchange hub connecting Metro Line 1 (Ghatkopar-Versova) with the Western Local Rail. Stay alert at Andheri Station during 8–10 AM & 6–9 PM peak hours.",
  },
  {
    id: "kandivali",
    name: "Kandivali (West & East)",
    region: "Western Line",
    safetyScore: 95,
    safetyTag: "Family Safe • Suburb Residential Hub",
    vibe: "Family-friendly suburban haven, famous street food trails, and gateway to green parks.",
    highlyRecommended: [
      {
        title: "Mahavir Nagar Khau Galli",
        type: "Food Street",
        desc: "One of Mumbai's most iconic vegetarian street food nightlife streets.",
        highlight: "🔥 Must-Visit Food Hub",
      },
      {
        title: "Growel's 101 Mall (East)",
        type: "Shopping & Dining",
        desc: "Neoclassical European-themed mall with family entertainment and dining.",
        highlight: "🛍️ Family Mall",
      },
    ],
    foodHighlights: [
      { spot: "Mahavir Nagar Food Lane", dish: "Cheese Grill Sandwiches, Ulta Vada Pav & Fusion Dosas", type: "Street Food" },
      { spot: "Bhagwati Fast Food", dish: "Pav Bhaji & Falooda", type: "Late-Night Dining" },
    ],
    transitAndSafetyTip: "Auto-rickshaws strictly operate by official meter rates here. Very safe for late-night family walks around Mahavir Nagar.",
  },
  {
    id: "ghatkopar",
    name: "Ghatkopar (East & West)",
    region: "Central Line",
    safetyScore: 91,
    safetyTag: "Well-Patrolled • Central-East Hub",
    vibe: "Culture-rich central junction, famous vegetarian cuisine, and mega shopping destinations.",
    highlyRecommended: [
      {
        title: "R-City Mall (Ghatkopar West)",
        type: "Mega Mall",
        desc: "One of the largest shopping malls in MMR with 300+ stores, indoor gaming, and multiplexes.",
        highlight: "⭐ Highly Recommended",
      },
      {
        title: "Ghatkopar Khau Galli (Vallabh Road)",
        type: "Food Street",
        desc: "World-renowned street food strip famous for inventive vegetarian dishes.",
        highlight: "🥪 Legendary Eats",
      },
    ],
    foodHighlights: [
      { spot: "Ghatkopar Khau Galli", dish: "Ice Cream Dosa, Remix Cheese Sandwiches & Dabeli", type: "Street Food" },
      { spot: "Achija Fast Food", dish: "Butter Pav Bhaji & Paneer Tikka", type: "Family Dining" },
    ],
    transitAndSafetyTip: "Ghatkopar is the terminal station for Metro Line 1 connecting directly to Western Suburbs (Andheri/Versova). Auto meters are standard.",
  },
  {
    id: "kurla",
    name: "Kurla (West & East)",
    region: "Central Line",
    safetyScore: 84,
    safetyTag: "High-Traffic Hub • Stay Vigilant",
    vibe: "Massive commercial hub, major railway interchange, and premier luxury mall gateway.",
    highlyRecommended: [
      {
        title: "Phoenix Marketcity (Kurla West)",
        type: "Luxury & Entertainment Mall",
        desc: "Colossal multi-floor mall with international brands, concerts, and fine dining.",
        highlight: "💎 Premium Destination",
      },
      {
        title: "BKC Border Promenade",
        type: "Business District",
        desc: "Adjacent to Bandra-Kurla Complex with landscaped walkways, art installations, and upscale bars.",
        highlight: "🏢 Modern Corporate Zone",
      },
    ],
    foodHighlights: [
      { spot: "Phoenix Marketcity Courtyard", dish: "Global Cuisines, Craft Beers & Artisanal Desserts", type: "Fine Dining" },
      { spot: "Kurla West Station Lane", dish: "Seekh Kebabs & Mughlai Rolls", type: "Street Delicacy" },
    ],
    transitAndSafetyTip: "Kurla is a heavy interchange junction (Central + Harbour Lines). Watch belongings on platform bridges and use pre-booked cabs or meters outside Phoenix Marketcity.",
  },
  {
    id: "nallasopara",
    name: "Nallasopara (West & East)",
    region: "Extended MMR",
    safetyScore: 82,
    safetyTag: "Scenic Coastal Edge • Extended Zone",
    vibe: "Historical Buddhist heritage, peaceful black-sand beaches, and budget coastal retreats.",
    highlyRecommended: [
      {
        title: "Kalamb Beach (Nallasopara West)",
        type: "Quiet Beach Retreat",
        desc: "Serene, semi-black sand beach away from city crowds; ideal for peaceful ocean views.",
        highlight: "🏖️ Quiet Escape",
      },
      {
        title: "Ancient Nallasopara Stupa",
        type: "Historical Monument",
        desc: "One of the oldest Buddhist stupas in Western India (Ashokan era archaeological site).",
        highlight: "📜 Ancient History",
      },
    ],
    foodHighlights: [
      { spot: "Kalamb Beach Stalls", dish: "Fresh Coconut Water, Agri-Koli Fish Thali & Snacks", type: "Coastal Eateries" },
      { spot: "Nirmal Naka Eateries", dish: "Maharashtrian Misal Pav & Vadapav", type: "Local Snacks" },
    ],
    transitAndSafetyTip: "Auto-rickshaws operate on fixed rates (no meters). Confirm auto fares before boarding at Nallasopara Station. Plan return travel before 9:00 PM.",
  },
];

// ================= COMPONENT =================

export function MMRAreaGuide() {
  const [selectedAreaId, setSelectedAreaId] = useState<string>("andheri");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAreas = MMR_AREAS.filter(
    (area) =>
      area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      area.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeArea = MMR_AREAS.find((a) => a.id === selectedAreaId) || MMR_AREAS[0];

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