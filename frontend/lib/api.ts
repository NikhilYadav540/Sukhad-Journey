// Central API client for the FastAPI backend.
// Browser requests use same-origin `/api` and `/static` paths; Next.js rewrites
// them to FastAPI (see next.config.ts). Set NEXT_PUBLIC_API_URL only when the
// frontend is hosted on a different origin than the API.

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

const TOKEN_KEY = "sukhad_access_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
}

const POLICE_TOKEN_KEY = "sukhad_police_token";

export function getPoliceToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(POLICE_TOKEN_KEY);
}

export function setPoliceToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem(POLICE_TOKEN_KEY, token);
}

export function clearPoliceToken() {
  if (typeof window !== "undefined") localStorage.removeItem(POLICE_TOKEN_KEY);
}

/** Prefix backend-relative paths like `/static/qr_codes/x.png`. */
export function assetUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

function formatDetail(detail: unknown): string {
  if (!detail) return "Request failed";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "msg" in item) {
          return String((item as { msg: string }).msg);
        }
        return JSON.stringify(item);
      })
      .join("; ");
  }
  return JSON.stringify(detail);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  authToken?: string | null,
  timeoutMs = 20000,
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };
  if (options.body) headers["Content-Type"] = "application/json";
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers, signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Request timed out. Start the backend with uvicorn on port 8000.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = formatDetail(body.detail) || detail;
    } catch {
      /* ignore parse errors */
    }
    if (/internal server error/i.test(detail)) {
      throw new Error("The server was busy. Please try again.");
    }
    throw new Error(detail);
  }

  if (res.status === 204) return undefined as unknown as T;
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  return JSON.parse(text) as T;
}

// ---------------- Auth ----------------
export const authApi = {
  requestOtp: (phone_number: string) =>
    request<{ ok: boolean; message: string; sms_sent: boolean; dev_otp?: string | null }>(
      "/api/auth/request-otp",
      { method: "POST", body: JSON.stringify({ phone_number }) }
    ),

  verifyOtp: (phone_number: string, otp_code: string) =>
    request<{ access_token: string; token_type: string; is_new_user: boolean }>(
      "/api/auth/verify-otp",
      { method: "POST", body: JSON.stringify({ phone_number, otp_code }) }
    ),

  googleLogin: (payload: { credential?: string; access_token?: string }) =>
    request<{ access_token: string; token_type: string; is_new_user: boolean }>(
      "/api/auth/google",
      { method: "POST", body: JSON.stringify(payload) }
    ),

  getMe: (token: string) =>
    request<{
      id: number; phone_number: string | null; full_name: string | null; email: string | null;
      date_of_birth: string | null; gender: string | null; nationality: string | null;
      emergency_contact_name: string | null; emergency_contact_phone: string | null;
      is_verified: boolean; created_at: string;
    }>("/api/auth/me", {}, token),

    updateMe: (
    token: string,
    payload: Partial<{
      full_name: string; email: string; date_of_birth: string; gender: string;
      nationality: string; emergency_contact_name: string; emergency_contact_phone: string;
      friend_contacts: { name: string; phone_number: string; relation?: string }[];
    }>
  ) =>
    request<{
      id: number; phone_number: string | null; full_name: string | null; email: string | null;
      date_of_birth: string | null; gender: string | null; nationality: string | null;
      emergency_contact_name: string | null; emergency_contact_phone: string | null;
      is_verified: boolean; created_at: string;
    }>("/api/auth/me", { method: "PATCH", body: JSON.stringify(payload) }, token),
};

// ---------------- Tourist Pass ----------------
export const passApi = {
  issue: (token: string, valid_days = 14) =>
    request<{ did: string; qrImageUrl: string | null; issuedAt: string; validTill: string; status: string; idType: string }>(
      "/api/tourist-pass", { method: "POST", body: JSON.stringify({ valid_days }) }, token
    ),
  getMine: (token: string) =>
    request<{ did: string; qrImageUrl: string | null; issuedAt: string; validTill: string; status: string; idType: string }>(
      "/api/tourist-pass/me", {}, token
    ),
  verify: (pass_code: string) =>
    request<{ did: string; qrImageUrl: string | null; issuedAt: string; validTill: string; status: string; idType: string }>(
      `/api/tourist-pass/verify/${encodeURIComponent(pass_code)}`
    ),
};

// ---------------- Emergency / SOS ----------------
export interface EmergencyContactDTO {
  id: number;
  name: string;
  phone_number: string;
  relation: string | null;
}

export const emergencyApi = {
  getHelpline: () => request<{ national_emergency_number: string; tourist_police_note: string }>("/api/emergency/helpline"),

  triggerSOS: (payload: { latitude: number; longitude: number; location_label?: string; note?: string }, token?: string | null) =>
    request<{ status: string; alert_id: number; contacts_notified: string[]; helpline: string }>(
      "/api/emergency/sos", { method: "POST", body: JSON.stringify(payload) }, token
    ),

  listContacts: (token: string) =>
    request<EmergencyContactDTO[]>("/api/emergency/contacts", {}, token),

  addContact: (token: string, payload: { name: string; phone_number: string; relation?: string }) =>
    request<EmergencyContactDTO>(
      "/api/emergency/contacts", { method: "POST", body: JSON.stringify(payload) }, token
    ),

  deleteContact: (token: string, contactId: number) =>
    request<void>(`/api/emergency/contacts/${contactId}`, { method: "DELETE" }, token),
};

// ---------------- Content catalogs (guest-accessible) ----------------
export interface AttractionDTO {
  id: number; name: string; region: string; category: string; rating: number;
  distance: string | null; safetyStatus: string | null; image: string | null;
  websiteUrl?: string | null; description: string | null; mapQuery: string | null;
  latitude?: number | null; longitude?: number | null;
}
export interface HotelDTO {
  id: number; name: string; category: string; rating: number;
  priceRange: string | null; distance: string | null; description: string | null;
  image?: string | null; websiteUrl?: string | null;
}
export interface FoodSpotDTO {
  id: number; name: string; cuisine: string; mustTryDish: string | null;
  rating: number; distance: string | null; description: string | null;
  image?: string | null; websiteUrl?: string | null;
}
export interface EmergencyServiceCategoryDTO {
  category: string; icon_key: string; color: string | null;
  list: { name: string; phone: string; distance: string | null; location: string | null; websiteUrl?: string | null; latitude?: number | null; longitude?: number | null }[];
}
export interface LocalScamDTO {
  id: number; title: string; location: string | null; severity: string;
  description: string | null; prevention: string | null;
  image?: string | null; websiteUrl?: string | null;
}
export interface PhraseCategoryDTO {
  category: string;
  phrases: { hindi: string; translation: string; phonetic: string | null }[];
}
export interface SmartItineraryDTO {
  id: string; title: string; subtitle: string | null; image?: string | null;
  timeSlots: { time: string; activity: string; note: string | null }[];
}
export interface MMRAreaDTO {
  id: string; name: string; region: string; safetyScore: number; safetyTag: string | null;
  vibe: string | null; image?: string | null; websiteUrl?: string | null;
  highlyRecommended: { title: string; type: string | null; desc: string | null; highlight: string | null; image?: string | null; websiteUrl?: string | null }[];
  foodHighlights: { spot: string; dish: string | null; type: string | null }[];
  transitAndSafetyTip: string | null;
}
export interface StationDTO {
  name: string; line: string | null; hub: boolean;
}
export interface DangerZoneDTO {
  id: number; name: string; riskLevel: string; crimeRate: number | null;
  centerLat: number; centerLng: number; radiusMeters: number;
  description: string | null; image?: string | null; websiteUrl?: string | null;
}
export interface CrimeReportDTO {
  id: number; crimeType: string; locationLabel: string | null; description: string | null;
  latitude: number | null; longitude: number | null; status: string;
  occurredAt: string | null; image?: string | null; websiteUrl?: string | null;
  dangerZoneId?: number | null;
}
export interface NewsItemDTO {
  id: number; title: string; summary: string | null; category: string | null;
  publishedAt: string | null; image?: string | null; websiteUrl?: string | null;
}

export interface AnalyzedPlaceDTO {
  name: string;
  kind: string;
  category: string | null;
  description: string | null;
  image: string | null;
  websiteUrl: string | null;
  locationLabel: string | null;
  latitude: number | null;
  longitude: number | null;
  distanceKm: number;
  mapQuery: string | null;
  phone: string | null;
}

export interface AreaAnalysisDTO {
  originLat: number;
  originLng: number;
  radiusKm: number;
  zoneName: string | null;
  zoneRisk: string | null;
  zoneDescription: string | null;
  crimes: AnalyzedPlaceDTO[];
  hospitals: AnalyzedPlaceDTO[];
  pharmacies: AnalyzedPlaceDTO[];
  groceries: AnalyzedPlaceDTO[];
  police: AnalyzedPlaceDTO[];
  attractions: AnalyzedPlaceDTO[];
  hotels: AnalyzedPlaceDTO[];
  food: AnalyzedPlaceDTO[];
  malls: AnalyzedPlaceDTO[];
  gaming: AnalyzedPlaceDTO[];
}

export const contentApi = {
  attractions: (region?: string) =>
    request<AttractionDTO[]>(`/api/content/attractions${region && region !== "All" ? `?region=${encodeURIComponent(region)}` : ""}`),
  hotels: () => request<HotelDTO[]>("/api/content/hotels"),
  food: () => request<FoodSpotDTO[]>("/api/content/food"),
  emergencyServices: () => request<EmergencyServiceCategoryDTO[]>("/api/content/emergency-services"),
  scams: () => request<LocalScamDTO[]>("/api/content/scams"),
  phrasebook: () => request<PhraseCategoryDTO[]>("/api/content/phrasebook"),
  smartItineraries: () => request<SmartItineraryDTO[]>("/api/content/smart-itineraries"),
  mmrAreas: () => request<MMRAreaDTO[]>("/api/content/mmr-areas"),
  stations: () => request<StationDTO[]>("/api/content/stations"),
  dangerZones: () => request<DangerZoneDTO[]>("/api/content/danger-zones"),
  crimeReports: () => request<CrimeReportDTO[]>("/api/content/crime-reports"),
  news: () => request<NewsItemDTO[]>("/api/content/news"),
  analyzeArea: async (lat: number, lng: number, radiusKm = 8) => {
    const path =
      `/api/content/analyze?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}&radius_km=${encodeURIComponent(String(radiusKm))}`;
    try {
      return await request<AreaAnalysisDTO>(path, {}, null, 45000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (!/busy|timed out|try again|connection/i.test(msg)) throw err;
      await new Promise((resolve) => setTimeout(resolve, 700));
      return request<AreaAnalysisDTO>(path, {}, null, 45000);
    }
  },
};

// ---------------- Trains & Fare ----------------
export interface RouteResponseDTO {
  origin: string; destination: string; line: string; interchange: string | null;
  legs: { line: string; from_station: string; to_station: string; num_stops: number }[];
  estimatedMins: number; fare: number;
}

export interface FareEstimateDTO {
  distance_km: number; local_train_fare: number; best_bus_fare: number; auto_fare: number; cab_fare: number;
}

export const trainApi = {
  getRoute: (origin: string, destination: string) =>
    request<RouteResponseDTO>(`/api/trains/route?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`),
};

export const fareApi = {
  estimate: (origin: string, destination: string, distance_km?: number) =>
    request<FareEstimateDTO>(
      "/api/fare/estimate", { method: "POST", body: JSON.stringify({ origin, destination, distance_km }) }
    ),
};

// ---------------- Itineraries (logged-in users) ----------------
export const itineraryApi = {
  list: (token: string) => request("/api/itineraries", {}, token),
  create: (token: string, payload: unknown) =>
    request("/api/itineraries", { method: "POST", body: JSON.stringify(payload) }, token),
  remove: (token: string, id: number) =>
    request(`/api/itineraries/${id}`, { method: "DELETE" }, token),
};

// ---------------- Police portal ----------------
export const policeApi = {
  login: (badge_id: string, password: string) =>
    request<{ access_token: string; officer_name: string; precinct: string | null }>(
      "/api/police/login", { method: "POST", body: JSON.stringify({ badge_id, password }) }
    ),
  getAlerts: (token: string) =>
    request<
      { id: number; name: string; did: string; phone: string; location: string; lat: number; lng: number; time: string; status: string; risk: string }[]
    >("/api/police/alerts", {}, token),
  updateAlertStatus: (token: string, alertId: number, newStatus: string) =>
    request(`/api/police/alerts/${alertId}/status?new_status=${encodeURIComponent(newStatus)}`, { method: "PATCH" }, token),
};
