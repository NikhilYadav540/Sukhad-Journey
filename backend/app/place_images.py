"""Authentic place photos (Wikimedia Commons + official hospital/hotel sites)."""

from urllib.parse import quote

MOCK_MARKERS = (
    "unsplash.com",
    "images.unsplash.com",
    "pinimg.com",
    "i.pinimg.com",
    "encrypted-tbn",
    "gstatic.com/images",
)


def wm(filename: str, width: int = 1280) -> str:
    return f"https://commons.wikimedia.org/wiki/Special:FilePath/{quote(filename)}?width={width}"


def is_mock(url: str | None) -> bool:
    if not url:
        return True
    lower = url.lower()
    return any(marker in lower for marker in MOCK_MARKERS)


GATEWAY = wm("Mumbai_03-2016_30_Gateway_of_India.jpg")
MARINE_DRIVE = wm("Mumbai_03-2016_27_skyline_at_Marine_Drive.jpg")
CSMT = wm("Chhatrapati_shivaji_terminus,_esterno_01.jpg")
TAJ_PALACE = wm("Taj_Mahal_Palace_Hotel_photo.jpg")
TAJ_LANDS_END = wm("Taj_Lands_End_bandra.jpg")
HAJI_ALI = wm("Mumbai_03-2016_12_Haji_Ali_Dargah.jpg")
LILAVATI = wm("Lilavati_Hospital,_Bandra.jpg")
NANAVATI = wm("Nanavati Super Speciality Hospital, Mumbai, Maharashtra, India.jpg")
BOMBAY_HOSPITAL = wm("Bombay Hospital, Marine Lines, Mumbai.jpg")
INHS_ASVINI = wm("INHS_Asvini.png")
HOLY_FAMILY = wm("Z62 4368.jpg")
WOCKHARDT = "https://wockhardthospitals.com/wp-content/uploads/2025/05/wockhardt-hospitals-mira-road-desktop-banner-scaled.jpg"
APEX_BORIVALI = "https://apexgroupofhospitals.com/wp-content/uploads/borivali.jpg"
KARUNA = "https://www.karunahospitalmsa.com/images/banner1.jpg"
THUNGA = "https://www.thungahospital.com/lightbox/images/full/malad-reception.jpg"
BHAKTIVEDANTA = "https://assets-news.housing.com/news/wp-content/uploads/2024/02/07153948/Bhaktivedanta-Hospital-F.jpg"
SGNP_GATE = wm("Entrance_of_Sanjay_Gandhi_National_Park.JPG")
KANHERI = wm("Kanheri Caves prayer hall.JPG")
PAGODA = wm("GlobalVipasanaPagoda.JPG")
ELEPHANTA = wm("Elephanta_Caves_Trimurti.jpg")
JUHU = wm("Juhu_beach_(Arial).jpg")
BANDRA_FORT = wm("Bandra-fort-mumbai.jpg")
SEA_LINK = wm("Bandra–Worli_Sea_Link.jpg")
CHURCHGATE = wm("Churchgate_railway_station_building.jpg")
LEOPOLD = wm("LeopoldCafe_gobeirne.jpg")
VASAI_FORT = wm("Vasai_fort_building2.jpg")
AKSA = wm("Aksa_Beach_afternoon.jpg")
MANDAPESHWAR = wm("Mandapeshwar_Caves_Panorama_view.jpg")
UPVAN = wm("Upvan_Lake_-_Night_View.JPG")
BANDRA_NIGHT = wm("Bandra_Worli_Sea_Link_at_night.jpg")
POLICE_HQ = wm("Mumbai_Police_Headquarters.jpg")
BORIVALI = wm("Borivali Station entrance - east.jpg")
KANDIVALI = wm("Kandivali railway station - Overview.jpg")
ANDHERI = wm("Andheri_East.jpg")
DADAR = wm("Mumbai_03-2016_78_Dadar_station.jpg")
VIRAR = wm("Virar_railway_station_-_Entrance.jpg")
GINGER_ANDHERI = wm("Ginger Hotel, Andheri East.tif")
INFINITI_MALAD = wm("Infiniti Mall Malad-2.jpg")
INFINITI_MALAD_2 = wm("Infiniti Mall - Malad.jpg")
DMART = wm("DMart Photo.png")
DMART_EXT = wm("D-Mart.jpg")
DMART_KALAMBOLI = wm("D Mart Kalamboli.jpg")
DMART_CART = wm("DMart - Shopping Cart - Retail Shopping India.jpg")
DMART_AISLE = wm("Gemini Oil and Saffola Oil.jpg")
DMART_TIRUPATI = wm("Dmart tirupati.jpg")
DMART_GANGURU = wm("D MART, Ganguru.jpg")
GROC_MUMBAI = wm("Buying groceries in Mumbai (1109).jpg")
GROC_VEG_MUMBAI = wm("Vegetable market in Mumbai.jpg")
GROC_COLABA = wm("Market Scene - Colaba District - Mumbai - Maharashtra - India (25789223463).jpg")
GROC_KIRANA = wm("Convenient store of the old city Benares by od 6.jpg")
GROC_FRUIT = wm("Fruit Stall Street Retail Shop Mylapore India 2013.png")
GROC_CRAWFORD = wm("Inside crawford market.jpg")
PHARM_APOLLO_NAGPUR = wm("Apollo Pharmacy, Udaynagar, Nagpur.jpg")
PHARM_APOLLO_MIYAPUR = wm("Apollo pharmacy maktha mahaboobpet miyapur.jpg")
PHARM_APOLLO_LAB = wm("Apollo pharmacy maktha mahaboobpet lab test miyapur.jpg")
PHARM_APOLLO_BLR = wm("Apollo Pharmacy, RR Nagar, Bengaluru (2026).jpg")
PHARM_APOLLO_BLR2 = wm("Apollo Pharmacy, RR Nagar, Bengaluru (2026) 01.jpg")
PHARM_GOA = wm("Medical store in Goa, India, with signboard in Russian.jpg")
PHARM_GOA2 = wm("Medical store in Paliem, North Goa, March, 2018.jpg")
PHARM_KERALA = wm("Small pharmacy in Kerala.jpg")
PHARM_GANGTOK = wm("Pharmacy, Gangtok, India (8083933798).jpg")
PHARM_CLOSED = wm("Closed Medicine shop 01.jpg")
PHARM_DAWA = wm("Dawa dukan.jpg")
PHARM_BAZAR = wm("Medical Bazar, Dhamanagar, Odisha 756117, India - panoramio (1).jpg")
PHARM_PEARSON = wm("C.F.Pearson and company.jpg")
PHARM_PEARSON_IN = wm("C.F.Pearson and company Interiors.jpg")
PHARM_THUNGA = "https://www.thungahospital.com/lightbox/images/full/malad-pharmacy.jpg"
APEX_KANDIVALI = "https://apexgroupofhospitals.com/wp-content/uploads/IMG_9939.jpg"
LILAVATI_2 = wm("Lilavati Hospital 2.jpg")
HINDUJA_KHAR = wm("Hinduja Healthcare Surgical, Khar, Mumbai.jpg")
JJ_HOSPITAL = wm("JJ Hospital.jpg")
TEJPAL = wm("Gokuldas Tejpal Hospital.jpg")
SAIFEE = wm("Saifee Hospital mumbai.jpg")
TATA_MEMORIAL = wm("Homi Bhabha Block at Tata Memorial Hospital Mumbai.jpg")
HN_HOSPITAL = wm("HN Hospital.jpg")
JAGJIVANRAM = wm("Jagjivanram Hospital.jpeg")
POLICE_MH = wm("Maharashtra Police Headquarters.jpg")
HOTEL_OBERIO = wm("The Oberoi Hotel in Mumbai 2015.JPG")
HOTEL_WESTIN = wm("The Westin Mumbai Garden City.jpg")
HOTEL_HYATT = wm("Hyatt Regency, Mumbai, Maharashtra, daytime, front facade.jpg")
HOTEL_KUMKUM = wm("Hotel Kumkum in Mumbai.JPG")
HOTEL_DIPLOMAT = wm("Hotel Diplomat, Colaba, Mumbai.jpg")
HOTEL_FOUR_SEASONS = wm("Four Seasons Hotel Mumbai.jpg")
HOTEL_ITC = wm("ITC Grand Maratha Hotel, Mumbai, Maharashtra.jpg")
HOTEL_SUNNSAND = wm("Hotel Sun & Sand Swimming pool (Mumbai).jpg")
HOTEL_WESTEND = wm("West End Hotel, Marine Lines, Mumbai.jpg")
HOTEL_MARINE_PLAZA = wm("Hotel Marine Plaza.jpg")
FOOD_PAV = wm("Pav bhaji.jpg")
FOOD_VADA = wm("Mumbai Vada Pav.jpg")
FOOD_VADA2 = wm("Indian (Mumbai) Vada Pav.jpg")
FOOD_VADA3 = wm("Vada Pav-Indian street food.JPG")
FOOD_VADA4 = wm("Cheese Vada Pav.JPG")
FOOD_LEOPOLD_IN = wm("Interior of Leopold Cafe - Colaba District - Mumbai - Maharashtra - India (25787484134).jpg")
FOOD_PANI = wm("Crispy Pani Puri.jpg")
FOOD_BHEL = wm("Indian cuisine-Chaat-Bhelpuri-06.jpg")
FOOD_DABELI = wm("Dabeli.jpg")
FOOD_MISAL = wm("Maharashtra's Misal Pav.jpg")
FOOD_SANDWICH = wm("Grilled cheese sandwich.jpg")
FOOD_THALI = wm("Malwani Chicken Thali.jpg")
FOOD_FISH = wm("Fried Bombay Duck.jpg")
FOOD_BIRYANI = wm("Chicken Biryani in Alpha Hotel, Secunderabad.jpg")
FOOD_KEBAB = wm("Seekh kebab.jpg")
MUMBAI_TAXI = DADAR
MUMBAI_AUTO = ANDHERI
CENTRAL_PARK = "https://ilovenavimumbai.com/wp-content/uploads/2025/12/Central-Park-Photos.webp"

# Name → unique, category-correct photo
BY_NAME: dict[str, str] = {
    "Gateway of India": GATEWAY,
    "Marine Drive Promenade": MARINE_DRIVE,
    "Marine Drive Queen's Necklace": MARINE_DRIVE,
    "Sanjay Gandhi National Park": SGNP_GATE,
    "Sanjay Gandhi National Park Gate": SGNP_GATE,
    "Kanheri Caves": KANHERI,
    "Bandra Fort & Sea Link Promenade": BANDRA_FORT,
    "Bandra Fort & Bandstand": BANDRA_FORT,
    "Global Vipassana Pagoda": PAGODA,
    "Gorai Beach & Pagoda Access": PAGODA,
    "Elephanta Caves Island": ELEPHANTA,
    "Haji Ali Dargah": HAJI_ALI,
    "CSMT World Heritage Terminus": CSMT,
    "Churchgate Station Precinct": CHURCHGATE,
    "Juhu Beach": JUHU,
    "Carter Road Promenade": BANDRA_NIGHT,
    "Vasai Fort": VASAI_FORT,
    "Aksa Beach": AKSA,
    "Mandapeshwar Caves": MANDAPESHWAR,
    "Upvan Lake & Yeoor Hills": UPVAN,
    "Central Park & Jewel of Navi Mumbai": CENTRAL_PARK,
    "Thakur College Campus (TCET / Thakur Village)": CENTRAL_PARK,
    "Kandivali Station Precinct": KANDIVALI,
    "Poinsur Gymkhana Grounds": UPVAN,
    "The Taj Mahal Palace": TAJ_PALACE,
    "Trident Hotel Nariman Point": HOTEL_OBERIO,
    "Taj Lands End": TAJ_LANDS_END,
    "The Orchid Hotel Mumbai Vile Parle": HOTEL_SUNNSAND,
    "IBIS Mumbai Goregaon": HOTEL_WESTIN,
    "The Fern Residency Goregaon": HOTEL_HYATT,
    "Hotel Sai Palace Grand Borivali": HOTEL_KUMKUM,
    "Ginger Mumbai Andheri": GINGER_ANDHERI,
    "The Residence Hotel & Apartments Borivali": HOTEL_DIPLOMAT,
    "Keys Select Hotel Nestor Mumbai": HOTEL_FOUR_SEASONS,
    "Hotel Metro Palace Kandivali": HOTEL_WESTEND,
    "Grand Sarovar Premiere Goregaon": HOTEL_ITC,
    "Leopold Cafe & Bar": LEOPOLD,
    "Bademiya Kebabs": FOOD_KEBAB,
    "Theobroma Churchgate": FOOD_LEOPOLD_IN,
    "Cannon Pav Bhaji": FOOD_PAV,
    "Elco Pani Puri Bandra": FOOD_PANI,
    "Carter Road Cafe Stretch": FOOD_SANDWICH,
    "Mahesh Lunch Home Juhu": FOOD_FISH,
    "Gokul Refreshment Borivali": FOOD_VADA2,
    "Thakur Village Food Street": FOOD_BHEL,
    "Aaswad Thakur Village": FOOD_MISAL,
    "Sheetal Restaurant Thakur Village": FOOD_THALI,
    "Mahavir Nagar Khau Galli": FOOD_VADA,
    "Bhagat Tarachand (Western Line)": FOOD_BIRYANI,
    "Jai Hind Lunch Home": FOOD_VADA4,
    "Prakash Dabeli Kandivali": FOOD_DABELI,
    "Candies Bandra": FOOD_VADA3,
    "Highway Gomantak": GROC_COLABA,
    "Virar Beach Shacks": GROC_FRUIT,
    "Nalasopara Station Lane Eats": GROC_CRAWFORD,
    "Bombay Hospital & Medical Research Centre": BOMBAY_HOSPITAL,
    "INS Asvini Naval Hospital": INHS_ASVINI,
    "Lilavati Hospital & Research Centre": LILAVATI,
    "Holy Family Hospital Bandra": HOLY_FAMILY,
    "Apex Hospitals Borivali": APEX_BORIVALI,
    "Karuna Hospital Borivali": KARUNA,
    "Bhaktivedanta Hospital Mira Road": BHAKTIVEDANTA,
    "Wockhardt Hospitals Mira Road": WOCKHARDT,
    "Thunga Hospital Malad": THUNGA,
    "Nanavati Max Super Speciality": NANAVATI,
    "Shatabdi Hospital Borivali East": JJ_HOSPITAL,
    "Oscar Hospital Kandivali": LILAVATI_2,
    "Namaha Hospital Kandivali": HINDUJA_KHAR,
    "Apex Super Speciality Kandivali": APEX_KANDIVALI,
    "Kokilaben Dhirubhai Ambani Hospital": HN_HOSPITAL,
    "Holy Spirit Hospital Andheri East": SAIFEE,
    "Cooper Hospital Juhu": TEJPAL,
    "Colaba Tourist Police Precinct": POLICE_HQ,
    "Azad Maidan Police Station (CST Area)": POLICE_MH,
    "Marine Drive Police Control": POLICE_HQ,
    "Bandra Police Station": POLICE_MH,
    "Andheri Police Station": POLICE_HQ,
    "Kandivali Police Station": POLICE_MH,
    "Borivali East Police Chowky": POLICE_HQ,
    "Borivali Police Station": POLICE_MH,
    "Mira Road Police Station": POLICE_HQ,
    "Vasai Police Station": POLICE_MH,
    "Virar Police Station": POLICE_HQ,
    "Wellness Forever Churchgate": PHARM_PEARSON,
    "Wellness Forever 24x7 Chemist": PHARM_PEARSON_IN,
    "Apollo Pharmacy Fort / Churchgate": PHARM_APOLLO_BLR2,
    "Apollo Pharmacy 24 Hours": PHARM_APOLLO_LAB,
    "Wellness Forever Bandra": PHARM_CLOSED,
    "Apollo Pharmacy Andheri": PHARM_APOLLO_MIYAPUR,
    "Wellness Forever Kandivali / Thakur Village": PHARM_KERALA,
    "Apollo Pharmacy Kandivali East": PHARM_APOLLO_NAGPUR,
    "Wellness Forever Mahavir Nagar": PHARM_GANGTOK,
    "Wellness Forever Borivali": PHARM_GOA,
    "Apollo Pharmacy Borivali": PHARM_APOLLO_BLR,
    "Wellness Forever Malad": PHARM_THUNGA,
    "Apollo Pharmacy Virar": PHARM_GOA2,
    "DMart Infiniti Mall Malad": INFINITI_MALAD,
    "DMart Borivali": DMART_KALAMBOLI,
    "Star Bazaar Kandivali": GROC_MUMBAI,
    "Reliance Smart Kandivali East": DMART_CART,
    "DMart Kandivali West": DMART,
    "Reliance Smart Bandra": DMART_GANGURU,
    "Nature's Basket Churchgate / South": GROC_VEG_MUMBAI,
    "DMart Mira Road": DMART_TIRUPATI,
    "Local kirana — Thakur Village": GROC_KIRANA,
    "Churchgate–Nariman Point office grid": CHURCHGATE,
    "Marine Drive promenade": MARINE_DRIVE,
    "Dadar station concourse & FOB": DADAR,
    "Bandra Bandstand & Carter Road": BANDRA_FORT,
    "Bandra station west exit": BANDRA_NIGHT,
    "Andheri station & west subway": ANDHERI,
    "Goregaon–Malad WEH service road": ANDHERI,
    "Thakur Village / Thakur College campus": CENTRAL_PARK,
    "Kandivali station east-west skywalk": KANDIVALI,
    "Borivali station auto stand": BORIVALI,
    "SGNP Borivali gate approach": SGNP_GATE,
    "Mira Road–Bhayandar creek belt": VIRAR,
    "Vasai Road station precinct": VASAI_FORT,
    "Virar station last-mile": VIRAR,
    "Andheri (West & East)": ANDHERI,
    "Kandivali (West & East)": KANDIVALI,
    "Ghatkopar (East & West)": CSMT,
    "Kurla (West & East)": DADAR,
    "Nallasopara (West & East)": VIRAR,
    "Growel's 101 Mall": INFINITI_MALAD,
    "Raghuleela Mega Mall Kandivali": INFINITI_MALAD_2,
    "Infiniti Mall Malad": INFINITI_MALAD,
    "Inorbit Mall Malad": INFINITI_MALAD_2,
    "Oberoi Mall Goregaon": INFINITI_MALAD,
    "Mega Mall Oshiwara": INFINITI_MALAD_2,
    "Fun Republic Andheri": INFINITI_MALAD,
    "Moksh Plaza Borivali": INFINITI_MALAD_2,
    "Maxus Mall Bhayandar": INFINITI_MALAD,
    "Timezone Infiniti Mall Malad": INFINITI_MALAD_2,
    "GameZone Growel's 101": INFINITI_MALAD,
    "Smaaash Andheri": INFINITI_MALAD_2,
    "Smaaash Malad": INFINITI_MALAD,
    "Players Adda Thakur Village": GROC_KIRANA,
    "Mount Mary Church Bandra": BANDRA_FORT,
    "ISKCON Juhu": JUHU,
    "Siddhivinayak Temple Dadar": DADAR,
    "Gilbert Hill Andheri": ANDHERI,
    "Mahakali Caves Andheri": MANDAPESHWAR,
    "Versova Beach": JUHU,
    "EsselWorld & Water Kingdom": PAGODA,
    "Film City Goregaon": CENTRAL_PARK,
    "Chhota Kashmir Aarey": UPVAN,
    "Linking Road Bandra": BANDRA_NIGHT,
    "Mahim Dargah": HAJI_ALI,
    "SevenHills Hospital Andheri East": HN_HOSPITAL,
    "BSES MG Hospital Andheri": HOLY_FAMILY,
    "Suchak Hospital Malad": THUNGA,
    "SRV Hospital Goregaon": NANAVATI,
    "Lotus Multispeciality Mira Road": BHAKTIVEDANTA,
    "Dadar Police Station": POLICE_MH,
    "Khar Police Station": POLICE_HQ,
    "Santacruz Police Station": POLICE_MH,
    "Vile Parle Police Station": POLICE_HQ,
    "Goregaon Police Station": POLICE_MH,
    "Malad Police Station": POLICE_HQ,
    "Dahisar Police Station": POLICE_MH,
    "Bhayandar Police Station": POLICE_HQ,
    "Nalasopara Police Station": POLICE_MH,
    "Jogeshwari Police Station": POLICE_HQ,
}

def apply_place_images(db) -> int:
    """Overwrite mock Unsplash URLs with authentic photos for known place names."""
    from app.models.content import Attraction, Hotel, FoodSpot, EmergencyServiceItem, LocalScam, MMRArea
    from app.models.safety import DangerZone, CrimeReport, NewsItem

    updated = 0
    pairs = [
        (Attraction, "name"),
        (Hotel, "name"),
        (FoodSpot, "name"),
        (EmergencyServiceItem, "name"),
        (LocalScam, "title"),
        (DangerZone, "name"),
        (NewsItem, "title"),
        (MMRArea, "name"),
    ]
    for model, field in pairs:
        for row in db.query(model).all():
            key = getattr(row, field, None)
            url = BY_NAME.get(key)
            if not url and is_mock(getattr(row, "image", None)):
                url = GATEWAY
            if url and getattr(row, "image", None) != url:
                row.image = url
                updated += 1
    for row in db.query(CrimeReport).all():
        url = BY_NAME.get(row.location_label) or BY_NAME.get(row.crime_type)
        if not url:
            if row.latitude and row.latitude > 19.2:
                url = BORIVALI
            elif row.latitude and row.latitude > 19.05:
                url = ANDHERI
            else:
                url = CSMT
        if url and row.image != url:
            row.image = url
            updated += 1
    return updated
