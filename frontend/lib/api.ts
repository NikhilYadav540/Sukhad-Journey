// Central API client for the FastAPI backend.
// Set NEXT_PUBLIC_API_URL in .env.local (defaults to localhost:8000 for dev).

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

async function request<T>(
  path: string,
  options: RequestInit = {},
  authToken?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* ignore parse errors */
    }
    throw new Error(detail);
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

// ---------------- Auth ----------------
export const authApi = {
  requestOtp: (phone_number: string) =>
    request<void>("/api/auth/request-otp", { method: "POST", body: JSON.stringify({ phone_number }) }),

  verifyOtp: (phone_number: string, otp_code: string) =>
    request<{ access_token: string; token_type: string; is_new_user: boolean }>(
      "/api/auth/verify-otp",
      { method: "POST", body: JSON.stringify({ phone_number, otp_code }) }
    ),

  getMe: (token: string) =>
    request<{
      id: number; phone_number: string; full_name: string | null; email: string | null;
      date_of_birth: string | null; gender: string | null; nationality: string | null;
      emergency_contact_name: string | null; emergency_contact_phone: string | null;
      is_verified: boolean; created_at: string;
    }>("/api/auth/me", {}, token),

  updateMe: (
    token: string,
    payload: Partial<{
      full_name: string; email: string; date_of_birth: string; gender: string;
      nationality: string; emergency_contact_name: string; emergency_contact_phone: string;
    }>
  ) =>
    request<{
      id: number; phone_number: string; full_name: string | null; email: string | null;
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
};

// ---------------- Emergency / SOS ----------------
export const emergencyApi = {
  getHelpline: () => request<{ national_emergency_number: string; tourist_police_note: string }>("/api/emergency/helpline"),

  triggerSOS: (payload: { latitude: number; longitude: number; location_label?: string; note?: string }, token?: string | null) =>
    request<{ status: string; alert_id: number; contacts_notified: string[]; helpline: string }>(
      "/api/emergency/sos", { method: "POST", body: JSON.stringify(payload) }, token
    ),
};

// ---------------- Content catalogs (guest-accessible) ----------------
export interface AttractionDTO {
  id: number; name: string; region: string; category: string; rating: number;
  distance: string | null; safetyStatus: string | null; image: string | null;
  description: string | null; mapQuery: string | null;
}
export interface HotelDTO {
  id: number; name: string; category: string; rating: number;
  priceRange: string | null; distance: string | null; description: string | null;
}
export interface FoodSpotDTO {
  id: number; name: string; cuisine: string; mustTryDish: string | null;
  rating: number; distance: string | null; description: string | null;
}
export interface EmergencyServiceCategoryDTO {
  category: string; icon_key: string; color: string | null;
  list: { name: string; phone: string; distance: string | null; location: string | null }[];
}
export interface LocalScamDTO {
  id: number; title: string; location: string | null; severity: string;
  description: string | null; prevention: string | null;
}
export interface PhraseCategoryDTO {
  category: string;
  phrases: { hindi: string; translation: string; phonetic: string | null }[];
}
export interface SmartItineraryDTO {
  id: string; title: string; subtitle: string | null;
  timeSlots: { time: string; activity: string; note: string | null }[];
}
export interface MMRAreaDTO {
  id: string; name: string; region: string; safetyScore: number; safetyTag: string | null;
  vibe: string | null;
  highlyRecommended: { title: string; type: string | null; desc: string | null; highlight: string | null }[];
  foodHighlights: { spot: string; dish: string | null; type: string | null }[];
  transitAndSafetyTip: string | null;
}
export interface StationDTO {
  name: string; line: string | null; hub: boolean;
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
};

// ---------------- Trains & Fare ----------------
export interface RouteResponseDTO {
  origin: string; destination: string; line: string; interchange: string | null;
  legs: { line: string; from_station: string; to_station: string; num_stops: number }[];
  estimatedMins: number; fare: number;
}

export const trainApi = {
  getRoute: (origin: string, destination: string) =>
    request<RouteResponseDTO>(`/api/trains/route?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`),
};

export const fareApi = {
  estimate: (origin: string, destination: string, distance_km?: number) =>
    request<{ distance_km: number; local_train_fare: number; best_bus_fare: number; auto_fare: number; cab_fare: number }>(
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
