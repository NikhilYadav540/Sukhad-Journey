"use client";
import React from "react";
import { ShieldCheck, AlertCircle } from "lucide-react";

interface SafetyHeaderProps {
  score: number;
  zoneName: string;
  isDangerZone: boolean;
}

export function SafetyHeader({ score, zoneName, isDangerZone }: SafetyHeaderProps) {
  return (
    <div className={`p-4 rounded-xl border shadow-sm transition-all ${
      isDangerZone 
        ? "bg-red-950/80 border-red-800 text-red-200" 
        : "bg-emerald-950/80 border-emerald-800 text-emerald-200"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isDangerZone ? (
            <AlertCircle className="w-8 h-8 text-red-500 animate-bounce" />
          ) : (
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          )}
          <div>
            <h2 className="font-bold text-base md:text-lg">{zoneName}</h2>
            <p className="text-xs opacity-80">
              {isDangerZone ? "⚠️ High Risk Area - Red Zone Active" : "✓ Safe Zone • Geo-Fence Verified"}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black">{score}%</div>
          <div className="text-[10px] font-semibold uppercase tracking-wider opacity-75">Safety Index</div>
        </div>
      </div>
    </div>
  );
}