"use client";

import React, { useState } from "react";
import { ShieldAlert, MapPin, BadgeCheck, Phone, FileText, CheckCircle2, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function PoliceDashboard() {
  const [selectedAlert, setSelectedAlert] = useState(1);

  // Mock incoming emergency alerts
  const alerts = [
    {
      id: 1,
      name: "Demo Tourist A",
      did: "DID:0x8F...201",
      phone: "Not available in demo",
      location: "Bandra Fort Promenade",
      lat: "19.0410",
      lng: "72.8182",
      time: "2 mins ago",
      status: "ACTIVE EMERGENCY",
      risk: "High",
    },
    {
      id: 2,
      name: "Demo Tourist B",
      did: "DID:0x3A...904",
      phone: "Not available in demo",
      location: "Colaba Causeway Alley",
      lat: "18.9217",
      lng: "72.8330",
      time: "14 mins ago",
      status: "PENDING INVESTIGATION",
      risk: "Medium",
    },
  ];

  const current = alerts.find((a) => a.id === selectedAlert) || alerts[0];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-lg text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" /> Mumbai Central Emergency Dispatch
            </h1>
            <p className="text-xs text-slate-400">Smart Safety & Geo-Fence Incident Response Network</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-slate-300 font-mono">LIVE CONNECTED</span>
        </div>
      </header>

      <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-center text-xs text-amber-200">
        Prototype only — alerts are fictional and dispatch, calling, and E-FIR actions are disabled.
      </div>

      {/* Main Grid View */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12">
        
        {/* Left Column: Live Incident Feed */}
        <div className="md:col-span-4 border-r border-slate-800 bg-slate-900/40 p-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Incoming SOS Alerts</span>
            <RefreshCw className="w-3.5 h-3.5 text-slate-500 cursor-pointer" />
          </h2>

          {alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => setSelectedAlert(alert.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                selectedAlert === alert.id
                  ? "bg-red-950/50 border-red-600"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-red-400 animate-pulse">{alert.status}</span>
                <span className="text-[10px] text-slate-500">{alert.time}</span>
              </div>
              <h3 className="font-bold text-sm text-white mt-1">{alert.name}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-red-400" /> {alert.location}
              </p>
            </div>
          ))}
        </div>

        {/* Right Column: Selected Alert Incident Details */}
        <div className="md:col-span-8 p-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Victim Identity</span>
                <h2 className="text-2xl font-black text-white mt-1">{current.name}</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Digital ID: {current.did}</p>
              </div>
              <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold rounded-full">
                High Priority Signal
              </span>
            </div>

            {/* GPS & Call Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Location Coordinates</span>
                <p className="text-sm font-semibold text-slate-200 mt-1">{current.location}</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{current.lat} N, {current.lng} E</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Contact Number</span>
                <p className="text-sm font-semibold text-slate-200 mt-1">{current.phone}</p>
                <p className="text-xs text-emerald-400 font-medium mt-0.5">Verified via Aadhaar/Passport</p>
              </div>
            </div>

            {/* Action Buttons for Officers */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                disabled
                title="Unavailable in the prototype"
                className="px-4 py-2.5 bg-blue-950 text-blue-200/60 rounded-xl text-xs font-bold flex items-center gap-2 cursor-not-allowed"
              >
                <Phone className="w-4 h-4" /> Calling unavailable in demo
              </button>
              <button
                type="button"
                disabled
                title="Unavailable in the prototype"
                className="px-4 py-2.5 bg-red-950 text-red-200/60 rounded-xl text-xs font-bold flex items-center gap-2 cursor-not-allowed"
              >
                <ShieldAlert className="w-4 h-4" /> Dispatch unavailable in demo
              </button>
              <button
                type="button"
                disabled
                title="Unavailable in the prototype"
                className="px-4 py-2.5 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 cursor-not-allowed"
              >
                <FileText className="w-4 h-4 text-yellow-400" /> E-FIR unavailable in demo
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
