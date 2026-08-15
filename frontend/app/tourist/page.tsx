"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import GuestOverviewPage from "@/components/GuestOverviewPage";
import { SafetyHeader } from "@/components/SafetyHeader";
import { SOSButton } from "@/components/SOSButton";
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
} from "lucide-react";

// ================= MOCK DATA & DATABASES =================

const MUMBAI_STATIONS = [
  { name: "Churchgate", line: "Western", hub: false },
  { name: "Marine Lines", line: "Western", hub: false },
  { name: "Charni Road", line: "Western", hub: false },
  { name: "Grant Road", line: "Western", hub: false },
  { name: "Mumbai Central", line: "Western", hub: true },
  { name: "Dadar", line: "Interchange (Western & Central)", hub: true },
  { name: "Bandra", line: "Western", hub: true },
  { name: "Andheri", line: "Western & Harbour", hub: true },
  { name: "Borivali", line: "Western", hub: true },
  { name: "Virar", line: "Western", hub: false },
  { name: "CSMT (VT)", line: "Central & Harbour", hub: true },
  { name: "Byculla", line: "Central", hub: false },
  { name: "Kurla", line: "Interchange (Central & Harbour)", hub: true },
  { name: "Ghatkopar", line: "Central", hub: true },
  { name: "Thane", line: "Central", hub: true },
  { name: "Kalyan", line: "Central", hub: true },
  { name: "Wadala Road", line: "Harbour", hub: true },
  { name: "Vashi", line: "Harbour", hub: true },
  { name: "Panvel", line: "Harbour", hub: true },
];

const EMERGENCY_SERVICES = [
  {
    category: "24/7 Hospitals",
    icon: Hospital,
    color: "emerald",
    list: [
      { name: "Bombay Hospital & Medical Research Centre", phone: "+912222067676", distance: "1.1 km", location: "Marine Lines" },
      { name: "INS Asvini Naval Hospital", phone: "+912222151661", distance: "2.4 km", location: "Colaba" },
      { name: "Lilavati Hospital & Research Centre", phone: "+912226751000", distance: "14.2 km", location: "Bandra West" },
    ],
  },
  {
    category: "Tourist Police Squads",
    icon: Siren,
    color: "sky",
    list: [
      { name: "Colaba Tourist Police Precinct", phone: "112", distance: "0.8 km", location: "Colaba Causeway" },
      { name: "Azad Maidan Police Station (CST Area)", phone: "+912222620330", distance: "2.1 km", location: "Fort" },
      { name: "Marine Drive Police Control", phone: "+912222812061", distance: "1.3 km", location: "Marine Drive" },
    ],
  },
  {
    category: "24/7 Pharmacies",
    icon: Pill,
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
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1609949279531-cf48d64bed89?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1620802051782-725fa33f9232?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80",
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
  },
  {
    id: 102,
    name: "Trident Hotel Nariman Point",
    category: "5-Star Business & Luxury",
    rating: 4.7,
    priceRange: "₹14,000 / night",
    distance: "0.4 km",
    description: "Located right on Marine Drive offering panoramic coastal ocean views.",
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
  },
  {
    id: 202,
    name: "Bademiya Kebabs",
    cuisine: "Mughlai Street Food",
    mustTryDish: "Chicken Baida Roti & Seekh Kebab",
    rating: 4.5,
    distance: "1.3 km",
    description: "World-renowned late-night street food destination behind the Taj Mahal Palace.",
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
  const [authStep, setAuthStep] = useState<"phone" | "otp" | "profile">("phone");
  const [countryCode, setCountryCode] = useState("+91");
  const [authPhone, setAuthPhone] = useState("");
  const [authOtp, setAuthOtp] = useState("");

  // Profile Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");

  // OTP Timer State
  const [resendTimer, setResendTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);

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
  >("home");

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>("All");

  // Profile Photo State
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  // Dynamic User Profile
  const touristUser = {
    fullName: hasPassPreview && fullName ? fullName : "Guest Traveler",
    email: hasPassPreview && email ? email : "Not provided",
    phone: hasPassPreview && authPhone ? `${countryCode} ${authPhone}` : "Unverified (Guest Mode)",
    dob: dob || "Not specified",
    gender: gender || "Not specified",
    emergencyContact: "+91 91234 56789 (Parent)",
    idType: hasPassPreview ? "Verified Local Tourist Pass" : "Temporary Guest Session",
    idHash: hasPassPreview ? `DID:SUKHAD-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : "DID:GUEST-TEMPORARY",
    validTill: "18 Aug 2026",
  };

  // Safety & SOS State
  const [isDanger, setIsDanger] = useState(false);
  const [sosSent, setSosSent] = useState(false);

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

  // 3. 60-SECOND COUNTDOWN TIMER FOR OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, resendTimer]);

  const startResendTimer = () => {
    setResendTimer(60);
    setIsTimerActive(true);
  };

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
    window.location.href = "tel:112";
  };

  const handleCalculateRoute = () => {
    const origStation = MUMBAI_STATIONS.find((s) => s.name === origin);
    const destStation = MUMBAI_STATIONS.find((s) => s.name === destination);

    if (!origStation || !destStation) return;

    if (origStation.line.includes("Western") && destStation.line.includes("Western")) {
      setSearchedRoute({
        line: "Western Line (Slow / Fast Local)",
        interchange: null,
        estimatedMins: 35,
        fare: 10,
      });
    } else if (origStation.line.includes("Central") && destStation.line.includes("Central")) {
      setSearchedRoute({
        line: "Central Line (Main Line Local)",
        interchange: null,
        estimatedMins: 40,
        fare: 15,
      });
    } else {
      setSearchedRoute({
        line: `${origStation.line} ➔ ${destStation.line}`,
        interchange: "Change train at Dadar Junction or Kurla Junction",
        estimatedMins: 55,
        fare: 20,
      });
    }
  };

  const navigateTo = (section: typeof activeSection) => {
    setActiveSection(section);
    setIsMenuOpen(false);
  };

  // Registration Auth Steps
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{7,12}$/.test(authPhone.replace(/\s+/g, ""))) return;
    setAuthStep("otp");
    startResendTimer();
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authOtp.length < 4) return;
    setAuthStep("profile");
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;
    setHasPassPreview(true);
    setShowAuthModal(false);
    setAuthStep("phone");
    // Show Intro Screen post-registration
    setShowRegistrationIntro(true);
  };

  const handleSocialAuth = (provider: string) => {
    setFullName(`${provider} Traveler`);
    setEmail(`user@${provider.toLowerCase()}.com`);
    setAuthStep("profile");
  };

  // Filtered attractions
  const filteredAttractions =
    selectedRegionFilter === "All"
      ? NEARBY_ATTRACTIONS
      : NEARBY_ATTRACTIONS.filter((item) => item.region.includes(selectedRegionFilter));

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
          setAuthStep("phone");
          setShowAuthModal(true);
        }}
      />
    );
  }

  // ================= 3. MAIN DASHBOARD WITH AUTH MODAL & INTRO OVERLAY =================
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-800 pb-28 max-w-md mx-auto relative border-x border-slate-200/90 shadow-xl font-sans selection:bg-emerald-200 selection:text-emerald-950 overflow-x-hidden">
      
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
                setAuthStep("phone");
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Step Progress Header */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>{authStep === "profile" ? "Step 2 of 2: Profile Info" : "Step 1 of 2: Verification"}</span>
                <span className="text-emerald-700 font-mono">
                  {authStep === "phone" ? "33%" : authStep === "otp" ? "66%" : "100%"}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300"
                  style={{ width: authStep === "phone" ? "33%" : authStep === "otp" ? "66%" : "100%" }}
                />
              </div>
            </div>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                {authStep === "profile" ? <User className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
              </div>
              <h2 className="text-lg font-black text-slate-900">
                {authStep === "phone" && "Quick Verification"}
                {authStep === "otp" && "Enter Security Code"}
                {authStep === "profile" && "Complete Tourist Profile"}
              </h2>
              <p className="text-xs text-slate-500">
                {authStep === "phone" && "Verify mobile or sign in with social accounts to issue your pass."}
                {authStep === "otp" && `We sent a 4-digit OTP code to ${countryCode} ${authPhone}.`}
                {authStep === "profile" && "Provide mandatory details to personalize your tourist safety pass."}
              </p>
            </div>

            {/* STEP 1: PHONE & SOCIAL AUTH */}
            {authStep === "phone" && (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Mobile Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 px-2 py-3 focus:outline-none focus:border-emerald-500 shrink-0"
                    >
                      <option value="+91">+91 (IN)</option>
                      <option value="+1">+1 (US/CA)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+61">+61 (AU)</option>
                      <option value="+971">+971 (AE)</option>
                    </select>

                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="tel"
                        placeholder="98765 43210"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-200 flex items-center justify-center gap-1.5"
                >
                  Send OTP Code <ArrowRight className="w-4 h-4" />
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Or Continue With
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSocialAuth("Google")}
                    className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl py-2.5 text-xs font-bold text-slate-700 transition-all"
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
                    className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2.5 text-xs font-bold transition-all"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.28c.67-.81 1.12-1.94.99-3.07-.96.04-2.13.64-2.82 1.44-.61.71-1.15 1.87-1.01 2.98 1.08.08 2.17-.54 2.84-1.35z" />
                    </svg>
                    Apple
                  </button>
                </div>
              </form>
            )}

            {/* STEP 1b: OTP ENTRY & COUNTDOWN TIMER */}
            {authStep === "otp" && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    4-Digit Verification Code
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      placeholder="• • • •"
                      maxLength={6}
                      value={authOtp}
                      onChange={(e) => setAuthOtp(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 tracking-widest text-center focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs px-1">
                  <button
                    type="button"
                    onClick={() => setAuthStep("phone")}
                    className="text-slate-500 hover:text-slate-800 font-semibold underline text-[11px]"
                  >
                    Change Number
                  </button>

                  <button
                    type="button"
                    disabled={isTimerActive}
                    onClick={startResendTimer}
                    className={`font-bold text-[11px] ${
                      isTimerActive ? "text-slate-400 cursor-not-allowed" : "text-emerald-700 hover:underline"
                    }`}
                  >
                    {isTimerActive ? `Resend Code in ${resendTimer}s` : "Resend Code"}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-200"
                >
                  Verify OTP & Proceed
                </button>
              </form>
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

                <button
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 rounded-xl text-xs transition-all shadow-md shadow-emerald-200 mt-2"
                >
                  Generate Tourist Pass
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
                setAuthStep("phone");
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
              zoneName={isDanger ? "High-Density Alert Precinct" : "Marine Drive Promenade"}
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

            <div className="relative h-56 bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col items-center justify-center p-4 shadow-sm">
              <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative flex items-center justify-center">
                  <div className={`absolute w-20 h-20 rounded-full animate-ping opacity-30 ${isDanger ? "bg-rose-500" : "bg-emerald-500"}`} />
                  <div className={`p-4 rounded-full border shadow-md ${isDanger ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-emerald-50 border-emerald-200 text-emerald-600"}`}>
                    <MapPin className="w-7 h-7" />
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold mt-3 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 text-slate-700 shadow-xs">
                  {isDanger ? "⚠️ High Risk Area Flagged" : "✓ Active Patrol Monitoring"}
                </span>
              </div>

              {isDanger && (
                <div className="absolute bottom-3 left-3 right-3 bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-2xl text-xs flex items-center gap-2.5 shadow-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-medium">Caution: High crowd density & scam reports flagged in this grid.</span>
                </div>
              )}
            </div>

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
              {EMERGENCY_SERVICES.map((section, idx) => {
                const SectionIcon = section.icon;
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
                          <a
                            href={`tel:${item.phone}`}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all text-xs shadow-xs"
                          >
                            <PhoneCall className="w-3.5 h-3.5" /> Call
                          </a>
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
              {LOCAL_SCAMS.map((scam) => (
                <div key={scam.id} className="bg-white border border-amber-200 p-4 rounded-3xl space-y-2.5 shadow-sm">
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
              {LOCAL_PHRASES.map((group, idx) => (
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
              {SMART_ITINERARIES.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 p-4 rounded-3xl space-y-3 shadow-sm">
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
                    setAuthStep("phone");
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
                <QrCode className="w-24 h-24 text-white" />
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
                    {MUMBAI_STATIONS.map((st) => (
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
                    {MUMBAI_STATIONS.map((st) => (
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
                  <span className="text-2xl font-extrabold text-amber-700 block">₹{cabDistance * 18 + 23}</span>
                  <span className="text-[9px] text-slate-500 block">(Suburbs Only)</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Black-Yellow Taxi</span>
                  <span className="text-2xl font-extrabold text-sky-700 block">₹{cabDistance * 24 + 50}</span>
                  <span className="text-[9px] text-slate-500 block">(City & Suburbs)</span>
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
                      src={spot.image}
                      alt={spot.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
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

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2 text-slate-500 font-semibold text-[11px]">
                        <span className="text-amber-500 font-bold">⭐ {spot.rating}</span>
                        <span>•</span>
                        <span>{spot.distance}</span>
                      </div>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${spot.mapQuery}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-purple-50 hover:bg-purple-100 text-purple-800 font-extrabold px-3 py-1.5 rounded-xl border border-purple-200 flex items-center gap-1 transition-all text-[11px] shadow-2xs"
                      >
                        Navigate <ExternalLink className="w-3 h-3" />
                      </a>
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
              {NEARBY_HOTELS.map((hotel) => (
                <div key={hotel.id} className="bg-white border border-slate-200 p-4 rounded-3xl space-y-2.5 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{hotel.name}</h3>
                      <p className="text-[10px] text-pink-700 font-semibold">{hotel.category}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700">{hotel.priceRange}</span>
                  </div>

                  <p className="text-xs text-slate-600">{hotel.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <span>⭐ {hotel.rating} • {hotel.distance}</span>
                    <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md border border-sky-200 font-bold">
                      Verified Safety Desk
                    </span>
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
              {MUST_TRY_FOOD.map((food) => (
                <div key={food.id} className="bg-white border border-slate-200 p-4 rounded-3xl space-y-2.5 shadow-sm">
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
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Bottom Dock Navigation */}
      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-white/90 backdrop-blur-xl border border-slate-200/90 p-2 rounded-3xl flex justify-around items-center z-30 shadow-lg shadow-slate-200/80">
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