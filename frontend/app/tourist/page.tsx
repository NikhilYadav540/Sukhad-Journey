"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import with SSR completely disabled
const LiveSafetyMap = dynamic(() => import("@/components/LiveSafetyMap"), {
  ssr: false,
  loading: () => (
    <div className="h-56 w-full rounded-3xl border border-slate-200 bg-slate-100 animate-pulse flex items-center justify-center shadow-sm">
      <span className="text-xs font-bold text-slate-400">Loading Secure Map...</span>
    </div>
  ),
});
import GuestOverviewPage from "@/components/GuestOverviewPage";
import { SafetyHeader } from "@/components/SafetyHeader";
import { SOSButton } from "@/components/SOSButton";
import AreaAnalysis from "@/components/AreaAnalysis";
import { MUMBAI_GRAPH, calculateOfficialFare, RouteEdge } from "@/utils/trainNetwork";
import { MMRAreaGuide } from "@/components/MMRAreaGuide";
import {
  MapPin,
  Car,
  AlertTriangle,
  ArrowLeft,
  Compass,
  User,
  ExternalLink,
  ShieldCheck,
  QrCode,
  Menu,
  X,
  Camera,
  Train,
  Home,
  ShieldAlert,
  PhoneCall,
  Hospital,
  Siren,
  Languages,
  Calendar,
  Volume2,
  Pill,
  Hotel,
  Utensils,
  Sparkles,
  ChevronRight,
  Radio,
  Clock,
  ArrowRight,
  Phone,
  Lock,
  Mail,
  CheckCircle2,
  Newspaper,
  ShoppingBasket,
  Store,
  Route,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  authApi, passApi, emergencyApi, contentApi, trainApi, fareApi,
  getToken, setToken, clearToken, assetUrl,
  type AttractionDTO, type HotelDTO, type FoodSpotDTO, type EmergencyServiceCategoryDTO,
  type LocalScamDTO, type PhraseCategoryDTO, type SmartItineraryDTO, type StationDTO,
  type FareEstimateDTO, type NewsItemDTO, type CrimeReportDTO, type DangerZoneDTO, type AnalyzedPlaceDTO,
} from "@/lib/api";
import { loadGoogleIdentity } from "@/lib/googleSignIn";

// Maps backend icon_key strings to the actual lucide-react component (icons can't cross a JSON boundary)
const EMERGENCY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  hospital: Hospital,
  siren: Siren,
  pill: Pill,
  store: Store,
  grocery: ShoppingBasket,
};

async function resolveMapCoords(place: {
  latitude?: number | null;
  longitude?: number | null;
  mapQuery?: string | null;
  name: string;
}): Promise<{ lat: number; lng: number } | null> {
  if (place.latitude != null && place.longitude != null) {
    return { lat: place.latitude, lng: place.longitude };
  }
  const q = `${(place.mapQuery || place.name).replace(/\+/g, " ")} Mumbai`;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`
    );
    const data = await res.json();
    if (!data[0]) return null;
    return { lat: Number(data[0].lat), lng: Number(data[0].lon) };
  } catch {
    return null;
  }
}

async function readCurrentGps(): Promise<{ lat: number; lng: number } | null> {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) return null;
  if (typeof window !== "undefined" && !window.isSecureContext) return null;
  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 20000,
      });
    });
    if (pos.coords.accuracy > 8000) return null;
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    return null;
  }
}

function kmBetween(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(x));
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

// ================= LIVE DATA (fetched from the FastAPI backend on mount) =================

// ================= MOCK DATA & DATABASES =================

// Replace your old MUMBAI_STATIONS array with this dynamic mapper:
const MUMBAI_STATIONS = Object.keys(MUMBAI_GRAPH).map((stationName) => {
  // Automatically detects which line it belongs to based on graph edges
  const firstEdge = MUMBAI_GRAPH[stationName]?.[0];
  return {
    name: stationName,
    line: firstEdge ? firstEdge.line : "Suburban Network",
    hub: MUMBAI_GRAPH[stationName]?.length > 2,
  };
});

const EMERGENCY_SERVICES: EmergencyServiceCategoryDTO[] = [
  {
    category: "24/7 Hospitals",
    icon_key: "hospital",
    color: "emerald",
    list: [
      { name: "Bombay Hospital & Medical Research Centre", phone: "+912222067676", distance: "1.1 km", location: "Marine Lines" },
      { name: "INS Asvini Naval Hospital", phone: "+912222151661", distance: "2.4 km", location: "Colaba" },
      { name: "Lilavati Hospital & Research Centre", phone: "+912226751000", distance: "14.2 km", location: "Bandra West" },
    ],
  },
  {
    category: "Tourist Police Squads",
    icon_key: "siren",
    color: "sky",
    list: [
      { name: "Colaba Tourist Police Precinct", phone: "112", distance: "0.8 km", location: "Colaba Causeway" },
      { name: "Azad Maidan Police Station (CST Area)", phone: "+912222620330", distance: "2.1 km", location: "Fort" },
      { name: "Marine Drive Police Control", phone: "+912222812061", distance: "1.3 km", location: "Marine Drive" },
    ],
  },
  {
    category: "24/7 Pharmacies",
    icon_key: "pill",
    color: "teal",
    list: [
      { name: "Wellness Forever 24x7 Chemist", phone: "+912222851122", distance: "0.5 km", location: "Churchgate" },
      { name: "Apollo Pharmacy 24 Hours", phone: "+912222020202", distance: "1.2 km", location: "Fort" },
    ],
  },
];

const LOCAL_SCAMS = [
  {
    id: 1,
    title: "Tampered Auto/Taxi Meter Fraud",
    location: "Airports, CSMT & Gateway of India",
    severity: "High Risk",
    description: "Drivers may claim the meter is broken or request flat exorbitant fares for short distances.",
    prevention: "Insist on metered rate or use our built-in Cab & Auto Estimator to show standard tariff rates. Threaten to call 112 if refused.",
  },
  {
    id: 2,
    title: "Fake Unregistered Guides",
    location: "Gateway of India & Elephanta Caves",
    severity: "Moderate",
    description: "Touts wearing official-looking lanyards offer 'VIP entry' or private tours at 10x the price.",
    prevention: "Ask for an official Ministry of Tourism ID card before accepting any guide services.",
  },
  {
    id: 3,
    title: "Pigeon Feeding & Photo Traps",
    location: "Gateway Plaza & Marine Drive",
    severity: "Low Risk",
    description: "Vendors force bird seeds into your hand for photos and demand large cash fees afterward.",
    prevention: "Politely say 'No thank you' and walk away immediately without accepting feed bags.",
  },
];

const LOCAL_PHRASES = [
  {
    category: "Bargaining & Transport",
    phrases: [
      { hindi: "Bhaiyya meter se chalo", translation: "Brother, please go by meter rate", phonetic: "Bhai-ya me-ter say cha-lo" },
      { hindi: "Kitna hua?", translation: "How much does this cost?", phonetic: "Kit-na hoo-aa?" },
      { hindi: "Thoda kam karo na", translation: "Please lower the price a bit", phonetic: "Tho-da kam ka-ro na" },
    ],
  },
  {
    category: "Emergency & Assistance",
    phrases: [
      { hindi: "Madad chahiye!", translation: "I need help!", phonetic: "Ma-dad cha-hi-ye!" },
      { hindi: "Hospital kaha hai?", translation: "Where is the nearest hospital?", phonetic: "Hos-pi-tal ka-haa hai?" },
      { hindi: "Mujhe police station jana hai", translation: "I want to go to the police station", phonetic: "Moo-jhe po-lice sta-tion ja-na hai" },
    ],
  },
  {
    category: "Food & Water Safety",
    phrases: [
      { hindi: "Thanda paani / Bottled paani", translation: "Cold water / Sealed mineral water", phonetic: "Bot-tled paa-nee" },
      { hindi: "Kam teekha banana", translation: "Please make it less spicy", phonetic: "Kam tee-kha ba-naa-na" },
    ],
  },
];

const SMART_ITINERARIES = [
  {
    id: "1day-heritage",
    title: "1-Day Heritage & Seafront Trail",
    subtitle: "Covers iconic South Mumbai landmarks safely and efficiently",
    timeSlots: [
      { time: "09:00 AM", activity: "Gateway of India & Taj Mahal Palace", note: "Best light for photos, low crowd." },
      { time: "11:30 AM", activity: "CSMT Station & Fort Colonial Walking Tour", note: "Stick to patrolled heritage walkways." },
      { time: "02:00 PM", activity: "Lunch at Leopold Cafe or Britannia & Co.", note: "Heritage Parsi & Irani delicacies." },
      { time: "05:00 PM", activity: "Sunset stroll along Marine Drive Promenade", note: "Well-lit and heavily patrolled tourist precinct." },
    ],
  },
  {
    id: "3day-ultimate",
    title: "3-Day Ultimate Mumbai Explorer",
    subtitle: "Complete cultural, shopping, and food immersion",
    timeSlots: [
      { time: "Day 1", activity: "South Mumbai Heritage & Gateway of India Boat Cruise", note: "Full day in South District." },
      { time: "Day 2", activity: "Bandra Fort, Linking Road Shopping & Carter Road Promenade", note: "Trendy suburban experience." },
      { time: "Day 3", activity: "Sanjay Gandhi National Park & Kanheri Caves Trail", note: "Nature & ancient Buddhist rock carvings." },
    ],
  },
];

const NEARBY_ATTRACTIONS = [
  {
    id: 1,
    name: "Gateway of India",
    region: "South Mumbai",
    category: "Historical Monument",
    rating: 4.8,
    distance: "1.2 km",
    safetyStatus: "Safe Zone ✓",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Mumbai_03-2016_30_Gateway_of_India.jpg?width=1280",
    description: "Iconic 20th-century waterfront arch monument built overlooking the Arabian Sea.",
    mapQuery: "Gateway+of+India+Mumbai",
  },
  {
    id: 2,
    name: "Marine Drive Promenade",
    region: "South Mumbai",
    category: "Coastal Boulevard",
    rating: 4.9,
    distance: "0.5 km",
    safetyStatus: "Safe Zone ✓",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Mumbai_03-2016_27_skyline_at_Marine_Drive.jpg?width=1280",
    description: "3.6 km long arc-shaped boulevard along the coast, famous for Queen's Necklace night views.",
    mapQuery: "Marine+Drive+Mumbai",
  },
  {
    id: 3,
    name: "Sanjay Gandhi National Park",
    region: "Western Suburbs (Borivali)",
    category: "Nature & Wildlife",
    rating: 4.7,
    distance: "22.5 km",
    safetyStatus: "Patrolled Trail ✓",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Entrance_of_Sanjay_Gandhi_National_Park.JPG?width=1280",
    description: "Sprawling protected rainforest home to free-roaming leopards, flora, and scenic lakes.",
    mapQuery: "Sanjay+Gandhi+National+Park+Borivali",
  },
  {
    id: 4,
    name: "Kanheri Caves",
    region: "Western Suburbs (Borivali)",
    category: "Heritage Ancient Caves",
    rating: 4.8,
    distance: "25.0 km",
    safetyStatus: "Safe Zone ✓",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Kanheri_Caves_prayer_hall.JPG?width=1280",
    description: "109 ancient Buddhist rock-cut monuments inside Sanjay Gandhi National Park.",
    mapQuery: "Kanheri+Caves+Mumbai",
  },
  {
    id: 5,
    name: "Bandra Fort & Sea Link Promenade",
    region: "Western Suburbs (Bandra)",
    category: "Coastal Fort & Sea View",
    rating: 4.6,
    distance: "12.8 km",
    safetyStatus: "Safe Zone ✓",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Bandra-fort-mumbai.jpg?width=1280",
    description: "17th-century Portuguese fort offering stunning vistas of the iconic Rajiv Gandhi Sea Link.",
    mapQuery: "Bandra+Fort+Mumbai",
  },
  {
    id: 6,
    name: "Global Vipassana Pagoda",
    region: "Northern Suburbs (Gorai)",
    category: "Spiritual Monument",
    rating: 4.8,
    distance: "32.0 km",
    safetyStatus: "Safe Zone ✓",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/GlobalVipasanaPagoda.JPG?width=1280",
    description: "Massive golden dome meditation hall and peace monument built on the Gorai peninsula.",
    mapQuery: "Global+Vipassana+Pagoda+Gorai",
  },
  {
    id: 7,
    name: "Elephanta Caves Island",
    region: "MMR Harbor",
    category: "UNESCO World Heritage Site",
    rating: 4.7,
    distance: "11.0 km (Ferry Ride)",
    safetyStatus: "Patrolled Island ✓",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Elephanta_Caves_Trimurti.jpg?width=1280",
    description: "Rock-cut cave temples dedicated to Lord Shiva, accessible by boat from Gateway of India.",
    mapQuery: "Elephanta+Caves+Mumbai",
  },
  {
    id: 8,
    name: "Haji Ali Dargah",
    region: "South-Central Mumbai",
    category: "Coastal Shrine",
    rating: 4.7,
    distance: "7.2 km",
    safetyStatus: "Monitored Zone ✓",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Mumbai_03-2016_12_Haji_Ali_Dargah.jpg?width=1280",
    description: "Historic 15th-century mosque and tomb situated on an islet connected by a narrow causeway.",
    mapQuery: "Haji+Ali+Dargah+Mumbai",
  },
  {
    id: 9,
    name: "CSMT World Heritage Terminus",
    region: "South Mumbai",
    category: "Colonial Architecture",
    rating: 4.9,
    distance: "1.8 km",
    safetyStatus: "High Security Zone ✓",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Chhatrapati_shivaji_terminus,_esterno_01.jpg?width=1280",
    description: "Victorian Gothic Revival architectural masterpiece and bustling central transport hub.",
    mapQuery: "Chhatrapati+Shivaji+Maharaj+Terminus",
  },
  {
    id: 10,
    name: "Upvan Lake & Yeoor Hills",
    region: "Thane MMR Zone",
    category: "Scenic Nature Reserve",
    rating: 4.6,
    distance: "28.0 km",
    safetyStatus: "Safe Zone ✓",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Upvan_Lake_-_Night_View.JPG?width=1280",
    description: "Serene lakeside garden nestled against the lush forest hills of Sanjay Gandhi National Park in Thane.",
    mapQuery: "Upvan+Lake+Thane",
  },
  {
    id: 11,
    name: "Central Park & Jewel of Navi Mumbai",
    region: "Navi Mumbai Zone",
    category: "Urban Park & Botanical Garden",
    rating: 4.6,
    distance: "30.0 km",
    safetyStatus: "Safe Zone ✓",
    image: "https://ilovenavimumbai.com/wp-content/uploads/2025/12/Central-Park-Photos.webp",
    description: "Massive urban recreation park featuring landscaped lawns, amphitheaters, and walking trails.",
    mapQuery: "Central+Park+Kharghar+Navi+Mumbai",
  },
];
const NEARBY_HOTELS = [
  {
    id: 101,
    name: "The Taj Mahal Palace",
    category: "5-Star Luxury Heritage",
    rating: 4.9,
    priceRange: "₹22,000 / night",
    distance: "0.8 km",
    description: "World-famous heritage luxury hotel offering breathtaking views of the Gateway of India.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Taj_Mahal_Palace_Hotel_photo.jpg?width=1280",
    websiteUrl: "https://www.tajhotels.com/en-in/hotels/taj-mahal-palace-mumbai",
  },
  {
    id: 102,
    name: "Trident Hotel Nariman Point",
    category: "5-Star Business & Luxury",
    rating: 4.7,
    priceRange: "₹14,000 / night",
    distance: "0.4 km",
    description: "Located right on Marine Drive offering panoramic coastal ocean views.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Mumbai_03-2016_27_skyline_at_Marine_Drive.jpg?width=1280",
    websiteUrl: "https://www.tridenthotels.com/hotels-in-mumbai-nariman-point",
  },
];

const MUST_TRY_FOOD = [
  {
    id: 201,
    name: "Leopold Cafe & Bar",
    cuisine: "Irani & Continental Heritage Cafe",
    mustTryDish: "Keema Pav & Cold Coffee",
    rating: 4.6,
    distance: "1.4 km",
    description: "Legendary cafe operating since 1871. Featured in Shantaram; famous for its lively vintage ambience.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/LeopoldCafe_gobeirne.jpg?width=1280",
    websiteUrl: "https://en.wikipedia.org/wiki/Leopold_Cafe",
  },
  {
    id: 202,
    name: "Bademiya Kebabs",
    cuisine: "Mughlai Street Food",
    mustTryDish: "Chicken Baida Roti & Seekh Kebab",
    rating: 4.5,
    distance: "1.3 km",
    description: "World-renowned late-night street food destination behind the Taj Mahal Palace.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Taj_Mahal_Palace_Hotel_photo.jpg?width=1280",
    websiteUrl: "https://en.wikipedia.org/wiki/Bademiya",
  },
];

// ================= MAIN COMPONENT =================

function TouristDashboardContent() {
  const searchParams = useSearchParams();

  // Screen & Flow State Isolation
  const [showSplash, setShowSplash] = useState(true);
  const [showOverview, setShowOverview] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRegistrationIntro, setShowRegistrationIntro] = useState(false); // Post-registration / Intro screen
  const [hasPassPreview, setHasPassPreview] = useState(false);

  // Intro Screen Animation
  const [animateLogo, setAnimateLogo] = useState(false);

  // Multi-step Registration Form State
  const [authStep, setAuthStep] = useState<"credentials" | "profile">("credentials");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authIdentifier, setAuthIdentifier] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Profile Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [friendContacts, setFriendContacts] = useState([
    { name: "", phone: "", relation: "Friend" },
    { name: "", phone: "", relation: "Friend" },
    { name: "", phone: "", relation: "Friend" },
  ]);

  const [activeSection, setActiveSection] = useState<
    | "home"
    | "mmr-guide"
    | "profile"
    | "emergency"
    | "scams"
    | "phrasebook"
    | "itineraries"
    | "pathfinder"
    | "fare"
    | "attractions"
    | "hotels"
    | "food"
    | "alerts"
  >("home");

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>("All");

  // Profile Photo State
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  // ---- Backend-backed auth/session state ----
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [backendProfile, setBackendProfile] = useState<{
    full_name: string | null; email: string | null; phone_number: string | null;
    date_of_birth: string | null; gender: string | null;
    emergency_contact_name: string | null; emergency_contact_phone: string | null;
  } | null>(null);
  const [backendPass, setBackendPass] = useState<{
    did: string; validTill: string; idType: string; qrImageUrl: string | null;
  } | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // ---- Live content fetched from the backend (replaces old mock arrays) ----
  const [mumbaiStations, setMumbaiStations] = useState<StationDTO[]>(MUMBAI_STATIONS);
  const [emergencyServices, setEmergencyServices] = useState<EmergencyServiceCategoryDTO[]>(EMERGENCY_SERVICES);
  const [localScams, setLocalScams] = useState<LocalScamDTO[]>(LOCAL_SCAMS);
  const [localPhrases, setLocalPhrases] = useState<PhraseCategoryDTO[]>(LOCAL_PHRASES);
  const [smartItineraries, setSmartItineraries] = useState<SmartItineraryDTO[]>(SMART_ITINERARIES);
  const [nearbyAttractions, setNearbyAttractions] = useState<AttractionDTO[]>(NEARBY_ATTRACTIONS);
  const [nearbyHotels, setNearbyHotels] = useState<HotelDTO[]>(NEARBY_HOTELS);
  const [mustTryFood, setMustTryFood] = useState<FoodSpotDTO[]>(MUST_TRY_FOOD);
  const [cityNews, setCityNews] = useState<NewsItemDTO[]>([]);
  const [crimeReports, setCrimeReports] = useState<CrimeReportDTO[]>([]);
  const [dangerZones, setDangerZones] = useState<DangerZoneDTO[]>([]);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [fareQuote, setFareQuote] = useState<FareEstimateDTO | null>(null);

  // Restore session + fetch all guest-accessible content on first mount
  useEffect(() => {
    const existingToken = getToken();
    if (existingToken) {
      setAuthToken(existingToken);
      authApi.getMe(existingToken).then((me) => {
        setBackendProfile(me);
        setHasPassPreview(true);
        return passApi.getMine(existingToken).catch(() => null);
      }).then((pass) => {
        if (pass) setBackendPass(pass);
      }).catch(() => {
        clearToken();
        setAuthToken(null);
      });
    }

    Promise.all([
      contentApi.stations(),
      contentApi.emergencyServices(),
      contentApi.scams(),
      contentApi.phrasebook(),
      contentApi.smartItineraries(),
      contentApi.attractions(),
      contentApi.hotels(),
      contentApi.food(),
      contentApi.news(),
      contentApi.crimeReports(),
      contentApi.dangerZones(),
    ]).then(([stations, services, scams, phrases, itins, attractions, hotels, food, news, crime, zones]) => {
      if (stations.length) setMumbaiStations(stations);
      if (services.length) setEmergencyServices(services);
      if (scams.length) setLocalScams(scams);
      if (phrases.length) setLocalPhrases(phrases);
      if (itins.length) setSmartItineraries(itins);
      if (attractions.length) setNearbyAttractions(attractions);
      if (hotels.length) setNearbyHotels(hotels);
      if (food.length) setMustTryFood(food);
      if (news.length) setCityNews(news);
      if (crime.length) setCrimeReports(crime);
      if (zones.length) setDangerZones(zones);
      setContentLoaded(true);
    }).catch((err) => {
      console.error("Failed to load content from backend:", err);
      setContentLoaded(true); // keep local catalogs if the API is unreachable
    });
  }, []);

  // Re-fetch attractions when the region filter changes (backend does the filtering)
  useEffect(() => {
    if (!contentLoaded) return;
    contentApi.attractions(selectedRegionFilter).then((data) => {
      if (data.length) setNearbyAttractions(data);
      else if (selectedRegionFilter === "All") setNearbyAttractions(NEARBY_ATTRACTIONS);
      else setNearbyAttractions([]);
    }).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegionFilter]);

  // Dynamic User Profile — real data once logged in, guest placeholder otherwise
  const touristUser = {
    fullName: backendProfile?.full_name || "Guest Traveler",
    email: backendProfile?.email || "Not provided",
    phone: backendProfile?.phone_number || "Unverified (Guest Mode)",
    dob: backendProfile?.date_of_birth || "Not specified",
    gender: backendProfile?.gender || "Not specified",
    emergencyContact: backendProfile?.emergency_contact_name
      ? `${backendProfile.emergency_contact_phone} (${backendProfile.emergency_contact_name})`
      : "Not specified",
    idType: backendPass?.idType || (hasPassPreview ? "Verified Local Tourist Pass" : "Temporary Guest Session"),
    idHash: backendPass?.did || "DID:GUEST-TEMPORARY",
    validTill: backendPass
      ? new Date(backendPass.validTill).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : "18 Aug 2026",
  };

  // Safety & SOS State
  const [isDanger, setIsDanger] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [currentZoneName, setCurrentZoneName] = useState("Locating...");
  const [pinCoords, setPinCoords] = useState({ lat: 19.21407, lng: 72.8648 });
  const [requestedPin, setRequestedPin] = useState<{ lat: number; lng: number; place: string } | null>(null);
  const [pickingArea, setPickingArea] = useState(false);
  const [pickedArea, setPickedArea] = useState<{ name: string; lat: number; lng: number; token: number } | null>(null);
  const [inAppRoute, setInAppRoute] = useState<{
    fromLat: number;
    fromLng: number;
    toLat: number;
    toLng: number;
    toName: string;
  } | null>(null);
  const [userGps, setUserGps] = useState<{ lat: number; lng: number } | null>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);

  const startRouteTo = async (dest: { lat: number; lng: number; name: string }) => {
    setActiveSection("home");
    const pin = pinCoords;
    let from = pin;
    const gps = userGps ?? (await readCurrentGps());
    if (gps) {
      setUserGps(gps);
      // Only start the route from GPS when it is actually near the dropped pin
      // or the destination — otherwise ISP/wrong GPS draws a Vasai–Virar line.
      if (kmBetween(gps, pin) <= 4 || kmBetween(gps, dest) <= 4) {
        from = gps;
      }
    }
    setInAppRoute({
      fromLat: from.lat,
      fromLng: from.lng,
      toLat: dest.lat,
      toLng: dest.lng,
      toName: dest.name,
    });
    setTimeout(() => {
      mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  };

  // Fare Estimator State
  const [cabDistance, setCabDistance] = useState(5);

  // Path Finder State
  const [origin, setOrigin] = useState("Churchgate");
  const [destination, setDestination] = useState("Andheri");
  const [searchedRoute, setSearchedRoute] = useState<{
    line: string;
    interchange: string | null;
    estimatedMins: number;
    fare: number;
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fareApi
        .estimate(origin, destination, cabDistance)
        .then(setFareQuote)
        .catch((err) => {
          console.error("Fare estimate failed:", err);
          setFareQuote(null);
        });
    }, 200);
    return () => clearTimeout(timer);
  }, [cabDistance, origin, destination]);

  // 1. DEDICATED AUTH ROUTE INTERCEPTOR
  useEffect(() => {
    if (searchParams.get("auth") === "true") {
      setShowSplash(false);
      setShowOverview(false);
      setShowAuthModal(true);
    }
  }, [searchParams]);

  // 2. SPLASH ANIMATION CONTROLLER
  useEffect(() => {
    if (!showSplash) return;
    const timer = setTimeout(() => setAnimateLogo(true), 100);
    return () => clearTimeout(timer);
  }, [showSplash]);

  // Handlers for authentication and session management


  const speakPhrase = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "hi-IN";
      window.speechSynthesis.speak(utterance);
    } else {
      alert(`Audio Playback: "${text}"`);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const nextPhoto = URL.createObjectURL(file);
      setUserPhoto((previousPhoto) => {
        if (previousPhoto) URL.revokeObjectURL(previousPhoto);
        return nextPhoto;
      });
    }
  };

  const handleSOS = () => {
    setSosSent(true);
    // Best-effort: capture location and log a real alert the police dashboard can see,
    // then still fall through to the direct emergency call (most reliable path).
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          emergencyApi
            .triggerSOS(
              {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                location_label: currentZoneName !== "Locating..." ? currentZoneName : undefined,
              },
              authToken
            )
            .catch((err) => console.error("SOS alert dispatch failed:", err));
        },
        (err) => console.error("Geolocation unavailable for SOS:", err),
        { timeout: 5000 }
      );
    }
    window.location.href = "tel:112";
  };

  const handleCalculateRoute = () => {
    if (origin === destination) {
      setSearchedRoute({
        line: "Already at destination",
        interchange: null,
        estimatedMins: 0,
        fare: 0,
      });
      return;
    }

    const applyLocalRoute = () => {
      if (!MUMBAI_GRAPH[origin] || !MUMBAI_GRAPH[destination]) {
        setSearchedRoute({
          line: "Route data pending for these stations",
          interchange: null,
          estimatedMins: 0,
          fare: 0,
        });
        return;
      }

      const distances: Record<string, number> = {};
      const previous: Record<string, { node: string; edge: RouteEdge } | null> = {};
      const unvisited = new Set(Object.keys(MUMBAI_GRAPH));

      Object.keys(MUMBAI_GRAPH).forEach((station) => {
        distances[station] = Infinity;
        previous[station] = null;
      });
      distances[origin] = 0;

      while (unvisited.size > 0) {
        let current = Array.from(unvisited).reduce((minNode, node) =>
          distances[node] < distances[minNode] ? node : minNode
        );

        if (distances[current] === Infinity) break;
        if (current === destination) break;

        unvisited.delete(current);

        MUMBAI_GRAPH[current].forEach((edge) => {
          if (unvisited.has(edge.node)) {
            const newTime = distances[current] + edge.time;
            if (newTime < distances[edge.node]) {
              distances[edge.node] = newTime;
              previous[edge.node] = { node: current, edge: edge };
            }
          }
        });
      }

      const path: string[] = [];
      let currentTrace = destination;
      let totalDistKm = 0;
      let linesUsed = new Set<string>();
      let interchanges: string[] = [];

      while (currentTrace && previous[currentTrace]) {
        const prevData = previous[currentTrace]!;
        path.unshift(currentTrace);
        totalDistKm += prevData.edge.dist;
        linesUsed.add(prevData.edge.line);

        if (previous[prevData.node] && previous[prevData.node]!.edge.line !== prevData.edge.line) {
          interchanges.push(prevData.node);
        }

        currentTrace = prevData.node;
      }
      path.unshift(origin);

      const exactFare = calculateOfficialFare(totalDistKm);
      const lineString = Array.from(linesUsed).join(" ➔ ");
      const interchangeString = interchanges.length > 0
        ? `Change trains at ${interchanges.reverse().join(", ")}`
        : null;

      setSearchedRoute({
        line: lineString,
        interchange: interchangeString,
        estimatedMins: distances[destination],
        fare: exactFare,
      });
    };

    trainApi
      .getRoute(origin, destination)
      .then((route) => {
        setSearchedRoute({
          line: route.line,
          interchange: route.interchange,
          estimatedMins: route.estimatedMins,
          fare: route.fare,
        });
      })
      .catch((err) => {
        console.error("Route lookup failed:", err);
        applyLocalRoute();
      });
  };

  const navigateTo = (section: typeof activeSection) => {
    setActiveSection(section);
    setIsMenuOpen(false);
  };

  // Registration & Login Auth Handlers (Mobile / Email + Password)
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!authIdentifier.trim() || !authPassword) {
      setAuthError("Please fill in all required fields.");
      return;
    }

    setAuthLoading(true);

    if (authMode === "login") {
      authApi
        .login({
          identifier: authIdentifier.trim(),
          password: authPassword,
        })
        .then(({ access_token, is_new_user }) => finishAuthSession(access_token, is_new_user))
        .catch((err) => setAuthError(err.message || "Invalid mobile/email or password."))
        .finally(() => setAuthLoading(false));
    } else {
      const isEmail = authIdentifier.includes("@");
      authApi
        .signup({
          email: isEmail ? authIdentifier.trim().toLowerCase() : undefined,
          phone_number: !isEmail ? authIdentifier.trim() : undefined,
          password: authPassword,
          full_name: fullName.trim() || undefined,
        })
        .then(({ access_token, is_new_user }) => finishAuthSession(access_token, is_new_user))
        .catch((err) => setAuthError(err.message || "Could not complete signup. Please try again."))
        .finally(() => setAuthLoading(false));
    }
  };

  const handleDemoLogin = () => {
    setAuthError(null);
    setAuthLoading(true);
    authApi
      .login({ identifier: "tourist1", password: "pass1234" })
      .then(({ access_token, is_new_user }) => finishAuthSession(access_token, is_new_user))
      .catch((err) => setAuthError(err.message || "Demo login failed."))
      .finally(() => setAuthLoading(false));
  };

  const finishAuthSession = (accessToken: string, isNewUser: boolean) => {
    setToken(accessToken);
    setAuthToken(accessToken);
    return authApi.getMe(accessToken).then((me) => {
      setBackendProfile(me);
      setFullName(me.full_name || "");
      setEmail(me.email || "");
      if (!isNewUser && me.full_name) {
        return passApi
          .getMine(accessToken)
          .catch(() => passApi.issue(accessToken, 14))
          .then((pass) => {
            setBackendPass(pass);
            setHasPassPreview(true);
            setShowAuthModal(false);
            setAuthStep("credentials");
            setShowRegistrationIntro(true);
          });
      }
      setAuthStep("profile");
    });
  };


  const handleGoogleAuth = async () => {
    setAuthError(null);
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
    if (!clientId) {
      setAuthError("Paste your Google Client ID into frontend/.env.local as NEXT_PUBLIC_GOOGLE_CLIENT_ID, then restart npm run dev.");
      return;
    }
    setAuthLoading(true);
    try {
      await loadGoogleIdentity();
      const client = window.google?.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid email profile",
        callback: (response) => {
          if (response.error || !response.access_token) {
            setAuthLoading(false);
            setAuthError(response.error === "popup_closed_by_user" ? "Google sign-in was cancelled." : "Google sign-in failed.");
            return;
          }
          authApi
            .googleLogin({ access_token: response.access_token })
            .then(({ access_token, is_new_user }) => finishAuthSession(access_token, is_new_user))
            .catch((err) => setAuthError(err.message || "Google login failed."))
            .finally(() => setAuthLoading(false));
        },
      });
      if (!client) {
        throw new Error("Google Sign-In did not initialize.");
      }
      client.requestAccessToken();
    } catch (err) {
      setAuthLoading(false);
      setAuthError(err instanceof Error ? err.message : "Could not start Google sign-in.");
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!fullName || !email || !authToken) return;
    const filledFriends = friendContacts.filter(
      (c) => c.name.trim() && c.phone.replace(/\s+/g, "").length >= 10
    );
    if (filledFriends.length < 2) {
      setAuthError("Add at least 2 friend contact numbers for emergencies.");
      return;
    }

    setAuthLoading(true);
    authApi
      .updateMe(authToken, {
        full_name: fullName,
        email,
        date_of_birth: dob || undefined,
        gender: gender || undefined,
        friend_contacts: filledFriends.map((c) => ({
          name: c.name.trim(),
          phone_number: c.phone.replace(/\s+/g, ""),
          relation: c.relation || "Friend",
        })),
      })
      .then((me) => {
        setBackendProfile(me);
        return passApi.issue(authToken, 14);
      })
      .then((pass) => {
        setBackendPass(pass);
        setHasPassPreview(true);
        setShowAuthModal(false);
        setAuthStep("credentials");
        setShowRegistrationIntro(true);
      })
      .catch((err) => setAuthError(err.message || "Couldn't complete registration."))
      .finally(() => setAuthLoading(false));
  };

  const handleSocialAuth = (provider: string) => {
    if (provider === "Google") {
      void handleGoogleAuth();
      return;
    }
    setAuthError("Apple Sign-In is not set up yet. Use Google or mobile OTP.");
  };

  // Filtered attractions
  const filteredAttractions =
    selectedRegionFilter === "All"
      ? nearbyAttractions
      : nearbyAttractions.filter((item) => item.region.includes(selectedRegionFilter));

  // ================= 1. INTRO / SPLASH SCREEN (INITIAL LAUNCH) =================
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-50">
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-sky-50 to-slate-50 max-w-md mx-auto flex flex-col items-center justify-between p-8 text-center border-x border-slate-200 transition-all duration-700 relative overflow-hidden">
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 pt-6">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-3.5 py-1 rounded-full shadow-xs">
              Welcome to Safe Travel
            </span>
          </div>

          <div className="relative z-10 flex flex-col items-center my-auto space-y-6">
            <div className={`relative transition-all duration-1000 transform ${animateLogo ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 translate-y-4"}`}>
              <div className="w-48 h-48 rounded-full bg-white p-3 shadow-2xl border-4 border-emerald-500/20 flex items-center justify-center relative group">
                <div className="absolute inset-0 rounded-full bg-emerald-400/10 animate-ping opacity-25" />
                <img
                  src="/Sukhad-Journeylogo.png"
                  alt="Sukhad-Journey Logo"
                  className="w-full h-full object-contain rounded-full shadow-inner"
                />
              </div>
            </div>

            <div className={`space-y-1 transition-all duration-1000 delay-300 transform ${animateLogo ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <h1 className="text-3xl font-black text-[#0f2942] tracking-tight drop-shadow-xs">
                SUKHAD-JOURNEY
              </h1>
              <div className="w-16 h-1 bg-gradient-to-r from-emerald-600 to-sky-600 rounded-full mx-auto" />
            </div>

            <div className={`space-y-2 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-emerald-200/80 shadow-sm max-w-xs transition-all duration-1000 delay-500 transform ${animateLogo ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <p className="text-2xl font-bold text-emerald-900 tracking-wide font-serif">अतिथि देवो भव</p>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest font-mono">
                "The Guest is God"
              </p>
            </div>
          </div>

          <div className="relative z-10 w-full pb-6">
            <button
              onClick={() => {
                setShowSplash(false);
                setShowOverview(true);
              }}
              className="w-full py-4 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 hover:from-emerald-800 hover:to-teal-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-98 group"
            >
              <span>Explore Safe Journey</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= 2. GUEST ONBOARDING OVERVIEW =================
  if (showOverview) {
    return (
      <GuestOverviewPage
        onContinueAsGuest={() => {
          setShowOverview(false);
          setHasPassPreview(false);
          // Always direct through the Intro Screen for guest users too
          setShowRegistrationIntro(true);
        }}
        onOpenAuth={() => {
          setShowOverview(false);
          setAuthStep("credentials");
          setShowAuthModal(true);
        }}
      />
    );
  }

  // ================= 3. MAIN DASHBOARD WITH AUTH MODAL & INTRO OVERLAY =================
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-800 pb-[calc(8rem+env(safe-area-inset-bottom))] max-w-md mx-auto relative border-x border-slate-200/90 shadow-xl font-sans selection:bg-emerald-200 selection:text-emerald-950 overflow-x-hidden">
      
      {/* POST-REGISTRATION & GUEST INTRO SCREEN OVERLAY */}
      {showRegistrationIntro && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm text-center space-y-5 animate-in fade-in zoom-in duration-300">
            
            {/* REPLACED ICON WITH OUR LOGO */}
            <div className="w-16 h-16 rounded-full bg-white p-1.5 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-md">
              <img
                src="/Sukhad-Journeylogo.png"
                alt="Sukhad-Journey Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
                {hasPassPreview ? "Registration Successful" : "Guest Session Active"}
              </span>
              <h2 className="text-xl font-black text-slate-900 pt-2">
                Welcome, {hasPassPreview ? (fullName || "Traveler") : "Guest Traveler"}! 🎉
              </h2>
              <p className="text-xs text-slate-500">
                {hasPassPreview
                  ? "Your Digital Tourist Safety Pass is active and synced with local safety services."
                  : "You are exploring in Guest Mode with full access to regional guides & safety tools."}
              </p>
            </div>

            {/* Quick Intro Highlights */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Key Features for Your Trip:
              </p>

              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">
                    {hasPassPreview ? "Verified Tourist Pass" : "Guest Pass Access"}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {hasPassPreview ? "Digital DID pass for easy check-ins and safety desks." : "Temporary session active for instant safety access."}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-sky-100 text-sky-700 rounded-lg shrink-0 mt-0.5">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">MMR Regional Area Guides</span>
                  <span className="text-[11px] text-slate-500">Explore safety zones and transit guides across suburbs.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg shrink-0 mt-0.5">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">Instant Emergency SOS</span>
                  <span className="text-[11px] text-slate-500">One-tap 112 police emergency dialer & contacts.</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowRegistrationIntro(false)}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>Go to Main Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* AUTHENTICATION & REGISTRATION MODAL OVERLAY */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowAuthModal(false);
                setAuthStep("credentials");
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Step Progress Header */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>{authStep === "profile" ? "Step 2 of 2: Profile Info" : "Step 1 of 2: Authentication"}</span>
                <span className="text-emerald-700 font-mono">
                  {authStep === "credentials" ? "50%" : "100%"}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300"
                  style={{ width: authStep === "credentials" ? "50%" : "100%" }}
                />
              </div>
            </div>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                {authStep === "profile" ? <User className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
              </div>
              <h2 className="text-lg font-black text-slate-900">
                {authStep === "profile"
                  ? "Complete Tourist Profile"
                  : authMode === "login"
                  ? "Tourist Login"
                  : "Create Tourist Account"}
              </h2>
              <p className="text-xs text-slate-500">
                {authStep === "profile"
                  ? "Add your details and emergency contacts for your digital pass."
                  : authMode === "login"
                  ? "Sign in with your mobile number or email and password."
                  : "Register with your mobile or email to get your safety pass."}
              </p>
              {authError && (
                <p className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                  {authError}
                </p>
              )}
            </div>

            {/* STEP 1: LOGIN / SIGNUP CREDENTIALS */}
            {authStep === "credentials" && (
              <div className="space-y-4">
                {/* Tab Switcher: Login vs Signup */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setAuthError(null);
                    }}
                    className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${
                      authMode === "login"
                        ? "bg-white text-emerald-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signup");
                      setAuthError(null);
                    }}
                    className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${
                      authMode === "signup"
                        ? "bg-white text-emerald-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                  {authMode === "signup" && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                        <input
                          type="text"
                          placeholder="e.g. Aarav Sharma"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                          required={authMode === "signup"}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Mobile Number or Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        placeholder="e.g. tourist1@example.com or 9876543210"
                        value={authIdentifier}
                        onChange={(e) => setAuthIdentifier(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white font-extrabold py-3 rounded-xl text-xs transition-all shadow-md shadow-emerald-200 flex items-center justify-center gap-1.5 mt-2"
                  >
                    {authLoading ? (
                      "Please wait…"
                    ) : authMode === "login" ? (
                      <>
                        <span>Log In</span> <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Sign Up & Continue</span> <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Or Quick Demo
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button
                  type="button"
                  disabled={authLoading}
                  onClick={handleDemoLogin}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-60 text-white rounded-xl py-2.5 text-xs font-extrabold transition-all shadow-md shadow-violet-200"
                >
                  <User className="w-4 h-4" />
                  {authLoading ? "Signing in…" : "Quick Demo Login (tourist1 / pass1234)"}
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    disabled={authLoading}
                    onClick={() => handleSocialAuth("Google")}
                    className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl py-2 text-xs font-bold text-slate-700 transition-all disabled:opacity-60"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Google
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialAuth("Apple")}
                    className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2 text-xs font-bold transition-all"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.28c.67-.81 1.12-1.94.99-3.07-.96.04-2.13.64-2.82 1.44-.61.71-1.15 1.87-1.01 2.98 1.08.08 2.17-.54 2.84-1.35z" />
                    </svg>
                    Apple
                  </button>
                </div>
              </div>
            )}


            {/* STEP 2: PROFILE DETAILS */}
            {authStep === "profile" && (
              <form onSubmit={handleProfileSubmit} className="space-y-3.5">
                <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-300 flex items-center justify-center relative overflow-hidden shrink-0">
                    {userPhoto ? (
                      <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-800 block">Profile Picture (Optional)</span>
                    <label className="text-[10px] text-emerald-700 font-extrabold cursor-pointer hover:underline flex items-center gap-1 mt-0.5">
                      <Camera className="w-3 h-3" /> Upload Photo
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Verification Link Sent
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">Select</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-Binary">Non-Binary</option>
                      <option value="Other">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    Friend contacts for SOS <span className="text-rose-500">*</span>
                  </p>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Add 2 required numbers and 1 optional. These friends are notified if you hold SOS.
                  </p>
                  {friendContacts.map((friend, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder={idx < 2 ? `Friend ${idx + 1} name *` : "Friend 3 name (optional)"}
                        value={friend.name}
                        onChange={(e) => {
                          const next = [...friendContacts];
                          next[idx] = { ...next[idx], name: e.target.value };
                          setFriendContacts(next);
                        }}
                        required={idx < 2}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="tel"
                        placeholder={idx < 2 ? "10-digit number *" : "10-digit number"}
                        value={friend.phone}
                        onChange={(e) => {
                          const next = [...friendContacts];
                          next[idx] = { ...next[idx], phone: e.target.value };
                          setFriendContacts(next);
                        }}
                        required={idx < 2}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white font-extrabold py-3 rounded-xl text-xs transition-all shadow-md shadow-emerald-200 mt-2"
                >
                  {authLoading ? "Saving…" : "Generate Tourist Pass"}
                </button>
              </form>
            )}

            <p className="text-[10px] text-center text-slate-400">
              Your information is end-to-end encrypted for tourist emergency verification.
            </p>
          </div>
        </div>
      )}

      {/* Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-64 bg-gradient-to-b from-emerald-100/60 via-sky-100/40 to-transparent pointer-events-none blur-2xl z-0" />

      {/* HEADER */}
      <header className="p-3 sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between z-30 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowOverview(true)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200/80 transition-all flex items-center justify-center"
            title="Return to Safe Travel Overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full border border-emerald-500/30 overflow-hidden bg-white shrink-0 shadow-xs p-0.5">
              <img
                src="/Sukhad-Journeylogo.png"
                alt="Sukhad-Journey Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-emerald-900">
                SUKHAD-JOURNEY
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
          aria-label="Toggle Navigation Drawer"
        >
          {isMenuOpen ? <X className="w-5 h-5 text-rose-600" /> : <Menu className="w-5 h-5 text-emerald-700" />}
        </button>
      </header>

      {/* Navigation Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="w-5/6 max-w-xs bg-white border-l border-slate-200 h-full p-5 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-200">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border-2 border-emerald-400 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                  {userPhoto ? (
                    <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-emerald-600" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-bold text-sm text-slate-900">{touristUser.fullName}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold block w-fit border ${
                    hasPassPreview
                      ? "bg-sky-100 text-sky-800 border-sky-300"
                      : "bg-amber-100 text-amber-800 border-amber-300"
                  }`}>
                    {hasPassPreview ? "Verified Pass" : "Guest Mode"}
                  </span>
                </div>
              </div>

              <nav className="space-y-5">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Regional Intelligence</p>
                  <button
                    onClick={() => navigateTo("mmr-guide")}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-xs transition-all shadow-sm ${
                      activeSection === "mmr-guide"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-200"
                        : "bg-slate-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-50"
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="text-left">
                      <span>MMR Regional Area Guides</span>
                      <p className="text-[9px] text-slate-500 font-normal">Andheri, Kandivali, Ghatkopar & more</p>
                    </div>
                  </button>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Safety Utilities</p>
                  <div className="space-y-1">
                    <button
                      onClick={() => navigateTo("home")}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                        activeSection === "home" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Home className="w-4 h-4 text-emerald-600" /> Live Safety Map & SOS
                    </button>

                    <button
                      onClick={() => navigateTo("emergency")}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                        activeSection === "emergency" ? "bg-rose-50 text-rose-800 border border-rose-200" : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Hospital className="w-4 h-4 text-rose-600" /> 24/7 Emergency Services
                    </button>

                    <button
                      onClick={() => navigateTo("scams")}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                        activeSection === "scams" ? "bg-amber-50 text-amber-900 border border-amber-200" : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-600" /> Scam & Trap Radar
                    </button>

                    <button
                      onClick={() => navigateTo("alerts")}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                        activeSection === "alerts" ? "bg-rose-50 text-rose-900 border border-rose-200" : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Newspaper className="w-4 h-4 text-rose-600" /> News, Crime & Zones
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Smart Assistant</p>
                  <div className="space-y-1">
                    <button
                      onClick={() => navigateTo("phrasebook")}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                        activeSection === "phrasebook" ? "bg-purple-50 text-purple-900 border border-purple-200" : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Languages className="w-4 h-4 text-purple-600" /> Bambaiya Hindi Phrasebook
                    </button>

                    <button
                      onClick={() => navigateTo("itineraries")}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                        activeSection === "itineraries" ? "bg-indigo-50 text-indigo-900 border border-indigo-200" : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-indigo-600" /> Smart Itineraries
                    </button>

                    <button
                      onClick={() => navigateTo("profile")}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                        activeSection === "profile" ? "bg-sky-50 text-sky-900 border border-sky-200" : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <User className="w-4 h-4 text-sky-600" /> Identity Pass & Verification
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Transit & Discovery</p>
                  <div className="space-y-1">
                    <button
                      onClick={() => navigateTo("pathfinder")}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                        activeSection === "pathfinder" ? "bg-amber-50 text-amber-900 border border-amber-200" : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Train className="w-4 h-4 text-amber-600" /> Suburban Train Route Finder
                    </button>

                    <button
                      onClick={() => navigateTo("fare")}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                        activeSection === "fare" ? "bg-yellow-50 text-yellow-900 border border-yellow-200" : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Car className="w-4 h-4 text-yellow-600" /> Fare Estimator
                    </button>

                    <button
                      onClick={() => navigateTo("attractions")}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                        activeSection === "attractions" ? "bg-purple-50 text-purple-900 border border-purple-200" : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Compass className="w-4 h-4 text-purple-600" /> Top Sights
                    </button>

                    <button
                      onClick={() => navigateTo("hotels")}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                        activeSection === "hotels" ? "bg-pink-50 text-pink-900 border border-pink-200" : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Hotel className="w-4 h-4 text-pink-600" /> Verified Stays
                    </button>

                    <button
                      onClick={() => navigateTo("food")}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                        activeSection === "food" ? "bg-orange-50 text-orange-900 border border-orange-200" : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Utensils className="w-4 h-4 text-orange-600" /> Iconic Eateries
                    </button>
                  </div>
                </div>
              </nav>
            </div>

            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-all mt-6"
            >
              Dismiss Menu
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-4 relative z-10 space-y-4">

        {/* GUEST BANNER */}
        {!hasPassPreview && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs font-extrabold text-amber-900">Browsing in Guest Mode</p>
              <p className="text-[10px] text-amber-700">Register for emergency police sync & verified pass.</p>
            </div>
            <button
              onClick={() => {
                setAuthStep("credentials");
                setShowAuthModal(true);
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl shadow-xs shrink-0"
            >
              Register Pass
            </button>
          </div>
        )}

        {/* ================= HOMEPAGE ================= */}
        {activeSection === "home" && (
          <div className="space-y-4">
            <SafetyHeader
              score={isDanger ? 35 : 92}
              zoneName={isDanger ? "High-Density Alert Precinct" : currentZoneName}
              isDangerZone={isDanger}
            />
            

            <button
              type="button"
              onClick={() => setActiveSection("mmr-guide")}
              className="relative w-full overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 text-white p-4 rounded-3xl cursor-pointer hover:shadow-lg transition-all shadow-md group text-left"
            >
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shrink-0">
                    <Sparkles className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-white">MMR Regional Area Guides</h3>
                      <span className="bg-white text-emerald-900 font-black text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                        NEW
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-50 mt-0.5">Safety & transit intel for Suburbs & Extension Hubs</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform shrink-0" />
              </div>
            </button>

            <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span className="text-xs text-slate-600 font-semibold">GPS Geo-Fence Simulator:</span>
              </div>
              <button
                onClick={() => setIsDanger(!isDanger)}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all shadow-sm active:scale-95 ${
                  isDanger ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"
                }`}
              >
                {isDanger ? "Switch to Safe Zone" : "Simulate Red Zone"}
              </button>
            </div>
            <div ref={mapSectionRef} className="scroll-mt-24">
            <LiveSafetyMap
              isDanger={isDanger}
              onLocationUpdate={(name) => setCurrentZoneName(name)}
              onCoordsChange={(lat, lng) => setPinCoords({ lat, lng })}
              requestedPin={requestedPin}
              pickingArea={pickingArea}
              route={inAppRoute}
              onClearRoute={() => setInAppRoute(null)}
              onUserGps={(lat, lng) => setUserGps({ lat, lng })}
              onPickForAnalysis={(lat, lng) => {
                setPinCoords({ lat, lng });
                setPickingArea(false);
                setPickedArea({
                  name: currentZoneName || "Dropped pin",
                  lat,
                  lng,
                  token: Date.now(),
                });
              }}
            />
            </div>

            <AreaAnalysis
              picking={pickingArea}
              pickedArea={pickedArea}
              onStartPick={() => {
                setPickingArea(true);
                mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              onCancelPick={() => setPickingArea(false)}
              onSelectArea={(area) => {
                setPinCoords({ lat: area.lat, lng: area.lng });
                setCurrentZoneName(area.name);
                setRequestedPin({ lat: area.lat, lng: area.lng, place: area.name });
              }}
              onNavigate={(place: AnalyzedPlaceDTO) => {
                if (place.latitude == null || place.longitude == null) return;
                void startRouteTo({ lat: place.latitude, lng: place.longitude, name: place.name });
              }}
              afterButton={
                <>
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col items-center text-center shadow-sm">
                    {sosSent ? (
                      <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-rose-900 w-full animate-pulse space-y-2">
                        <p className="font-extrabold text-sm uppercase tracking-wider">Emergency call dialer opened</p>
                        <p className="text-xs text-rose-800">This prototype cannot contact police, share your location, or confirm that help was dispatched. Call 112 to request help.</p>
                        <button onClick={() => setSosSent(false)} className="mt-2 text-xs underline text-slate-500 block mx-auto">
                          Dismiss Emergency Alert
                        </button>
                      </div>
                    ) : (
                      <SOSButton onTriggerSOS={handleSOS} />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href="tel:112"
                      className="bg-rose-50/80 border border-rose-200 hover:border-rose-300 p-3.5 rounded-2xl flex items-center gap-3 text-rose-900 transition-all hover:bg-rose-100/80 shadow-xs"
                    >
                      <div className="p-2 bg-rose-600 text-white rounded-xl shadow-sm">
                        <PhoneCall className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider block">Police SOS</span>
                        <span className="font-extrabold text-sm text-slate-900">Dial 112</span>
                      </div>
                    </a>

                    <a
                      href="tel:1363"
                      className="bg-sky-50/80 border border-sky-200 hover:border-sky-300 p-3.5 rounded-2xl flex items-center gap-3 text-sky-900 transition-all hover:bg-sky-100/80 shadow-xs"
                    >
                      <div className="p-2 bg-sky-600 text-white rounded-xl shadow-sm">
                        <PhoneCall className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] text-sky-700 font-bold uppercase tracking-wider block">Tourist Helpline</span>
                        <span className="font-extrabold text-sm text-slate-900">Dial 1363</span>
                      </div>
                    </a>
                  </div>
                </>
              }
            />
          </div>
        )}

        {/* ================= MMR AREA-WISE RECOMMENDATIONS ================= */}
        {activeSection === "mmr-guide" && <MMRAreaGuide />}

        {/* ================= EMERGENCY SERVICES ================= */}
        {activeSection === "emergency" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                <Hospital className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900">24/7 Verified Emergency Directory</h2>
                <p className="text-[11px] text-slate-500">Direct connection to nearest medical & police posts</p>
              </div>
            </div>

            <div className="space-y-4">
              {emergencyServices.map((section, idx) => {
                const SectionIcon = EMERGENCY_ICON_MAP[section.icon_key] || Hospital;
                return (
                  <div key={idx} className="bg-white border border-slate-200 p-4 rounded-3xl space-y-3 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                      <SectionIcon className="w-4 h-4 text-emerald-600" />
                      <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">{section.category}</h3>
                    </div>

                    <div className="space-y-2">
                      {section.list.map((item, i) => (
                        <div key={i} className="bg-slate-50/80 border border-slate-200 p-3 rounded-2xl flex justify-between items-center text-xs">
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900">{item.name}</p>
                            <p className="text-[10px] text-slate-500">{item.location} • {item.distance}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.websiteUrl && <WebsiteLink href={item.websiteUrl} label="Site" />}
                            <a
                              href={`tel:${item.phone}`}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all text-xs shadow-xs"
                            >
                              <PhoneCall className="w-3.5 h-3.5" /> Call
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= SCAM RADAR ================= */}
        {activeSection === "scams" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900">Local Scam Radar</h2>
                <p className="text-[11px] text-slate-500">Common traps and prevention tactics reported by tourists</p>
              </div>
            </div>

            <div className="space-y-3">
              {localScams.map((scam) => (
                <div key={scam.id} className="bg-white border border-amber-200 rounded-3xl overflow-hidden shadow-sm">
                  {scam.image && (
                    <img
                      src={scam.image}
                      alt=""
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  <div className="p-4 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-sm text-amber-900">{scam.title}</h3>
                    <span className="text-[9px] font-extrabold bg-amber-100 border border-amber-300 text-amber-900 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {scam.severity}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Hotspot: <strong className="text-slate-800">{scam.location}</strong>
                  </p>

                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    {scam.description}
                  </p>

                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs text-emerald-900">
                    <strong className="block text-[10px] text-emerald-800 uppercase tracking-wider mb-1">🛡️ How to Avoid:</strong>
                    {scam.prevention}
                  </div>
                  <WebsiteLink href={scam.websiteUrl} label="Source" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= NEWS / CRIME / DANGER ZONES ================= */}
        {activeSection === "alerts" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                <Newspaper className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900">City News, Crime & Danger Zones</h2>
                <p className="text-[11px] text-slate-500">Photos and source pages stored as internet links</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Headlines</h3>
              {cityNews.length === 0 && <p className="text-xs text-slate-500">No news loaded yet. Restart the API and re-seed if empty.</p>}
              {cityNews.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  {item.image && (
                    <img src={item.image} alt="" className="w-full h-36 object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  )}
                  <div className="p-4 space-y-2">
                    <span className="text-[10px] font-bold text-rose-700 uppercase">{item.category}</span>
                    <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600">{item.summary}</p>
                    <WebsiteLink href={item.websiteUrl} label="Read article" />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Verified crime reports</h3>
              {crimeReports.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  {item.image && (
                    <img src={item.image} alt="" className="w-full h-32 object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  )}
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between gap-2">
                      <h3 className="font-bold text-sm text-slate-900">{item.crimeType}</h3>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">{item.status}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{item.locationLabel}</p>
                    <p className="text-xs text-slate-600">{item.description}</p>
                    <WebsiteLink href={item.websiteUrl} label="Source" />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Danger zones</h3>
              {dangerZones.map((zone) => (
                <div key={zone.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  {zone.image && (
                    <img src={zone.image} alt="" className="w-full h-32 object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  )}
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between gap-2">
                      <h3 className="font-bold text-sm text-slate-900">{zone.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        zone.riskLevel === "red" ? "bg-rose-100 text-rose-800" :
                        zone.riskLevel === "yellow" ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-800"
                      }`}>{zone.riskLevel}</span>
                    </div>
                    <p className="text-xs text-slate-600">{zone.description}</p>
                    <WebsiteLink href={zone.websiteUrl} label="More info" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= PHRASEBOOK ================= */}
        {activeSection === "phrasebook" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                <Languages className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900">Bambaiya Hindi Audio Phrasebook</h2>
                <p className="text-[11px] text-slate-500">Essential spoken phrases for seamless communication</p>
              </div>
            </div>

            <div className="space-y-4">
              {localPhrases.map((group, idx) => (
                <div key={idx} className="bg-white border border-slate-200 p-4 rounded-3xl space-y-3 shadow-sm">
                  <h3 className="font-extrabold text-xs text-purple-700 uppercase tracking-wider border-b border-slate-100 pb-2">
                    {group.category}
                  </h3>
                  <div className="space-y-2">
                    {group.phrases.map((phrase, pIdx) => (
                      <div key={pIdx} className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-sm text-emerald-900">{phrase.hindi}</p>
                          <p className="text-xs text-slate-800 font-medium">{phrase.translation}</p>
                          <p className="text-[11px] text-slate-500 italic font-mono">"{phrase.phonetic}"</p>
                        </div>
                        <button
                          onClick={() => speakPhrase(phrase.hindi)}
                          className="p-3 bg-purple-100 hover:bg-purple-200 border border-purple-200 text-purple-800 rounded-2xl transition-all shrink-0 active:scale-95 shadow-xs"
                          title="Play Audio"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= ITINERARIES ================= */}
        {activeSection === "itineraries" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900">Smart Day Itineraries</h2>
                <p className="text-[11px] text-slate-500">Curated, safety-checked walking & transit trails</p>
              </div>
            </div>

            <div className="space-y-4">
              {smartItineraries.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  {item.image && (
                    <img src={item.image} alt="" className="w-full h-32 object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  )}
                  <div className="p-4 space-y-3">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="font-bold text-sm text-indigo-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
                  </div>
                  <div className="space-y-2">
                    {item.timeSlots.map((slot, sIdx) => (
                      <div key={sIdx} className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-start gap-3">
                        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-1 rounded-lg shrink-0 border border-indigo-200 font-mono">
                          {slot.time}
                        </span>
                        <div className="space-y-0.5">
                          <p className="font-bold text-xs text-slate-800">{slot.activity}</p>
                          <p className="text-[11px] text-slate-500">{slot.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= USER PROFILE & PASS ================= */}
        {activeSection === "profile" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900">Digital Pass & Verification</h2>
                <p className="text-[11px] text-slate-500">Unified credentials for seamless check-ins and emergency verification</p>
              </div>
            </div>

            <div className="bg-white border border-sky-200 p-5 rounded-3xl space-y-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4 relative z-10">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-emerald-500 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                    {userPhoto ? (
                      <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 p-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl cursor-pointer shadow-sm transition-all">
                    <Camera className="w-3.5 h-3.5" />
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">{touristUser.fullName}</h3>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border ${
                      hasPassPreview
                        ? "bg-sky-100 text-sky-800 border-sky-300"
                        : "bg-amber-100 text-amber-800 border-amber-300"
                    }`}>
                      {hasPassPreview ? "Verified Pass" : "Guest"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{touristUser.phone}</p>
                  <p className="text-[10px] text-sky-700 font-mono font-bold">{touristUser.idHash}</p>
                </div>
              </div>

              {!hasPassPreview ? (
                <button
                  onClick={() => {
                    setAuthStep("credentials");
                    setShowAuthModal(true);
                  }}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-2.5 rounded-2xl text-xs transition-all shadow-sm"
                >
                  Click Here to Register & Verify Tourist Pass
                </button>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs space-y-1">
                  <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Linked Tourist Account
                  </p>
                  <p className="text-[11px] text-emerald-800">Email: {touristUser.email}</p>
                  <p className="text-[11px] text-emerald-800">DOB: {touristUser.dob} | Gender: {touristUser.gender}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs relative z-10">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block mb-0.5">Credential Type</span>
                  <span className="font-semibold text-slate-800 text-[11px]">{touristUser.idType}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block mb-0.5">Valid Period</span>
                  <span className="font-semibold text-slate-800 text-[11px]">{touristUser.validTill}</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-0.5 relative z-10">
                <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Designated Emergency Contact</span>
                <p className="text-xs font-bold text-rose-600">{touristUser.emergencyContact}</p>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 text-white relative z-10 shadow-md">
                {backendPass?.qrImageUrl ? (
                  <img
                    src={assetUrl(backendPass.qrImageUrl)}
                    alt="Tourist pass QR code"
                    className="w-28 h-28 bg-white p-1 rounded-xl object-contain"
                  />
                ) : (
                  <QrCode className="w-24 h-24 text-white" />
                )}
                <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest">Digital Check-in QR</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= TRAIN PATH FINDER ================= */}
        {activeSection === "pathfinder" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                <Train className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900">Suburban Local Train Navigator</h2>
                <p className="text-[11px] text-slate-500">Interchange mapping across Western, Central & Harbour networks</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-3xl space-y-4 shadow-sm">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Origin Station:</label>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl p-3 text-xs focus:outline-none focus:border-amber-500"
                  >
                    {mumbaiStations.map((st) => (
                      <option key={st.name} value={st.name}>
                        {st.name} ({st.line})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Destination Station:</label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl p-3 text-xs focus:outline-none focus:border-amber-500"
                  >
                    {mumbaiStations.map((st) => (
                      <option key={st.name} value={st.name}>
                        {st.name} ({st.line})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleCalculateRoute}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98"
                >
                  <Train className="w-4 h-4" /> Map Route & Standard Fare
                </button>
              </div>

              {searchedRoute && (
                <div className="bg-slate-50 border border-amber-300 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start border-b border-slate-200 pb-2.5">
                    <div>
                      <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">Recommended Path</span>
                      <p className="font-bold text-sm text-slate-900 mt-0.5">{origin} ➔ {destination}</p>
                    </div>
                    <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2.5 py-1 rounded-xl border border-amber-300">
                      ₹{searchedRoute.fare}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <p className="text-slate-700">
                      <strong className="text-slate-500">Line:</strong> {searchedRoute.line}
                    </p>
                    {searchedRoute.interchange && (
                      <p className="text-amber-900 bg-amber-100/70 p-2.5 rounded-xl border border-amber-300 text-[11px]">
                        <strong>Interchange Notice:</strong> {searchedRoute.interchange}
                      </p>
                    )}
                    <p className="text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <strong className="text-slate-500">Estimated Duration:</strong> ~{searchedRoute.estimatedMins} mins
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= FARE ESTIMATOR ================= */}
        {activeSection === "fare" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-2 bg-yellow-100 text-yellow-700 rounded-xl">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900">Metered Transport Fare Estimator</h2>
                <p className="text-[11px] text-slate-500">Official sanctioned rates for Auto-Rickshaws & Black-and-Yellow Cabs</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-3xl space-y-4 shadow-sm">
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">Trip Distance:</span>
                  <span className="text-amber-700 font-bold font-mono">{cabDistance} km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="35"
                  value={cabDistance}
                  onChange={(e) => setCabDistance(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Auto Rickshaw</span>
                  <span className="text-2xl font-extrabold text-amber-700 block">₹{Math.round(fareQuote?.auto_fare ?? cabDistance * 18 + 23)}</span>
                  <span className="text-[9px] text-slate-500 block">(Suburbs Only)</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Black-Yellow Taxi</span>
                  <span className="text-2xl font-extrabold text-sky-700 block">₹{Math.round(fareQuote?.cab_fare ?? cabDistance * 24 + 50)}</span>
                  <span className="text-[9px] text-slate-500 block">(City & Suburbs)</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Local Train</span>
                  <span className="text-2xl font-extrabold text-emerald-700 block">₹{Math.round(fareQuote?.local_train_fare ?? cabDistance * 0.7 + 5)}</span>
                  <span className="text-[9px] text-slate-500 block">(Second Class)</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">BEST Bus</span>
                  <span className="text-2xl font-extrabold text-indigo-700 block">₹{Math.round(fareQuote?.best_bus_fare ?? cabDistance * 1.2 + 8)}</span>
                  <span className="text-[9px] text-slate-500 block">(Ordinary)</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
                <p className="font-bold text-slate-900">💡 Regulations to Remember:</p>
                <p>• Auto-rickshaws do NOT operate south of Sion/Bandra (South Mumbai). Use black-and-yellow cabs instead.</p>
                <p>• Midnight surcharge (25% extra) applies automatically between 12:00 AM and 05:00 AM.</p>
              </div>
            </div>
          </div>
        )}

        {/* ================= ATTRACTIONS ================= */}
        {activeSection === "attractions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-slate-900">MMR Attractions Explorer</h2>
                  <p className="text-[11px] text-slate-500">{filteredAttractions.length} destinations with live status</p>
                </div>
              </div>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {["All", "South Mumbai", "Western Suburbs", "Thane", "Navi Mumbai"].map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegionFilter(reg)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                    selectedRegionFilter === reg
                      ? "bg-purple-700 text-white border-purple-800 shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredAttractions.map((spot) => (
                <div
                  key={spot.id}
                  className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={spot.image || "https://commons.wikimedia.org/wiki/Special:FilePath/Mumbai_03-2016_30_Gateway_of_India.jpg?width=1280"}
                      alt={spot.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mumbai_03-2016_30_Gateway_of_India.jpg/800px-Mumbai_03-2016_30_Gateway_of_India.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-[10px] font-extrabold bg-white/90 backdrop-blur-md text-purple-900 px-2.5 py-1 rounded-full border border-white/50 shadow-xs">
                        {spot.region}
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-500 text-white px-2.5 py-1 rounded-full shadow-xs">
                        {spot.safetyStatus}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider block">
                        {spot.category}
                      </span>
                      <h3 className="font-extrabold text-base leading-tight drop-shadow-sm">{spot.name}</h3>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <p className="text-xs text-slate-600 leading-relaxed">{spot.description}</p>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="mr-auto flex items-center gap-2 text-slate-500 font-semibold text-[11px]">
                        <span className="text-amber-500 font-bold">⭐ {spot.rating}</span>
                        <span>•</span>
                        <span>{spot.distance}</span>
                      </div>
                      <WebsiteLink href={spot.websiteUrl} label="Website" />
                      <button
                        type="button"
                        onClick={async () => {
                          const dest = await resolveMapCoords(spot);
                          if (!dest) return;
                          await startRouteTo({ lat: dest.lat, lng: dest.lng, name: spot.name });
                        }}
                        className="bg-purple-50 hover:bg-purple-100 text-purple-800 font-extrabold px-3 py-1.5 rounded-xl border border-purple-200 flex items-center gap-1 transition-all text-[11px] shadow-2xs"
                      >
                        Navigate <Route className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= HOTELS ================= */}
        {activeSection === "hotels" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-2 bg-pink-100 text-pink-700 rounded-xl">
                <Hotel className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900">Verified Accommodations</h2>
                <p className="text-[11px] text-slate-500">Vetted hotels connected to tourist assistance services</p>
              </div>
            </div>

            <div className="space-y-3">
              {nearbyHotels.map((hotel) => (
                <div key={hotel.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  {hotel.image && (
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full h-36 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  <div className="p-4 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{hotel.name}</h3>
                      <p className="text-[10px] text-pink-700 font-semibold">{hotel.category}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700">{hotel.priceRange}</span>
                  </div>

                  <p className="text-xs text-slate-600">{hotel.description}</p>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="mr-auto text-slate-500 font-semibold text-[11px]">
                      <span>⭐ {hotel.rating} • {hotel.distance}</span>
                    </div>
                    <WebsiteLink href={hotel.websiteUrl} label="Book / site" />
                    <button
                      type="button"
                      onClick={async () => {
                        const dest = await resolveMapCoords(hotel);
                        if (!dest) return;
                        await startRouteTo({ lat: dest.lat, lng: dest.lng, name: hotel.name });
                      }}
                      className="bg-pink-50 hover:bg-pink-100 text-pink-800 font-extrabold px-3 py-1.5 rounded-xl border border-pink-200 flex items-center gap-1 transition-all text-[11px] shadow-2xs"
                    >
                      Navigate <Route className="w-3 h-3" />
                    </button>
                  </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= FOOD ================= */}
        {activeSection === "food" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-2 bg-orange-100 text-orange-700 rounded-xl">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900">Iconic Culinary Destinations</h2>
                <p className="text-[11px] text-slate-500">Hygienically verified heritage food stops</p>
              </div>
            </div>

            <div className="space-y-3">
              {mustTryFood.map((food) => (
                <div key={food.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  {food.image && (
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-full h-36 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  <div className="p-4 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{food.name}</h3>
                      <p className="text-[10px] text-orange-700 font-semibold">{food.cuisine}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-600">⭐ {food.rating}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Recommended Speciality:</span>
                    <span className="font-bold text-amber-900">{food.mustTryDish}</span>
                  </div>

                  <p className="text-xs text-slate-600">{food.description}</p>
                   
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="mr-auto text-slate-500 font-semibold text-[11px]">
                      <span>{food.distance || "Nearby"}</span>
                    </div>
                    <WebsiteLink href={food.websiteUrl} label="Website" />
                    <button
                      type="button"
                      onClick={async () => {
                        const dest = await resolveMapCoords(food);
                        if (!dest) return;
                        await startRouteTo({ lat: dest.lat, lng: dest.lng, name: food.name });
                      }}
                      className="bg-orange-50 hover:bg-orange-100 text-orange-800 font-extrabold px-3 py-1.5 rounded-xl border border-orange-200 flex items-center gap-1 transition-all text-[11px] shadow-2xs"
                    >
                      Navigate <Route className="w-3 h-3" />
                    </button>
                  </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Bottom Dock Navigation */}
      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-white/90 backdrop-blur-xl border border-slate-200/90 p-2 rounded-3xl flex justify-around items-center z-30 shadow-lg shadow-slate-200/80 mb-[env(safe-area-inset-bottom)]">
        {[
          { id: "home", label: "Map", icon: Home },
          { id: "mmr-guide", label: "MMR", icon: Compass },
          { id: "attractions", label: "Sights", icon: Sparkles },
          { id: "pathfinder", label: "Trains", icon: Train },
          { id: "emergency", label: "Safety", icon: Hospital },
          { id: "profile", label: "Pass", icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-200 scale-105"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[9px] font-bold mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </nav>

    </main>
  );
}

export default function TouristDashboard() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f8fafc]" />}>
      <TouristDashboardContent />
    </Suspense>
  );
}
