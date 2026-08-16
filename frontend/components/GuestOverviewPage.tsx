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
  MapPinned,
  Hotel,
  Languages,
  CalendarDays,
  BadgeCheck,
  ShieldCheck,
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
    <div className="relative min-h-screen bg-[#f8fafc] text-slate-800 p-4 max-w-md mx-auto font-sans pb-12">
      <div className="relative z-10 space-y-5">
      <div className="flex justify-end">
        <button
          onClick={onOpenAuth}
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[10px] font-extrabold text-emerald-800 shadow-sm transition-colors hover:bg-emerald-50"
          aria-label="Log in or sign up"
        >
          <UserCheck className="h-3.5 w-3.5" />
          Login / Sign up
        </button>
      </div>

      {/* 1. BRANDING & CULTURAL HEADER */}
      <div className="text-center space-y-2">
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

      {/* Hero photo — full-width after header, pushes remaining content down */}
      <div className="-mx-4">
        <img
          src="/Sukhad-Journeylogo.png"
          alt="Sukhad-Journey — Your journey, our priority"
          className="block w-full h-auto bg-white"
        />
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

      {/* 5. WHAT SUKHAD-JOURNEY DOES */}
      <section className="pt-5 space-y-3" aria-labelledby="what-we-do-title">
        <div className="px-1">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">
            Your Mumbai companion
          </p>
          <h2 id="what-we-do-title" className="mt-1 text-lg font-black tracking-tight text-slate-900">
            Safer, simpler travel across MMR
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
            Sukhad-Journey brings safety support, local transport guidance, trusted places to visit, and cultural tips into one mobile-friendly portal for every visitor.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            ["Safety first", "SOS, helplines & alerts", ShieldCheck, "bg-rose-50 text-rose-700"],
            ["Travel smart", "Routes & fair fares", Train, "bg-amber-50 text-amber-700"],
            ["Explore more", "Places, food & stays", Compass, "bg-emerald-50 text-emerald-700"],
          ].map(([title, description, Icon, colors]) => {
            const FeatureIcon = Icon as typeof ShieldCheck;
            return (
              <div key={title as string} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
                <div className={`inline-flex rounded-xl p-2 ${colors as string}`}>
                  <FeatureIcon className="h-4 w-4" />
                </div>
                <p className="mt-2 text-[11px] font-extrabold text-slate-900">{title as string}</p>
                <p className="mt-0.5 text-[9px] leading-snug text-slate-500">{description as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. HOW TO USE */}
      <section className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4" aria-labelledby="how-it-works-title">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-emerald-600 p-2 text-white">
            <MapPinned className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Simple to use</p>
            <h2 id="how-it-works-title" className="text-sm font-black text-slate-900">How Sukhad-Journey works</h2>
          </div>
        </div>

        <ol className="mt-4 space-y-3">
          {[
            ["1", "Start as a guest", "Browse safety tools, local guidance, and places instantly—no account needed."],
            ["2", "Plan with confidence", "Find train routes, estimate fares, check safety tips, and discover MMR."],
            ["3", "Register when you need more", "Create your digital tourist pass to save your profile and access personalised support."],
          ].map(([number, title, description]) => (
            <li key={number} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-black text-emerald-700 shadow-sm ring-1 ring-emerald-200">
                {number}
              </span>
              <div className="pt-0.5">
                <p className="text-[11px] font-extrabold text-slate-900">{title}</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-slate-600">{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 7. FULL FEATURE OVERVIEW */}
      <section className="space-y-3" aria-labelledby="features-title">
        <div className="px-1">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Inside the portal</p>
          <h2 id="features-title" className="mt-1 text-base font-black text-slate-900">Everything you need for your journey</h2>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {[
            ["Emergency & safety", "One-tap SOS, emergency contacts, safety zones and scam awareness.", PhoneCall, "text-rose-600 bg-rose-50"],
            ["MMR travel guide", "Explore Mumbai, Thane and Navi Mumbai with practical local guidance.", MapPinned, "text-emerald-700 bg-emerald-50"],
            ["Train & fare tools", "Navigate suburban lines and estimate local train, auto, bus and cab fares.", Train, "text-amber-700 bg-amber-50"],
            ["Places to stay & eat", "Discover curated attractions, verified stays and popular food spots.", Hotel, "text-pink-700 bg-pink-50"],
            ["Local language help", "Learn useful Bambaiya Hindi phrases for everyday conversations.", Languages, "text-violet-700 bg-violet-50"],
            ["Plans & digital pass", "Use ready-made itineraries and carry your tourist identity pass.", CalendarDays, "text-sky-700 bg-sky-50"],
          ].map(([title, description, Icon, colors]) => {
            const FeatureIcon = Icon as typeof ShieldCheck;
            return (
              <div key={title as string} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
                <div className={`inline-flex rounded-xl p-2 ${colors as string}`}>
                  <FeatureIcon className="h-4 w-4" />
                </div>
                <h3 className="mt-2 text-[11px] font-extrabold text-slate-900">{title as string}</h3>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{description as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="border-t border-slate-200 pt-5 text-center">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#0f2942]">
          <BadgeCheck className="h-4 w-4 text-emerald-600" />
          SUKHAD-JOURNEY
        </div>
        <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
          Smart tourist assistance and safety support for the Mumbai Metropolitan Region.
        </p>
        <p className="mt-3 text-[10px] font-semibold text-emerald-700">अतिथि देवो भव · Your journey, our priority</p>
        <p className="mt-3 text-[9px] text-slate-400">© {new Date().getFullYear()} Sukhad-Journey. Travel safely and respectfully.</p>
      </footer>
      </div>
    </div>
  );
}
