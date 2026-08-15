"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ShieldAlert,
  Train,
  PhoneCall,
  Compass,
  ArrowRight,
  BookOpen,
  Heart,
  Landmark,
  UserCheck,
} from "lucide-react";

export default function GuestOverviewPage({
  onContinueAsGuest,
  onOpenAuth,
}: {
  onContinueAsGuest: () => void;
  onOpenAuth: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"history" | "etiquette">("history");

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-4 max-w-md mx-auto space-y-5 font-sans pb-12">
      
      {/* 1. BRANDING & CULTURAL HEADER */}
      <div className="text-center space-y-2 pt-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Safe Travel & Cultural Portal
        </div>

        <div className="flex flex-col items-center justify-center space-y-1.5 pt-1">
          <div className="w-16 h-16 rounded-full bg-white p-1.5 shadow-md border-2 border-emerald-500/30 flex items-center justify-center">
            <img
              src="/Sukhad-Journeylogo.png"
              alt="Sukhad-Journey Logo"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#0f2942] tracking-tight">
              SUKHAD-JOURNEY
            </h1>
            <p className="text-xs font-extrabold text-emerald-800 font-serif">
              अतिथि देवो भव <span className="font-sans text-[10px] font-normal text-slate-500">| Welcome to Mumbai</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. CITY HISTORY & CULTURE CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-5 shadow-lg space-y-4 border border-slate-700/50">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-400" />
            <h2 className="font-extrabold text-sm tracking-wide">City Heritage & Culture</h2>
          </div>
          
          <div className="flex bg-slate-800 p-0.5 rounded-xl text-[10px] font-bold border border-slate-700">
            <button
              onClick={() => setActiveTab("history")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeTab === "history" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab("etiquette")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeTab === "etiquette" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Culture Tips
            </button>
          </div>
        </div>

        {activeTab === "history" ? (
          <div className="space-y-2 text-xs leading-relaxed text-slate-300">
            <p>
              <strong className="text-emerald-300">From 7 Islands to 'Maximum City':</strong> Mumbai was originally an archipelago of seven Portuguese islands, merged through centuries of land reclamation under British rule.
            </p>
            <p className="text-[11px] text-slate-400">
              Today, it is India’s financial, cinematic, and cultural powerhouse—known for its resilient spirit (*'Spirit of Mumbai'*), historic Victorian Gothic architecture, and warm hospitality.
            </p>
          </div>
        ) : (
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <Heart className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-[11px]">
                <strong className="text-white">The 'Aamchi' Warmth:</strong> Locals are generally helpful. Greeting with <em>"Namaste"</em> or calling auto drivers <em>"Bhaiyya"</em> builds instant rapport!
              </p>
            </div>
            <div className="flex items-start gap-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <BookOpen className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11px]">
                <strong className="text-white">Temple Etiquette:</strong> Remove shoes before entering shrines and keep shoulders covered.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. THE 3 CHERRY-ON-TOP ESSENTIAL UTILITIES */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">
          ⚡ Essential Tourist Kit (Instant Access)
        </h3>

        <div className="grid grid-cols-1 gap-2.5">
          {/* Essential 1: Emergency SOS */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">24/7 Police & Tourist Helpline</h4>
                <p className="text-[10px] text-slate-500">1-Tap Dial 112 / Tourist Assistance 1363</p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
              Live Ready
            </span>
          </div>

          {/* Essential 2: Transit Navigator */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
                <Train className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Suburban Train Route Finder</h4>
                <p className="text-[10px] text-slate-500">Interchange maps & local fares</p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
              Offline Ready
            </span>
          </div>

          {/* Essential 3: Meter & Scam Defense */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-100 text-sky-700 rounded-xl">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Meter Fare & Scam Radar</h4>
                <p className="text-[10px] text-slate-500">Sanctioned taxi/auto tariff estimator</p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-sky-800 bg-sky-50 px-2 py-1 rounded-lg border border-sky-200">
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* 4. ACTIONS: EXPLORE AS GUEST VS OPTIONAL PASS */}
      <div className="space-y-2.5 pt-2">
        <button
          onClick={onContinueAsGuest}
          className="w-full bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 hover:from-emerald-800 hover:to-teal-700 text-white font-extrabold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-200 text-xs active:scale-98"
        >
          <Compass className="w-4 h-4" />
          <span>Explore Portal as Guest</span>
          <ArrowRight className="w-4 h-4 ml-auto" />
        </button>

        <button
          onClick={onOpenAuth}
          className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all text-xs"
        >
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Register / Login for Digital ID Pass</span>
        </button>
      </div>

    </div>
  );
}