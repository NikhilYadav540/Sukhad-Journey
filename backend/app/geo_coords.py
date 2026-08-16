"""Known lat/lng for catalogue rows so Analyze this area can compute distances."""
from sqlalchemy.orm import Session

from app.models.content import Attraction, EmergencyServiceItem, FoodSpot, Hotel
from app.place_images import BOMBAY_HOSPITAL, PHARM_KERALA, GROC_KIRANA, POLICE_HQ

IMG_HOSP = BOMBAY_HOSPITAL
IMG_PHARM = PHARM_KERALA
IMG_GROC = GROC_KIRANA
IMG_POLICE = POLICE_HQ

PLACE_COORDS: dict[str, tuple[float, float]] = {
    # Attractions
    "Churchgate Station Precinct": (18.9322, 72.8264),
    "Marine Drive Queen's Necklace": (18.9432, 72.8236),
    "Marine Drive Promenade": (18.9432, 72.8236),
    "Bandra Fort & Bandstand": (19.0428, 72.8190),
    "Bandra Fort & Sea Link Promenade": (19.0428, 72.8190),
    "Juhu Beach": (19.0988, 72.8263),
    "Sanjay Gandhi National Park Gate": (19.2300, 72.8680),
    "Sanjay Gandhi National Park": (19.2300, 72.8680),
    "Kanheri Caves": (19.2080, 72.9060),
    "Thakur College Campus (TCET / Thakur Village)": (19.21407, 72.8648),
    "Mandapeshwar Caves": (19.2320, 72.8470),
    "Gorai Beach & Pagoda Access": (19.2280, 72.8050),
    "Global Vipassana Pagoda": (19.2280, 72.8050),
    "Vasai Fort": (19.3300, 72.8150),
    "Aksa Beach": (19.1760, 72.7950),
    "Carter Road Promenade": (19.0660, 72.8230),
    "Gateway of India": (18.9220, 72.8347),
    "Elephanta Caves Island": (18.9630, 72.9310),
    "Haji Ali Dargah": (18.9827, 72.8089),
    "CSMT World Heritage Terminus": (18.9400, 72.8354),
    "Upvan Lake & Yeoor Hills": (19.2300, 72.9670),
    "Central Park & Jewel of Navi Mumbai": (19.0330, 73.0290),
    # Hotels
    "Trident Hotel Nariman Point": (18.9260, 72.8220),
    "The Taj Mahal Palace": (18.9216, 72.8331),
    "Taj Lands End": (19.0430, 72.8190),
    "The Orchid Hotel Mumbai Vile Parle": (19.0960, 72.8470),
    "IBIS Mumbai Goregaon": (19.1660, 72.8500),
    "The Fern Residency Goregaon": (19.1650, 72.8600),
    "Hotel Sai Palace Grand Borivali": (19.2310, 72.8550),
    "Ginger Mumbai Andheri": (19.1190, 72.8470),
    "The Residence Hotel & Apartments Borivali": (19.2290, 72.8570),
    "Keys Select Hotel Nestor Mumbai": (19.1170, 72.8690),
    # Food
    "Theobroma Churchgate": (18.9340, 72.8270),
    "Cannon Pav Bhaji": (18.9350, 72.8320),
    "Elco Pani Puri Bandra": (19.0550, 72.8300),
    "Carter Road Cafe Stretch": (19.0660, 72.8230),
    "Mahesh Lunch Home Juhu": (19.1070, 72.8260),
    "Gokul Refreshment Borivali": (19.2310, 72.8550),
    "Thakur Village Food Street": (19.2130, 72.8660),
    "Mahavir Nagar Khau Galli": (19.2040, 72.8420),
    "Bhagat Tarachand (Western Line)": (19.2180, 72.8480),
    "Jai Hind Lunch Home": (19.2100, 72.8480),
    "Prakash Dabeli Kandivali": (19.2040, 72.8470),
    "Candies Bandra": (19.0680, 72.8290),
    "Highway Gomantak": (19.1400, 72.8550),
    "Virar Beach Shacks": (19.4550, 72.7950),
    "Nalasopara Station Lane Eats": (19.4150, 72.8170),
    "Leopold Cafe & Bar": (18.9210, 72.8320),
    "Bademiya Kebabs": (18.9220, 72.8320),
    # Hospitals
    "Bombay Hospital & Medical Research Centre": (18.9410, 72.8280),
    "Lilavati Hospital & Research Centre": (19.0510, 72.8290),
    "Holy Family Hospital Bandra": (19.0550, 72.8310),
    "Apex Hospitals Borivali": (19.2320, 72.8480),
    "Karuna Hospital Borivali": (19.2290, 72.8680),
    "Bhaktivedanta Hospital Mira Road": (19.2810, 72.8760),
    "Wockhardt Hospitals Mira Road": (19.2850, 72.8710),
    "Thunga Hospital Malad": (19.1860, 72.8490),
    "Nanavati Max Super Speciality": (19.0960, 72.8400),
    "INS Asvini Naval Hospital": (18.9150, 72.8150),
    # Police
    "Colaba Tourist Police Precinct": (18.9150, 72.8320),
    "Marine Drive Police Control": (18.9430, 72.8240),
    "Bandra Police Station": (19.0550, 72.8400),
    "Andheri Police Station": (19.1190, 72.8440),
    "Kandivali Police Station": (19.2040, 72.8580),
    "Borivali Police Station": (19.2310, 72.8560),
    "Mira Road Police Station": (19.2810, 72.8760),
    "Vasai Police Station": (19.3610, 72.8130),
    "Virar Police Station": (19.4560, 72.8110),
    "Azad Maidan Police Station (CST Area)": (18.9400, 72.8330),
    # Pharmacies
    "Wellness Forever Churchgate": (18.9330, 72.8270),
    "Apollo Pharmacy Fort / Churchgate": (18.9350, 72.8360),
    "Wellness Forever Bandra": (19.0550, 72.8300),
    "Apollo Pharmacy Andheri": (19.1190, 72.8460),
    "Wellness Forever Kandivali / Thakur Village": (19.2140, 72.8660),
    "Wellness Forever Borivali": (19.2310, 72.8560),
    "Apollo Pharmacy Virar": (19.4560, 72.8110),
    "Wellness Forever 24x7 Chemist": (18.9330, 72.8270),
    "Apollo Pharmacy 24 Hours": (18.9350, 72.8360),
    # Grocery
    "DMart Infiniti Mall Malad": (19.1860, 72.8350),
    "DMart Borivali": (19.2300, 72.8480),
    "Star Bazaar Kandivali": (19.2100, 72.8600),
    "Reliance Smart Bandra": (19.0550, 72.8400),
    "Nature's Basket Churchgate / South": (18.9330, 72.8270),
    "DMart Mira Road": (19.2810, 72.8750),
    "Local kirana — Thakur Village": (19.2140, 72.8650),
    "Shatabdi Hospital Borivali East": (19.2265, 72.8612),
    "Oscar Hospital Kandivali": (19.2042, 72.8418),
    "Namaha Hospital Kandivali": (19.2088, 72.8375),
    "Apex Super Speciality Kandivali": (19.2034, 72.8310),
    "Kokilaben Dhirubhai Ambani Hospital": (19.1302, 72.8254),
    "Holy Spirit Hospital Andheri East": (19.1148, 72.8682),
    "Cooper Hospital Juhu": (19.1074, 72.8378),
    "Borivali East Police Chowky": (19.2248, 72.8675),
    "Apollo Pharmacy Kandivali East": (19.2112, 72.8658),
    "Wellness Forever Mahavir Nagar": (19.2038, 72.8422),
    "Apollo Pharmacy Borivali": (19.2304, 72.8552),
    "Wellness Forever Malad": (19.1865, 72.8488),
    "DMart Kandivali West": (19.2028, 72.8412),
    "Reliance Smart Kandivali East": (19.2110, 72.8646),
    "Hotel Metro Palace Kandivali": (19.2056, 72.8522),
    "Grand Sarovar Premiere Goregaon": (19.1662, 72.8494),
    "Aaswad Thakur Village": (19.2136, 72.8654),
    "Sheetal Restaurant Thakur Village": (19.2144, 72.8661),
    "Kandivali Station Precinct": (19.2045, 72.8513),
    "Poinsur Gymkhana Grounds": (19.2188, 72.8526),
}

from app.western_line_extra import COORDS as EXTRA_COORDS
PLACE_COORDS.update(EXTRA_COORDS)

ICON_IMAGES = {
    "hospital": IMG_HOSP,
    "pill": IMG_PHARM,
    "grocery": IMG_GROC,
    "siren": IMG_POLICE,
}


def apply_coordinates(db: Session) -> int:
    """Fill missing latitude/longitude (and emergency photos) from the known map."""
    updated = 0
    for model in (Attraction, Hotel, FoodSpot, EmergencyServiceItem):
        for row in db.query(model).all():
            coords = PLACE_COORDS.get(row.name)
            if coords and (row.latitude is None or row.longitude is None):
                row.latitude, row.longitude = coords
                updated += 1
            if model is EmergencyServiceItem and not row.image:
                icon = ""
                if row.category_ref is not None:
                    icon = (row.category_ref.icon_key or "").lower()
                row.image = ICON_IMAGES.get(icon)
                if row.image:
                    updated += 1
    if updated:
        db.commit()
    return updated
