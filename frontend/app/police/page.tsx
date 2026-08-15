"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, MapPin, Phone, FileText, ArrowLeft, RefreshCw, Lock, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { policeApi, getPoliceToken, setPoliceToken, clearPoliceToken } from "@/lib/api";

interface Alert {
  id: number;
  name: string;
  did: string;
  phone: string;
  location: string;
  lat: number;
  lng: number;
  time: string;
  status: string;
  risk: string;
}

export default function PoliceDashboard() {
  const [token, setTokenState] = useState<string | null>(() => getPoliceToken());
  const [officerName, setOfficerName] = useState<string>("");
  const [precinct, setPrecinct] = useState<string | null>(null);

  const [badgeId, setBadgeId] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<number | null>(null);
  const [alertsError, setAlertsError] = useState<string | null>(null);

  const fetchAlerts = (activeToken: string) => {
    policeApi
      .getAlerts(activeToken)
      .then((data) => {
        setAlerts(data);
        setAlertsError(null);
        if (data.length > 0 && selectedAlert === null) setSelectedAlert(data[0].id);
      })
      .catch((err) => {
        setAlertsError(err.message || "Couldn't load alerts.");
        if (err.message?.includes("credentials") || err.message?.includes("401")) {
          clearPoliceToken();
          setTokenState(null);
        }
      });
  };

  useEffect(() => {
    if (!token) return;
    fetchAlerts(token);
    const interval = setInterval(() => fetchAlerts(token), 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    policeApi
      .login(badgeId, password)
      .then((res) => {
        setPoliceToken(res.access_token);
        setTokenState(res.access_token);
        setOfficerName(res.officer_name);
        setPrecinct(res.precinct);
      })
      .catch((err) => setLoginError(err.message || "Invalid badge ID or password."))
      .finally(() => setLoginLoading(false));
  };

  const handleLogout = () => {
    clearPoliceToken();
    setTokenState(null);
    setAlerts([]);
    setSelectedAlert(null);
  };

  const handleResolve = () => {
    if (!token || !selectedAlert) return;
    policeApi
      .updateAlertStatus(token, selectedAlert, "RESOLVED")
      .then(() => fetchAlerts(token))
      .catch((err) => console.error("Failed to update alert:", err));
  };

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <Link href="/" className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs">
            <ArrowLeft className="w-4 h-4" /> Back to main site
          </Link>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            <h1 className="font-bold text-lg text-white">Officer Login</h1>
          </div>
          <p className="text-xs text-slate-400">
            Sign in with your badge ID to view live SOS alerts from tourists in your jurisdiction.
          </p>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500">Badge ID</label>
              <div className="mt-1 flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5">
                <BadgeCheck className="w-4 h-4 text-slate-500" />
                <input
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  placeholder="MUM-1024"
                  className="bg-transparent outline-none text-sm w-full placeholder:text-slate-600"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500">Password</label>
              <div className="mt-1 flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5">
                <Lock className="w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="bg-transparent outline-none text-sm w-full placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            {loginError && <p className="text-xs text-red-400">{loginError}</p>}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm transition-all"
            >
              {loginLoading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-[10px] text-slate-600 text-center">
              Demo credentials: badge <span className="font-mono">MUM-1024</span>, password{" "}
              <span className="font-mono">demo1234</span>
            </p>
          </form>
        </div>
      </main>
    );
  }

  const current = alerts.find((a) => a.id === selectedAlert) || alerts[0];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-lg text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" /> {precinct || "Emergency Dispatch"}
            </h1>
            <p className="text-xs text-slate-400">
              {officerName ? `Signed in as ${officerName}` : "Smart Safety & Geo-Fence Incident Response Network"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-slate-300 font-mono">LIVE CONNECTED</span>
          <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-white underline">
            Log out
          </button>
        </div>
      </header>

      {alertsError && (
        <div className="bg-red-500/10 border-b border-red-500/30 px-4 py-2 text-center text-xs text-red-300">
          {alertsError}
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-4 border-r border-slate-800 bg-slate-900/40 p-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Incoming SOS Alerts ({alerts.length})</span>
            <RefreshCw
              className="w-3.5 h-3.5 text-slate-500 cursor-pointer hover:text-white"
              onClick={() => fetchAlerts(token)}
            />
          </h2>

          {alerts.length === 0 && (
            <p className="text-xs text-slate-500 py-6 text-center">No active alerts right now.</p>
          )}

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

        <div className="md:col-span-8 p-6 space-y-6">
          {current ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Tourist Identity</span>
                  <h2 className="text-2xl font-black text-white mt-1">{current.name}</h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">Digital ID: {current.did}</p>
                </div>
                <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold rounded-full">
                  {current.risk} Priority
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Location Coordinates</span>
                  <p className="text-sm font-semibold text-slate-200 mt-1">{current.location}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {current.lat.toFixed(4)} N, {current.lng.toFixed(4)} E
                  </p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Contact Number</span>
                  <p className="text-sm font-semibold text-slate-200 mt-1">{current.phone}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={current.phone.startsWith("+") ? `tel:${current.phone}` : undefined}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    current.phone.startsWith("+")
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-950 text-blue-200/60 cursor-not-allowed pointer-events-none"
                  }`}
                >
                  <Phone className="w-4 h-4" /> Call Tourist
                </a>
                <button
                  type="button"
                  onClick={handleResolve}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4" /> Mark Resolved
                </button>
                <button
                  type="button"
                  disabled
                  title="Not yet implemented"
                  className="px-4 py-2.5 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 cursor-not-allowed"
                >
                  <FileText className="w-4 h-4 text-yellow-400" /> File E-FIR
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Select an alert from the left to view details.</p>
          )}
        </div>
      </div>
    </main>
  );
}
