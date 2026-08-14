// utils/trainNetwork.ts

export type RouteEdge = { node: string; time: number; dist: number; line: string };

export const calculateOfficialFare = (distanceKm: number): number => {
  if (distanceKm === 0) return 0;
  if (distanceKm <= 10) return 5;
  if (distanceKm <= 25) return 10;
  if (distanceKm <= 45) return 15;
  if (distanceKm <= 65) return 20;
  return 25; 
};

export const MUMBAI_GRAPH: Record<string, RouteEdge[]> = {
  // ================= 1. WESTERN LINE (Churchgate to Dahanu Road / Virar) =================
  "Churchgate": [
    { node: "Marine Lines", time: 3, dist: 2, line: "Western" }
  ],
  "Marine Lines": [
    { node: "Churchgate", time: 3, dist: 2, line: "Western" },
    { node: "Charni Road", time: 2, dist: 1, line: "Western" }
  ],
  "Charni Road": [
    { node: "Marine Lines", time: 2, dist: 1, line: "Western" },
    { node: "Grant Road", time: 3, dist: 1, line: "Western" }
  ],
  "Grant Road": [
    { node: "Charni Road", time: 3, dist: 1, line: "Western" },
    { node: "Mumbai Central", time: 2, dist: 1, line: "Western" }
  ],
  "Mumbai Central": [
    { node: "Grant Road", time: 2, dist: 1, line: "Western" },
    { node: "Mahalaxmi", time: 3, dist: 1, line: "Western" }
  ],
  "Mahalaxmi": [
    { node: "Mumbai Central", time: 3, dist: 1, line: "Western" },
    { node: "Lower Parel", time: 2, dist: 1, line: "Western" }
  ],
  "Lower Parel": [
    { node: "Mahalaxmi", time: 2, dist: 1, line: "Western" },
    { node: "Prabhadevi", time: 3, dist: 1, line: "Western" }
  ],
  "Prabhadevi": [
    { node: "Lower Parel", time: 3, dist: 1, line: "Western" },
    { node: "Dadar", time: 2, dist: 1, line: "Western" }
  ],
  "Dadar": [
    { node: "Prabhadevi", time: 2, dist: 1, line: "Western" },
    { node: "Matunga Road", time: 2, dist: 1, line: "Western" },
    { node: "Currey Road", time: 3, dist: 2, line: "Central" }, // Central connection
    { node: "Parel", time: 2, dist: 1, line: "Central" },
    { node: "Kurla", time: 10, dist: 7, line: "Central" },
    { node: "CSMT (VT)", time: 20, dist: 9, line: "Central" }
  ],
  "Matunga Road": [
    { node: "Dadar", time: 2, dist: 1, line: "Western" },
    { node: "Mahim Junction", time: 2, dist: 1, line: "Western" }
  ],
  "Mahim Junction": [
    { node: "Matunga Road", time: 2, dist: 1, line: "Western" },
    { node: "Bandra", time: 3, dist: 2, line: "Western" },
    { node: "King's Circle", time: 3, dist: 2, line: "Harbour" }
  ],
  "Bandra": [
    { node: "Mahim Junction", time: 3, dist: 2, line: "Western" },
    { node: "Khar Road", time: 2, dist: 1, line: "Western" },
    { node: "Kurla", time: 15, dist: 6, line: "Harbour" }
  ],
  "Khar Road": [
    { node: "Bandra", time: 2, dist: 1, line: "Western" },
    { node: "Santacruz", time: 2, dist: 1, line: "Western" }
  ],
  "Santacruz": [
    { node: "Khar Road", time: 2, dist: 1, line: "Western" },
    { node: "Vile Parle", time: 3, dist: 1, line: "Western" }
  ],
  "Vile Parle": [
    { node: "Santacruz", time: 3, dist: 1, line: "Western" },
    { node: "Andheri", time: 3, dist: 2, line: "Western" }
  ],
  "Andheri": [
    { node: "Vile Parle", time: 3, dist: 2, line: "Western" },
    { node: "Jogeshwari", time: 3, dist: 2, line: "Western" }
  ],
  "Jogeshwari": [
    { node: "Andheri", time: 3, dist: 2, line: "Western" },
    { node: "Ram Mandir", time: 2, dist: 1, line: "Western" }
  ],
  "Ram Mandir": [
    { node: "Jogeshwari", time: 2, dist: 1, line: "Western" },
    { node: "Goregaon", time: 2, dist: 1, line: "Western" }
  ],
  "Goregaon": [
    { node: "Ram Mandir", time: 2, dist: 1, line: "Western" },
    { node: "Malad", time: 3, dist: 2, line: "Western" }
  ],
  "Malad": [
    { node: "Goregaon", time: 3, dist: 2, line: "Western" },
    { node: "Kandivli", time: 3, dist: 2, line: "Western" }
  ],
  "Kandivli": [
    { node: "Malad", time: 3, dist: 2, line: "Western" },
    { node: "Borivali", time: 4, dist: 3, line: "Western" }
  ],
  "Borivali": [
    { node: "Kandivli", time: 4, dist: 3, line: "Western" },
    { node: "Dahisar", time: 3, dist: 2, line: "Western" }
  ],
  "Dahisar": [
    { node: "Borivali", time: 3, dist: 2, line: "Western" },
    { node: "Mira Road", time: 3, dist: 3, line: "Western" }
  ],
  "Mira Road": [
    { node: "Dahisar", time: 3, dist: 3, line: "Western" },
    { node: "Bhayandar", time: 4, dist: 3, line: "Western" }
  ],
  "Bhayandar": [
    { node: "Mira Road", time: 4, dist: 3, line: "Western" },
    { node: "Naigaon", time: 6, dist: 5, line: "Western" }
  ],
  "Naigaon": [
    { node: "Bhayandar", time: 6, dist: 5, line: "Western" },
    { node: "Vasai Road", time: 4, dist: 4, line: "Western" }
  ],
  "Vasai Road": [
    { node: "Naigaon", time: 4, dist: 4, line: "Western" },
    { node: "Nallasopara", time: 4, dist: 4, line: "Western" }
  ],
  "Nallasopara": [
    { node: "Vasai Road", time: 4, dist: 4, line: "Western" },
    { node: "Virar", time: 5, dist: 4, line: "Western" }
  ],
  "Virar": [
    { node: "Nallasopara", time: 5, dist: 4, line: "Western" }
  ],

  // ================= 2. CENTRAL MAIN LINE (CSMT to Kalyan & Beyond) =================
  "CSMT (VT)": [
    { node: "Masjid", time: 2, dist: 1, line: "Central" },
    { node: "Byculla", time: 7, dist: 4, line: "Central" }
  ],
  "Masjid": [
    { node: "CSMT (VT)", time: 2, dist: 1, line: "Central" },
    { node: "Sandhurst Road", time: 2, dist: 1, line: "Central" }
  ],
  "Sandhurst Road": [
    { node: "Masjid", time: 2, dist: 1, line: "Central" },
    { node: "Byculla", time: 3, dist: 2, line: "Central" }
  ],
  "Byculla": [
    { node: "Sandhurst Road", time: 3, dist: 2, line: "Central" },
    { node: "Chinchpokli", time: 2, dist: 1, line: "Central" }
  ],
  "Chinchpokli": [
    { node: "Byculla", time: 2, dist: 1, line: "Central" },
    { node: "Currey Road", time: 2, dist: 1, line: "Central" }
  ],
  "Currey Road": [
    { node: "Chinchpokli", time: 2, dist: 1, line: "Central" },
    { node: "Parel", time: 2, dist: 1, line: "Central" }
  ],
  "Parel": [
    { node: "Currey Road", time: 2, dist: 1, line: "Central" },
    { node: "Dadar", time: 2, dist: 1, line: "Central" }
  ],
  "Matunga": [
    { node: "Dadar", time: 2, dist: 1, line: "Central" },
    { node: "Sion", time: 3, dist: 2, line: "Central" }
  ],
  "Sion": [
    { node: "Matunga", time: 3, dist: 2, line: "Central" },
    { node: "Kurla", time: 3, dist: 2, line: "Central" }
  ],
  "Kurla": [
    { node: "Sion", time: 3, dist: 2, line: "Central" },
    { node: "Vidhyavihar", time: 2, dist: 2, line: "Central" },
    { node: "Bandra", time: 15, dist: 6, line: "Harbour" },
    { node: "Vashi", time: 30, dist: 18, line: "Harbour" }
  ],
  "Vidhyavihar": [
    { node: "Kurla", time: 2, dist: 2, line: "Central" },
    { node: "Ghatkopar", time: 3, dist: 2, line: "Central" }
  ],
  "Ghatkopar": [
    { node: "Vidhyavihar", time: 3, dist: 2, line: "Central" },
    { node: "Vikhroli", time: 3, dist: 3, line: "Central" }
  ],
  "Vikhroli": [
    { node: "Ghatkopar", time: 3, dist: 3, line: "Central" },
    { node: "Kanjurmarg", time: 3, dist: 2, line: "Central" }
  ],
  "Kanjurmarg": [
    { node: "Vikhroli", time: 3, dist: 2, line: "Central" },
    { node: "Bhandup", time: 2, dist: 2, line: "Central" }
  ],
  "Bhandup": [
    { node: "Kanjurmarg", time: 2, dist: 2, line: "Central" },
    { node: "Nahur", time: 2, dist: 2, line: "Central" }
  ],
  "Nahur": [
    { node: "Bhandup", time: 2, dist: 2, line: "Central" },
    { node: "Mulund", time: 3, dist: 2, line: "Central" }
  ],
  "Mulund": [
    { node: "Nahur", time: 3, dist: 2, line: "Central" },
    { node: "Thane", time: 4, dist: 3, line: "Central" }
  ],
  "Thane": [
    { node: "Mulund", time: 4, dist: 3, line: "Central" },
    { node: "Kalwa", time: 4, dist: 3, line: "Central" },
    { node: "Mumbra", time: 5, dist: 4, line: "Central" }
  ],
  "Kalwa": [
    { node: "Thane", time: 4, dist: 3, line: "Central" },
    { node: "Diva Junction", time: 5, dist: 4, line: "Central" }
  ],
  "Mumbra": [
    { node: "Thane", time: 5, dist: 4, line: "Central" },
    { node: "Diva Junction", time: 3, dist: 3, line: "Central" }
  ],
  "Diva Junction": [
    { node: "Mumbra", time: 3, dist: 3, line: "Central" },
    { node: "Kopar", time: 3, dist: 2, line: "Central" },
    { node: "Dombivli", time: 5, dist: 4, line: "Central" }
  ],
  "Kopar": [
    { node: "Diva Junction", time: 3, dist: 2, line: "Central" },
    { node: "Dombivli", time: 2, dist: 2, line: "Central" }
  ],
  "Dombivli": [
    { node: "Kopar", time: 2, dist: 2, line: "Central" },
    { node: "Thakurli", time: 3, dist: 2, line: "Central" }
  ],
  "Thakurli": [
    { node: "Dombivli", time: 3, dist: 2, line: "Central" },
    { node: "Kalyan Junction", time: 4, dist: 3, line: "Central" }
  ],
  "Kalyan Junction": [
    { node: "Thakurli", time: 4, dist: 3, line: "Central" }
  ],

  // ================= 3. HARBOUR LINE (CSMT to Panvel) =================
  "King's Circle": [
    { node: "Mahim Junction", time: 3, dist: 2, line: "Harbour" },
    { node: "Wadala Road", time: 3, dist: 2, line: "Harbour" }
  ],
  "Wadala Road": [
    { node: "King's Circle", time: 3, dist: 2, line: "Harbour" },
    { node: "Guru Tegh Bahadur Nagar", time: 3, dist: 2, line: "Harbour" }
  ],
  "Guru Tegh Bahadur Nagar": [
    { node: "Wadala Road", time: 3, dist: 2, line: "Harbour" },
    { node: "Chunabhatti", time: 3, dist: 2, line: "Harbour" }
  ],
  "Chunabhatti": [
    { node: "Guru Tegh Bahadur Nagar", time: 3, dist: 2, line: "Harbour" },
    { node: "Kurla", time: 3, dist: 2, line: "Harbour" }
  ],
  "Vashi": [
    { node: "Kurla", time: 30, dist: 18, line: "Harbour" },
    { node: "Sanpada", time: 2, dist: 1, line: "Harbour" }
  ],
  "Sanpada": [
    { node: "Vashi", time: 2, dist: 1, line: "Harbour" },
    { node: "Juinagar", time: 3, dist: 2, line: "Harbour" }
  ],
  "Juinagar": [
    { node: "Sanpada", time: 3, dist: 2, line: "Harbour" },
    { node: "Nerul", time: 3, dist: 2, line: "Harbour" }
  ],
  "Nerul": [
    { node: "Juinagar", time: 3, dist: 2, line: "Harbour" },
    { node: "Seawoods-Darave", time: 3, dist: 2, line: "Harbour" }
  ],
  "Seawoods-Darave": [
    { node: "Nerul", time: 3, dist: 2, line: "Harbour" },
    { node: "CBD Belapur", time: 3, dist: 2, line: "Harbour" }
  ],
  "CBD Belapur": [
    { node: "Seawoods-Darave", time: 3, dist: 2, line: "Harbour" },
    { node: "Kharghar", time: 4, dist: 3, line: "Harbour" }
  ],
  "Kharghar": [
    { node: "CBD Belapur", time: 4, dist: 3, line: "Harbour" },
    { node: "Mansarovar", time: 3, dist: 2, line: "Harbour" }
  ],
  "Mansarovar": [
    { node: "Kharghar", time: 3, dist: 2, line: "Harbour" },
    { node: "Khandeshwar", time: 3, dist: 2, line: "Harbour" }
  ],
  "Khandeshwar": [
    { node: "Mansarovar", time: 3, dist: 2, line: "Harbour" },
    { node: "Panvel", time: 4, dist: 3, line: "Harbour" }
  ],
  "Panvel": [
    { node: "Khandeshwar", time: 4, dist: 3, line: "Harbour" }
  ]
};