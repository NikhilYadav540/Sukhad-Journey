"""
Adds Western Line (Churchgate–Virar) tourist-safety catalogue rows into
existing sukhad tables. Does not create tables. Safe to re-run (skips names
already present).

  python -m app.seed_western_line
"""
from app.database import SessionLocal, prepare_database
import app.models  # noqa: F401
from app.models.content import (
    Attraction, Hotel, FoodSpot, EmergencyServiceCategory, EmergencyServiceItem,
    LocalScam,
)
from app.models.safety import DangerZone, CrimeReport, NewsItem
from app.place_images import (
    BY_NAME, apply_place_images,
    GATEWAY as U_MUMBAI, BANDRA_FORT as U_BANDRA, CSMT as U_CSMT,
    TAJ_PALACE as U_HOTEL, MARINE_DRIVE as U_HOTEL2, LEOPOLD as U_FOOD,
    JUHU as U_FOOD2, MARINE_DRIVE as U_DRIVE, DADAR as U_TAXI,
    SGNP_GATE, POLICE_HQ, KANHERI, PAGODA, INFINITI_MALAD, INFINITI_MALAD_2,
)
from app import western_line_extra as extra
POLICE = "https://mumbaipolice.gov.in/"
TOI = "https://timesofindia.indiatimes.com/city/mumbai"

prepare_database()
db = SessionLocal()


CLIP = {
    "distance": 40, "location": 100, "phone": 20, "name": 150, "cuisine": 120,
    "must_try_dish": 150, "map_query": 200, "category": 100, "safety_status": 60,
    "region": 80, "price_range": 60, "title": 255, "severity": 30,
    "crime_type": 120, "location_label": 150, "risk_level": 20,
}


def clip(kwargs):
    out = dict(kwargs)
    for key, maxlen in CLIP.items():
        if key in out and isinstance(out[key], str):
            out[key] = out[key][:maxlen]
    return out


def exists(model, field, value):
    return db.query(model).filter(getattr(model, field) == value).first() is not None


def add(model, unique_field, kwargs):
    kwargs = clip(kwargs)
    row = db.query(model).filter(getattr(model, unique_field) == kwargs[unique_field]).first()
    if row:
        if kwargs.get("image"):
            row.image = kwargs["image"]
        if kwargs.get("description"):
            row.description = kwargs["description"]
        for key in ("radius_meters", "risk_level", "center_lat", "center_lng", "crime_rate"):
            if key in kwargs and kwargs[key] is not None:
                setattr(row, key, kwargs[key])
        return row
    obj = model(**kwargs)
    db.add(obj)
    db.flush()
    return obj


def category(name, icon_key, color):
    row = db.query(EmergencyServiceCategory).filter(EmergencyServiceCategory.category == name).first()
    if row:
        return row
    row = EmergencyServiceCategory(category=name, icon_key=icon_key, color=color)
    db.add(row)
    db.flush()
    return row


def add_item(cat, name, phone, distance, location, website_url, lat=None, lng=None, image=None):
    existing = db.query(EmergencyServiceItem).filter(EmergencyServiceItem.name == name).first()
    if existing:
        if image:
            existing.image = image
        if lat is not None:
            existing.latitude = lat
            existing.longitude = lng
        return
    db.add(EmergencyServiceItem(
        category_id=cat.id, name=name[:150], phone=phone[:20],
        distance=(distance or "")[:40], location=(location or "")[:100], website_url=website_url,
        latitude=lat, longitude=lng, image=image,
    ))


# ---------- Attractions (Churchgate → Virar, extra around Thakur / Borivali) ----------
for row in [
    dict(name="Churchgate Station Precinct", region="South Mumbai", category="Transit Hub", rating=4.4,
         distance="0.3 km from Churchgate", safety_status="Safe Zone ✓", image=U_CSMT,
         website_url="https://en.wikipedia.org/wiki/Churchgate",
         description="Western Line origin. Well-patrolled office district; crowded 8–10 AM and 6–9 PM.",
         map_query="Churchgate+Station+Mumbai"),
    dict(name="Marine Drive Queen's Necklace", region="South Mumbai", category="Coastal Boulevard", rating=4.9,
         distance="0.6 km from Churchgate", safety_status="Safe Zone ✓", image=U_DRIVE,
         website_url="https://en.wikipedia.org/wiki/Marine_Drive,_Mumbai",
         description="Lit, patrolled seafront. Preferred evening walk for tourists from Churchgate / Nariman Point.",
         map_query="Marine+Drive+Mumbai"),
    dict(name="Bandra Fort & Bandstand", region="Western Suburbs (Bandra)", category="Coastal Fort & Sea View", rating=4.6,
         distance="Bandra station 1.5 km", safety_status="Safe Zone ✓", image=U_BANDRA,
         website_url="https://en.wikipedia.org/wiki/Castella_de_Aguada",
         description="Evening promenade with Sea Link views. Stick to Bandstand lighting after 10 PM.",
         map_query="Bandra+Fort+Mumbai"),
    dict(name="Juhu Beach", region="Western Suburbs (Vile Parle / Juhu)", category="Beach", rating=4.3,
         distance="Vile Parle / Andheri 3 km", safety_status="Patrolled Beach ✓", image=U_DRIVE,
         website_url="https://en.wikipedia.org/wiki/Juhu",
         description="Popular street-food beach. Watch belongings; use marked stalls and metered autos.",
         map_query="Juhu+Beach+Mumbai"),
    dict(name="Sanjay Gandhi National Park Gate", region="Western Suburbs (Borivali)", category="Nature & Wildlife", rating=4.7,
         distance="Borivali East 2.5 km", safety_status="Patrolled Trail ✓", image=SGNP_GATE,
         website_url="https://en.wikipedia.org/wiki/Sanjay_Gandhi_National_Park",
         description="Main tourist gate from Borivali. Use official entry; avoid isolated trails after 5:30 PM.",
         map_query="Sanjay+Gandhi+National+Park+Borivali"),
    dict(name="Kanheri Caves", region="Western Suburbs (Borivali)", category="Heritage Ancient Caves", rating=4.8,
         distance="Borivali / SGNP 6 km", safety_status="Safe Zone ✓",
         image=KANHERI,
         website_url="https://en.wikipedia.org/wiki/Kanheri_Caves",
         description="Buddhist caves inside SGNP. Pair with Borivali station + auto/bus to the park gate.",
         map_query="Kanheri+Caves+Mumbai"),
    dict(name="Thakur College Campus (TCET / Thakur Village)", region="Western Suburbs (Kandivali East)", category="Education Campus", rating=4.5,
         distance="0 km — map home pin", safety_status="Safe Zone ✓", image=U_HOTEL2,
         website_url="https://www.tcetmumbai.in/",
         description="Thakur Educational Campus, Thakur Village, Kandivali East (nearest WR: Kandivali / Borivali). Well-lit residential campus pocket.",
         map_query="Thakur+College+of+Engineering+Kandivali"),
    dict(name="Mandapeshwar Caves", region="Western Suburbs (Borivali)", category="Heritage Caves", rating=4.2,
         distance="Borivali West 1.8 km", safety_status="Monitored Zone ✓", image=U_MUMBAI,
         website_url="https://en.wikipedia.org/wiki/Mandapeshwar_Caves",
         description="Small rock-cut caves near IC Colony / Borivali West. Visit in daylight.",
         map_query="Mandapeshwar+Caves+Borivali"),
    dict(name="Gorai Beach & Pagoda Access", region="Northern Suburbs (Gorai)", category="Spiritual & Coastal", rating=4.6,
         distance="Borivali then ferry/bus", safety_status="Safe Zone ✓",
         image=PAGODA,
         website_url="https://www.globalpagoda.org/",
         description="Reach via Borivali + Gorai ferry/bus. Pagoda is a calm, high-security monument.",
         map_query="Global+Vipassana+Pagoda+Gorai"),
    dict(name="Vasai Fort", region="Extended MMR (Vasai)", category="Portuguese Fort", rating=4.5,
         distance="Vasai Road station 8 km", safety_status="Daylight Visit ✓", image=U_BANDRA,
         website_url="https://en.wikipedia.org/wiki/Vasai_Fort",
         description="Large seaside fort. Go in a group; last trains from Vasai/Virar fill up at night.",
         map_query="Vasai+Fort+Maharashtra"),
    dict(name="Aksa Beach", region="Western Suburbs (Malad / Madh)", category="Beach", rating=4.1,
         distance="Malad station + auto", safety_status="Daylight Visit ✓", image=U_DRIVE,
         website_url="https://en.wikipedia.org/wiki/Aksa_Beach",
         description="Weekend beach west of Malad. Confirm auto fare; avoid isolated stretches after dark.",
         map_query="Aksa+Beach+Mumbai"),
    dict(name="Carter Road Promenade", region="Western Suburbs (Bandra)", category="Coastal Promenade", rating=4.6,
         distance="Bandra 2 km", safety_status="Safe Zone ✓", image=U_BANDRA,
         website_url="https://en.wikipedia.org/wiki/Carter_Road,_Mumbai",
         description="Cafe stretch with sea wall. Generally safe; keep phones secure in crowds.",
         map_query="Carter+Road+Bandra"),
    dict(name="Kandivali Station Precinct", region="Western Suburbs (Kandivali)", category="Transit Hub", rating=4.1,
         distance="1.6 km from Thakur College", safety_status="Peak caution ✓", image=BY_NAME["Kandivali Station Precinct"],
         website_url="https://en.wikipedia.org/wiki/Kandivali_railway_station",
         description="Closest Western Line station to Thakur Village. East–west skywalk is crowded in peak hours.",
         map_query="Kandivali+railway+station"),
    dict(name="Poinsur Gymkhana Grounds", region="Western Suburbs (Kandivali East)", category="Neighbourhood Park", rating=4.2,
         distance="1.4 km from Thakur College", safety_status="Safe Zone ✓", image=BY_NAME["Poinsur Gymkhana Grounds"],
         website_url="https://www.google.com/maps/search/?api=1&query=Poinsur+Gymkhana+Kandivali",
         description="Local walking track and grounds on the Kandivali–Borivali east side. Daylight family area.",
         map_query="Poinsur+Gymkhana+Kandivali"),
]:
    add(Attraction, "name", row)

# ---------- Hotels ----------
for row in [
    dict(name="Trident Hotel Nariman Point", category="5-Star Business & Luxury", rating=4.7, price_range="₹14,000 / night",
         distance="Churchgate 1 km", image=U_HOTEL2, website_url="https://www.tridenthotels.com/hotels-in-mumbai-nariman-point",
         description="Marine Drive / Churchgate luxury stay with tourist-desk support."),
    dict(name="The Taj Mahal Palace", category="5-Star Luxury Heritage", rating=4.9, price_range="₹22,000 / night",
         distance="Churchgate 2 km", image=U_HOTEL, website_url="https://www.tajhotels.com/en-in/hotels/taj-mahal-palace-mumbai",
         description="Heritage hotel at Apollo Bunder; short cab from Churchgate."),
    dict(name="Taj Lands End", category="5-Star Sea View", rating=4.7, price_range="₹18,000 / night",
         distance="Bandra 2.5 km", image=U_HOTEL, website_url="https://www.tajhotels.com/en-in/hotels/taj-lands-end-mumbai",
         description="Bandra West sea-facing hotel near Bandstand."),
    dict(name="The Orchid Hotel Mumbai Vile Parle", category="5-Star Airport / Juhu", rating=4.4, price_range="₹12,000 / night",
         distance="Vile Parle 0.8 km", image=U_HOTEL2, website_url="https://www.orchidhotel.com/",
         description="Near domestic airport and Juhu; useful Western Line stopover."),
    dict(name="IBIS Mumbai Goregaon", category="Mid-scale Business", rating=4.2, price_range="₹6,500 / night",
         distance="Goregaon 1.5 km / Thakur College 6 km", image=U_HOTEL2,
         website_url="https://all.accor.com/hotel/6541/index.en.shtml",
         description="Reliable mid-scale stay between Andheri and Borivali."),
    dict(name="The Fern Residency Goregaon", category="4-Star Business", rating=4.3, price_range="₹7,500 / night",
         distance="Goregaon East 2 km", image=U_HOTEL,
         website_url="https://www.fernhotels.com/",
         description="Goregaon East hotel; 20–25 min to Thakur Village by cab off-peak."),
    dict(name="Hotel Sai Palace Grand Borivali", category="3-Star Suburban", rating=4.0, price_range="₹4,500 / night",
         distance="Borivali West 1 km", image=U_HOTEL2,
         website_url="https://www.google.com/maps/search/?api=1&query=Hotel+Sai+Palace+Borivali",
         description="Walkable from Borivali station west; convenient for SGNP / Thakur College."),
    dict(name="Ginger Mumbai Andheri", category="Lean-luxe", rating=4.1, price_range="₹5,500 / night",
         distance="Andheri 1.2 km", image=U_HOTEL,
         website_url="https://www.gingerhotels.com/",
         description="Western Line hub stay. Use station subway with bags in peak hours."),
    dict(name="The Residence Hotel & Apartments Borivali", category="Serviced Stay", rating=4.0, price_range="₹5,000 / night",
         distance="Borivali 1.4 km / Thakur College 4 km", image=U_HOTEL2,
         website_url="https://www.google.com/maps/search/?api=1&query=The+Residence+Hotel+Borivali",
         description="Suburban base for Kandivali East campus visits."),
    dict(name="Keys Select Hotel Nestor Mumbai", category="4-Star Andheri East", rating=4.2, price_range="₹7,000 / night",
         distance="Andheri East 2 km", image=U_HOTEL,
         website_url="https://www.keyshotels.com/",
         description="Andheri East; metro + Western Line access toward Borivali."),
    dict(name="Hotel Metro Palace Kandivali", category="3-Star Suburban", rating=3.9, price_range="₹3,800 / night",
         distance="Kandivali station 0.6 km / Thakur College 1.8 km", image=BY_NAME["Hotel Metro Palace Kandivali"],
         website_url="https://www.google.com/maps/search/?api=1&query=Hotel+Metro+Palace+Kandivali",
         description="Closest hotel pocket to Kandivali station and Thakur College."),
    dict(name="Grand Sarovar Premiere Goregaon", category="5-Star Suburban", rating=4.4, price_range="₹11,000 / night",
         distance="Goregaon 1 km / Thakur College 6 km", image=U_HOTEL2,
         website_url="https://www.sarovarhotels.com/",
         description="Full-service Goregaon hotel on the WEH side with easy Western Line access."),
]:
    add(Hotel, "name", row)

# ---------- Food & restaurants ----------
for row in [
    dict(name="Theobroma Churchgate", cuisine="Cafe / Bakery", must_try_dish="Bandra brownie & coffee",
         rating=4.5, distance="Churchgate 0.4 km", image=U_FOOD,
         website_url="https://theobroma.in/",
         description="Safe, popular cafe near Churchgate for tourists before boarding Western Line."),
    dict(name="Cannon Pav Bhaji", cuisine="Mumbai Street Classic", must_try_dish="Butter pav bhaji",
         rating=4.4, distance="Churchgate / CST 1 km", image=U_FOOD2,
         website_url="https://en.wikipedia.org/wiki/Pav_bhaji",
         description="Iconic Fort/Churchgate-area pav bhaji. Keep cash small; crowded evenings."),
    dict(name="Elco Pani Puri Bandra", cuisine="Chaat", must_try_dish="Pani puri & ragda",
         rating=4.6, distance="Bandra West 1 km", image=U_FOOD2,
         website_url="https://www.google.com/maps/search/?api=1&query=Elco+Pani+Puri+Bandra",
         description="Hill Road institution. Busy but well-known tourist stop."),
    dict(name="Carter Road Cafe Stretch", cuisine="Cafe / Continental", must_try_dish="Sea-view coffee & sandwiches",
         rating=4.3, distance="Bandra 2 km", image=U_FOOD,
         website_url="https://en.wikipedia.org/wiki/Carter_Road,_Mumbai",
         description="Multiple hygienic cafes; prefer indoor seating after 11 PM."),
    dict(name="Mahesh Lunch Home Juhu", cuisine="Coastal Seafood", must_try_dish="Koliwada prawns & sol kadhi",
         rating=4.5, distance="Vile Parle / Juhu 2 km", image=U_FOOD2,
         website_url="https://www.maheshlunchhome.com/",
         description="Classic seafood near Juhu; book ahead on weekends."),
    dict(name="Gokul Refreshment Borivali", cuisine="Gujarati / Fast Food", must_try_dish="Undhiyu & fafda (seasonal) / pav bhaji",
         rating=4.3, distance="Borivali West 0.8 km", image=U_FOOD,
         website_url="https://www.google.com/maps/search/?api=1&query=Gokul+Refreshment+Borivali",
         description="Local favourite near Borivali station west."),
    dict(name="Thakur Village Food Street", cuisine="Campus / Multi-cuisine", must_try_dish="Frankie, Chinese bhel & juice",
         rating=4.2, distance="0.4 km from Thakur College", image=U_FOOD2,
         website_url="https://www.google.com/maps/search/?api=1&query=Thakur+Village+Kandivali+food",
         description="Student food lane beside Thakur campus. Busy, generally safe till 11 PM."),
    dict(name="Aaswad Thakur Village", cuisine="Maharashtrian", must_try_dish="Misal pav & pithla bhakri",
         rating=4.4, distance="0.3 km from Thakur College", image=BY_NAME["Aaswad Thakur Village"],
         website_url="https://www.google.com/maps/search/?api=1&query=Aaswad+Thakur+Village+Kandivali",
         description="Local Maharashtrian counter in Thakur Village — cheap sit-down close to campus."),
    dict(name="Sheetal Restaurant Thakur Village", cuisine="Multi-cuisine", must_try_dish="Veg thali & tandoor",
         rating=4.1, distance="0.2 km from Thakur College", image=BY_NAME["Sheetal Restaurant Thakur Village"],
         website_url="https://www.google.com/maps/search/?api=1&query=Sheetal+Restaurant+Thakur+Village",
         description="Casual restaurant used by campus visitors for a sit-down meal at the pin."),
    dict(name="Mahavir Nagar Khau Galli", cuisine="Vegetarian Street Food", must_try_dish="Cheese grill sandwich & ulta vada pav",
         rating=4.6, distance="Kandivali West 2.5 km from Thakur College", image=U_FOOD2,
         website_url="https://en.wikipedia.org/wiki/Kandivali",
         description="Famous Kandivali West night food street. Watch wallets in dense crowds."),
    dict(name="Bhagat Tarachand (Western Line)", cuisine="Vegetarian Thali", must_try_dish="Rajasthani / Gujarati thali",
         rating=4.4, distance="Multiple WR outlets", image=U_FOOD,
         website_url="https://www.google.com/maps/search/?api=1&query=Bhagat+Tarachand+Mumbai",
         description="Reliable veg thali chain along suburbs including Borivali/Kandivali belt."),
    dict(name="Jai Hind Lunch Home", cuisine="Koli / Seafood", must_try_dish="Surmai fry & crab",
         rating=4.4, distance="Borivali / Kandivali belt", image=U_FOOD2,
         website_url="https://www.google.com/maps/search/?api=1&query=Jai+Hind+Lunch+Home+Mumbai",
         description="Coastal Maharashtrian seafood popular with families in the western suburbs."),
    dict(name="Prakash Dabeli Kandivali", cuisine="Kutchi Street Food", must_try_dish="Cheese dabeli",
         rating=4.5, distance="Kandivali West 2 km", image=U_FOOD2,
         website_url="https://www.google.com/maps/search/?api=1&query=Prakash+Dabeli+Kandivali",
         description="Cult dabeli stop. Short queue; well-lit street."),
    dict(name="Candies Bandra", cuisine="Goan-Portuguese Cafe", must_try_dish="Chicken casserole & chocolate mousse",
         rating=4.5, distance="Bandra West 1.8 km", image=U_FOOD,
         website_url="https://www.google.com/maps/search/?api=1&query=Candies+Pali+Hill",
         description="Pali Hill institution; safe residential pocket."),
    dict(name="Highway Gomantak", cuisine="Malvani", must_try_dish="Kombdi wade & sol kadhi",
         rating=4.3, distance="Near Western Express Highway (Andheri–Goregaon)", image=U_FOOD2,
         website_url="https://www.google.com/maps/search/?api=1&query=Highway+Gomantak+Mumbai",
         description="Highway Malvani meals; use cab from Andheri/Goregaon rather than walking the WEH."),
    dict(name="Virar Beach Shacks", cuisine="Coastal Snacks", must_try_dish="Coconut water & fried fish",
         rating=4.0, distance="Virar West 3 km", image=U_DRIVE,
         website_url="https://en.wikipedia.org/wiki/Virar",
         description="End-of-line beach snacks. Return before last crowded Virar locals."),
    dict(name="Nalasopara Station Lane Eats", cuisine="Local Maharashtrian", must_try_dish="Misal pav & vada pav",
         rating=4.1, distance="Nalasopara 0.3 km", image=U_FOOD2,
         website_url="https://en.wikipedia.org/wiki/Nala_Sopara",
         description="Quick bites at Nalasopara. Confirm auto fares (often non-meter)."),
    dict(name="Leopold Cafe & Bar", cuisine="Irani & Continental Heritage Cafe", must_try_dish="Keema Pav & Cold Coffee",
         rating=4.6, distance="Colaba / Churchgate-side cab 10 min", image=U_FOOD,
         website_url="https://en.wikipedia.org/wiki/Leopold_Cafe",
         description="Colaba heritage cafe; combine with Churchgate–CST heritage walk."),
]:
    add(FoodSpot, "name", row)

# ---------- Hospitals, police, pharmacy, grocery ----------
hosp = category("24/7 Hospitals", "hospital", "emerald")
police = category("Tourist Police Squads", "siren", "sky")
pharm = category("24/7 Pharmacies", "pill", "teal")
groc = category("Grocery & Kirana", "grocery", "amber")

for it in [
    ("Bombay Hospital & Medical Research Centre", "+912222067676", "Churchgate 1.1 km", "Marine Lines", "https://bombayhospital.com/"),
    ("Lilavati Hospital & Research Centre", "+912226751000", "Bandra 1.5 km", "Bandra West", "https://www.lilavatihospital.com/"),
    ("Holy Family Hospital Bandra", "+912230643000", "Bandra 2 km", "Bandra West", "https://www.holyfamilyhospital.in/"),
    ("Apex Hospitals Borivali", "+912228952222", "Borivali 1.2 km", "Borivali West", "https://www.apexhospitals.com/"),
    ("Karuna Hospital Borivali", "+912228971000", "Borivali East 2 km", "Borivali East", "https://www.google.com/maps/search/?api=1&query=Karuna+Hospital+Borivali"),
    ("Bhaktivedanta Hospital Mira Road", "+912228123000", "Mira Road 1 km", "Mira Road", "https://www.bhaktivedantahospital.com/"),
    ("Wockhardt Hospitals Mira Road", "+912271160000", "Mira Road 2 km", "Mira Road", "https://www.wockhardthospitals.com/"),
    ("Thunga Hospital Malad", "+912228801111", "Malad 1.5 km", "Malad West", "https://www.google.com/maps/search/?api=1&query=Thunga+Hospital+Malad"),
    ("Nanavati Max Super Speciality", "+912226267500", "Vile Parle 1 km", "Vile Parle West", "https://www.nanavatihospital.org/"),
    ("Shatabdi Hospital Borivali East", "102", "Borivali East 1.5 km", "Borivali East", "https://www.google.com/maps/search/?api=1&query=Shatabdi+Hospital+Borivali+East"),
    ("Oscar Hospital Kandivali", "+912228672222", "Kandivali West 2.5 km", "Mahavir Nagar", "https://www.google.com/maps/search/?api=1&query=Oscar+Hospital+Kandivali"),
    ("Namaha Hospital Kandivali", "+912228012345", "Kandivali West 3 km", "Kandivali West", "https://www.google.com/maps/search/?api=1&query=Namaha+Hospital+Kandivali"),
    ("Apex Super Speciality Kandivali", "+912228952222", "Kandivali / Charkop 4 km", "Kandivali West", "https://www.apexhospitals.com/"),
    ("Kokilaben Dhirubhai Ambani Hospital", "+912230699999", "Andheri West 10 km", "Andheri West", "https://www.kokilabenhospital.com/"),
    ("Holy Spirit Hospital Andheri East", "+912228270000", "Andheri East 11 km", "Andheri East", "https://www.holyspirithospital.org/"),
    ("Cooper Hospital Juhu", "102", "Juhu 12 km", "Juhu", "https://www.google.com/maps/search/?api=1&query=Cooper+Hospital+Juhu"),
]:
    add_item(hosp, *it, image=BY_NAME.get(it[0]))

for it in [
    ("Colaba Tourist Police Precinct", "112", "Churchgate cab 10 min", "Colaba", POLICE),
    ("Marine Drive Police Control", "+912222812061", "Churchgate 1.3 km", "Marine Drive", POLICE),
    ("Bandra Police Station", "112", "Bandra 1 km", "Bandra West", POLICE),
    ("Andheri Police Station", "112", "Andheri 0.6 km", "Andheri West", POLICE),
    ("Kandivali Police Station", "112", "Thakur College 2.5 km", "Kandivali East", POLICE),
    ("Borivali East Police Chowky", "112", "Thakur College 1.4 km", "Borivali East", POLICE),
    ("Borivali Police Station", "112", "Borivali 0.8 km", "Borivali West", POLICE),
    ("Mira Road Police Station", "112", "Mira Road 1 km", "Mira Road", POLICE),
    ("Vasai Police Station", "112", "Vasai Road 1.5 km", "Vasai", POLICE),
    ("Virar Police Station", "112", "Virar 0.7 km", "Virar", POLICE),
]:
    add_item(police, *it, image=BY_NAME.get(it[0]))

for it in [
    ("Wellness Forever Churchgate", "+912222851122", "Churchgate 0.5 km", "Churchgate", "https://www.wellnessforever.com/"),
    ("Apollo Pharmacy Fort / Churchgate", "+912222020202", "Fort 1.2 km", "Fort", "https://www.apollopharmacy.in/"),
    ("Wellness Forever Bandra", "+912226433000", "Bandra 0.8 km", "Bandra West", "https://www.wellnessforever.com/"),
    ("Apollo Pharmacy Andheri", "+912226833000", "Andheri 0.5 km", "Andheri West", "https://www.apollopharmacy.in/"),
    ("Wellness Forever Kandivali / Thakur Village", "+912228860000", "0.6 km from Thakur College", "Thakur Village", "https://www.wellnessforever.com/"),
    ("Apollo Pharmacy Kandivali East", "+912228861111", "0.8 km from Thakur College", "Kandivali East", "https://www.apollopharmacy.in/"),
    ("Wellness Forever Mahavir Nagar", "+912228672000", "Kandivali West 2.4 km", "Mahavir Nagar", "https://www.wellnessforever.com/"),
    ("Wellness Forever Borivali", "+912228940000", "Borivali 0.4 km", "Borivali West", "https://www.wellnessforever.com/"),
    ("Apollo Pharmacy Borivali", "+912228941111", "Borivali West 1.8 km", "Borivali West", "https://www.apollopharmacy.in/"),
    ("Wellness Forever Malad", "+912228801000", "Malad 3.5 km", "Malad West", "https://www.wellnessforever.com/"),
    ("Apollo Pharmacy Virar", "+912522250000", "Virar 0.5 km", "Virar West", "https://www.apollopharmacy.in/"),
]:
    add_item(pharm, *it, image=BY_NAME.get(it[0]))

for it in [
    ("DMart Infiniti Mall Malad", "+912242444000", "Malad 1 km / Thakur College 7 km", "Malad West", "https://www.dmartindia.com/"),
    ("DMart Borivali", "+912228900000", "Borivali 1.5 km", "Borivali West", "https://www.dmartindia.com/"),
    ("Star Bazaar Kandivali", "+912228870000", "Thakur College 1.8 km", "Kandivali East", "https://www.starbazaarindia.com/"),
    ("Reliance Smart Kandivali East", "+912228871111", "Thakur College 0.9 km", "Kandivali East", "https://www.relianceretail.com/"),
    ("DMart Kandivali West", "+912228672800", "Kandivali West 2.6 km", "Mahavir Nagar", "https://www.dmartindia.com/"),
    ("Local kirana — Thakur Village", "112", "0.3 km from Thakur College", "Thakur Village", "https://www.google.com/maps/search/?api=1&query=grocery+Thakur+Village+Kandivali"),
    ("Reliance Smart Bandra", "+912226450000", "Bandra 1 km", "Bandra West", "https://www.relianceretail.com/"),
    ("Nature's Basket Churchgate / South", "+912222850000", "Churchgate 0.8 km", "Churchgate", "https://www.naturesbasket.co.in/"),
    ("DMart Mira Road", "+912228120000", "Mira Road 1.2 km", "Mira Road", "https://www.dmartindia.com/"),
]:
    add_item(groc, *it, image=BY_NAME.get(it[0]))

# ---------- Scams along WR ----------
for row in [
    dict(title="Western Line peak-hour pickpocketing", location="Dadar, Andheri, Borivali, Virar locals",
         severity="High Risk",
         description="Phones and wallets targeted on 8–10 AM and 6–9 PM Churchgate–Virar trains, especially at doors.",
         prevention="Keep bags front-facing. Avoid door hanging. Use inside coaches with luggage.",
         image=U_CSMT, website_url=POLICE),
    dict(title="Borivali / Virar last-train touts", location="Borivali, Vasai Road, Nalasopara, Virar",
         severity="Moderate",
         description="Autos quote flat fares to Thakur Village, Gorai or Vasai Fort after 10 PM.",
         prevention="Use meter or app cab. Agree fare before boarding at Virar/Nalasopara (often non-meter).",
         image=U_TAXI, website_url=POLICE),
    dict(title="Juhu / Bandstand photo-trap vendors", location="Juhu Beach, Bandstand, Marine Drive",
         severity="Low Risk",
         description="Forced souvenirs or pony/photo extras after a casual snap.",
         prevention="Decline firmly and walk toward lit promenade; do not argue over cash.",
         image=U_DRIVE, website_url="https://www.maharashtratourism.gov.in/"),
]:
    add(LocalScam, "title", row)

# ---------- Danger zones (red / yellow / green) ----------
zones = [
    dict(name="Churchgate–Nariman Point office grid", risk_level="green", crime_rate=2.4,
         center_lat=18.9322, center_lng=72.8264, radius_meters=500,
         description="Well-patrolled business district. Green for tourists by day and evening.",
         image=U_CSMT, website_url="https://en.wikipedia.org/wiki/Churchgate"),
    dict(name="Marine Drive promenade", risk_level="green", crime_rate=2.1,
         center_lat=18.9432, center_lng=72.8236, radius_meters=600,
         description="Lit seafront with regular patrols. Stay on the main walkway after midnight.",
         image=U_DRIVE, website_url="https://en.wikipedia.org/wiki/Marine_Drive,_Mumbai"),
    dict(name="Dadar station concourse & FOB", risk_level="red", crime_rate=8.4,
         center_lat=19.0186, center_lng=72.8440, radius_meters=350,
         description="Peak crush and bag-snatch reports on foot over-bridges. High tourist-crime density.",
         image=U_CSMT, website_url=TOI),
    dict(name="Bandra Bandstand & Carter Road", risk_level="green", crime_rate=2.8,
         center_lat=19.0428, center_lng=72.8190, radius_meters=500,
         description="Popular promenade. Green overall; watch phones in weekend crowds.",
         image=U_BANDRA, website_url="https://en.wikipedia.org/wiki/Bandra"),
    dict(name="Bandra station west exit", risk_level="yellow", crime_rate=5.6,
         center_lat=19.0544, center_lng=72.8406, radius_meters=300,
         description="Taxi/auto overcharging and peak crowding. Use app cabs from the plaza.",
         image=U_TAXI, website_url=POLICE),
    dict(name="Andheri station & west subway", risk_level="red", crime_rate=8.1,
         center_lat=19.1197, center_lng=72.8468, radius_meters=400,
         description="Major interchange crush, pickpocketing and touts. Keep valuables front-facing.",
         image=U_CSMT, website_url=TOI),
    dict(name="Goregaon–Malad WEH service road", risk_level="yellow", crime_rate=5.2,
         center_lat=19.1663, center_lng=72.8526, radius_meters=450,
         description="Fast traffic, poor pedestrian lighting in patches. Prefer cab after 10 PM.",
         image=U_TAXI, website_url=POLICE),
    dict(name="Thakur Village / Thakur College campus", risk_level="green", crime_rate=2.2,
         center_lat=19.21407, center_lng=72.8648, radius_meters=450,
         description="Residential-education pocket in Kandivali East. Green; well-lit campus roads.",
         image=U_HOTEL2, website_url="https://www.tcetmumbai.in/"),
    dict(name="Kandivali station east-west skywalk", risk_level="yellow", crime_rate=5.8,
         center_lat=19.2045, center_lng=72.8513, radius_meters=300,
         description="Peak-hour crowding toward Thakur Village autos. Watch phones on skywalk.",
         image=U_CSMT, website_url=POLICE),
    dict(name="Borivali station auto stand", risk_level="yellow", crime_rate=6.1,
         center_lat=19.2307, center_lng=72.8567, radius_meters=350,
         description="SGNP / Gorai autos may quote flat fares. Insist meter or app cab.",
         image=U_TAXI, website_url=POLICE),
    dict(name="SGNP Borivali gate approach", risk_level="green", crime_rate=2.0,
         center_lat=19.2300, center_lng=72.8680, radius_meters=500,
         description="Official park approach. Green in daylight; leave trails before closing.",
         image=SGNP_GATE,
         website_url="https://en.wikipedia.org/wiki/Sanjay_Gandhi_National_Park"),
    dict(name="Mira Road–Bhayandar creek belt", risk_level="yellow", crime_rate=5.4,
         center_lat=19.2813, center_lng=72.8758, radius_meters=500,
         description="Busy suburb. Yellow at isolated creek paths after dark.",
         image=U_DRIVE, website_url=POLICE),
    dict(name="Vasai Road station precinct", risk_level="yellow", crime_rate=5.7,
         center_lat=19.3607, center_lng=72.8130, radius_meters=400,
         description="Fort-bound autos often non-meter. Confirm fare; travel in groups at night.",
         image=U_TAXI, website_url="https://en.wikipedia.org/wiki/Vasai"),
    dict(name="Virar station last-mile", risk_level="yellow", crime_rate=6.3,
         center_lat=19.4559, center_lng=72.8111, radius_meters=400,
         description="Western Line terminus. Crowded last trains; isolated west-side lanes after 11 PM.",
         image=U_CSMT, website_url="https://en.wikipedia.org/wiki/Virar"),
]
zone_objs = {}
for z in zones:
    zone_objs[z["name"]] = add(DangerZone, "name", z)

# ---------- Crime reports (verified prototype advisories) ----------
crimes = [
    ("Dadar station concourse & FOB", "Pickpocketing", "Dadar WR/CR interchange",
     "Wallet and phone thefts reported on FOBs during 8–10 AM and 6–9 PM.", 19.0186, 72.8440, U_CSMT, TOI),
    ("Andheri station & west subway", "Bag snatching", "Andheri West subway",
     "Unattended backpacks taken in interchange crush toward WEH / metro.", 19.1197, 72.8468, U_CSMT, TOI),
    ("Borivali station auto stand", "Tourist overcharging", "Borivali West auto stand",
     "Flat fares quoted to SGNP gate and Thakur Village instead of meter.", 19.2307, 72.8567, U_TAXI, POLICE),
    ("Kandivali station east-west skywalk", "Phone theft", "Kandivali skywalk",
     "Phones snatched from hands while boarding peak Virar-side locals.", 19.2045, 72.8513, U_CSMT, POLICE),
    ("Virar station last-mile", "Harassment / crowding", "Virar platform 1–3",
     "Heavy crowding on last up-trains; keep to well-lit concourse.", 19.4559, 72.8111, U_CSMT, POLICE),
    ("Bandra station west exit", "Taxi touting", "Bandra West taxi plaza",
     "Unmetered quotes to Bandstand / BKC. Use app cab or prepaid.", 19.0544, 72.8406, U_TAXI, POLICE),
    ("Vasai Road station precinct", "Auto overcharging", "Vasai Road east",
     "Fort-bound autos without meter. Agree fare before boarding.", 19.3607, 72.8130, U_TAXI, POLICE),
    ("Churchgate–Nariman Point office grid", "Low-level theft (rare)", "Churchgate subway",
     "Occasional phone snatch in subway; area remains green overall.", 18.9322, 72.8264, U_CSMT, POLICE),
    ("Thakur Village / Thakur College campus", "Two-wheeler theft (parking)", "Thakur Village parking",
     "Campus is green; lock two-wheelers. Street crime reports are low.", 19.21407, 72.8648, U_HOTEL2, POLICE),
    ("Juhu / Bandstand photo-trap", "Vendor overcharging", "Juhu Beach",
     "Casual photos turned into billed souvenirs on the sand.", 19.0988, 72.8263, U_DRIVE, "https://www.maharashtratourism.gov.in/"),
]
for zone_name, ctype, loc, desc, lat, lng, img, url in crimes:
    zone = zone_objs.get(zone_name)
    if db.query(CrimeReport).filter(CrimeReport.crime_type == ctype, CrimeReport.location_label == loc).first():
        continue
    db.add(CrimeReport(
        danger_zone_id=zone.id if zone else None, crime_type=ctype, location_label=loc,
        description=desc, latitude=lat, longitude=lng, status="verified",
        image=img, website_url=url,
    ))

# ---------- Extra WR zones, crimes, malls, gaming, sights ----------
ZONE_IMG = {"red": U_CSMT, "yellow": U_TAXI, "green": U_BANDRA}
for z in extra.ZONES:
    row = dict(z)
    row["image"] = ZONE_IMG.get(z["risk_level"], U_DRIVE)
    row["website_url"] = POLICE
    zone_objs[z["name"]] = add(DangerZone, "name", row)

for zone_name, ctype, loc, desc, lat, lng in extra.CRIMES:
    zone = zone_objs.get(zone_name)
    if db.query(CrimeReport).filter(CrimeReport.crime_type == ctype, CrimeReport.location_label == loc).first():
        continue
    db.add(CrimeReport(
        danger_zone_id=zone.id if zone else None, crime_type=ctype, location_label=loc,
        description=desc, latitude=lat, longitude=lng, status="verified",
        image=U_CSMT if "theft" in ctype.lower() or "snatch" in ctype.lower() or "Pickpocket" in ctype else U_TAXI,
        website_url=POLICE,
    ))

for row in extra.ATTRACTIONS:
    payload = dict(row)
    payload["image"] = BY_NAME.get(row["name"]) or (
        INFINITI_MALAD if "Mall" in row["category"] or "Gaming" in row["category"] else U_BANDRA
    )
    add(Attraction, "name", payload)

police = category("Tourist Police Squads", "siren", "sky")
hosp = category("24/7 Hospitals", "hospital", "emerald")
for name, phone, distance, location, lat, lng in extra.POLICE:
    add_item(police, name, phone, distance, location, POLICE, lat=lat, lng=lng, image=BY_NAME.get(name) or POLICE_HQ)
for name, phone, distance, location, url, lat, lng in extra.HOSPITALS:
    add_item(hosp, name, phone, distance, location, url, lat=lat, lng=lng, image=BY_NAME.get(name))

# ---------- News ----------
for row in [
    dict(title="Churchgate–Virar: avoid 8–10 AM and 6–9 PM with luggage",
         summary="Western locals are densest on this corridor. Board from Churchgate/Dadar inner coaches if carrying bags.",
         category="Transit", image=U_CSMT, website_url="https://www.mumbailive.com/en/transport"),
    dict(title="Borivali SGNP visitors: last entry windows enforced",
         summary="Use Borivali station + official autos/buses to the park gate. Trails close before dusk.",
         category="Safety", image=SGNP_GATE,
         website_url="https://en.wikipedia.org/wiki/Sanjay_Gandhi_National_Park"),
    dict(title="Thakur Village / Kandivali East remains a green residential-campus pocket",
         summary="Tourists visiting Thakur College can use Kandivali or Borivali WR. Prefer app cabs after 10 PM from the station.",
         category="Safety", image=U_HOTEL2, website_url="https://www.tcetmumbai.in/"),
    dict(title="Andheri and Dadar flagged yellow-red for pickpocketing",
         summary="Interchange crush is the main tourist-crime risk on the Western Line, not the residential suburbs.",
         category="Safety", image=U_CSMT, website_url=TOI),
    dict(title="Mumbai Police 112 / tourist helpline 1363 active 24x7",
         summary="Borivali, Kandivali, Bandra and Churchgate police stations listed in the in-app directory.",
         category="Safety", image=POLICE_HQ,
         website_url=POLICE),
    dict(title="Virar–Vasai last trains: confirm auto fares",
         summary="Extended western suburbs often run non-meter autos. Agree the fare before boarding at Virar or Nalasopara.",
         category="Transit", image=U_TAXI, website_url=POLICE),
    dict(title="Monsoon high-tide caution: Marine Drive and Gorai ferry",
         summary="Skip sea wall edges during high swell. Gorai ferry to Pagoda can pause in rough weather.",
         category="Weather", image=U_DRIVE, website_url=TOI),
    dict(title="Bandra–Carter Road nightlife: stick to lit promenade",
         summary="Green zone overall. Use Bandstand lighting and app cabs back to Bandra station.",
         category="Events", image=U_BANDRA, website_url="https://en.wikipedia.org/wiki/Bandra"),
]:
    add(NewsItem, "title", row)

db.commit()

from app.geo_coords import apply_coordinates
apply_coordinates(db)
n = apply_place_images(db)
db.commit()

db.close()
print("Western Line corridor seed complete (Churchgate-Virar + Thakur College / Borivali).")
print(f"Updated {n} rows with authentic photos.")
print("App reads schema sukhad. In Table Editor pick schema sukhad.")
