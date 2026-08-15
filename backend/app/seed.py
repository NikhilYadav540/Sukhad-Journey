"""
Populates the database with the real content that used to live as hardcoded
arrays in the frontend (app/tourist/page.tsx, components/MMRAreaGuide.tsx).
Run with: python -m app.seed
"""
from passlib.context import CryptContext
from app.database import SessionLocal, Base, engine
import app.models  # noqa: F401 registers all models
from app.models.content import (
    Attraction, Hotel, FoodSpot, EmergencyServiceCategory, EmergencyServiceItem,
    LocalScam, PhraseCategory, Phrase, SmartItinerary, SmartItineraryTimeSlot,
    MMRArea, MMRAreaSpot, MMRAreaFood,
)
from app.models.reference import TrainLine, Station, StationOnLine
from app.models.police import PoliceOfficer

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# ---------- wipe existing seed-managed rows (idempotent re-seeding) ----------
for model in [
    Attraction, Hotel, FoodSpot, EmergencyServiceItem, EmergencyServiceCategory,
    LocalScam, Phrase, PhraseCategory, SmartItineraryTimeSlot, SmartItinerary,
    MMRAreaSpot, MMRAreaFood, MMRArea, StationOnLine, Station, TrainLine, PoliceOfficer,
]:
    db.query(model).delete()
db.commit()

# ================= ATTRACTIONS =================
attractions = [
    dict(name="Gateway of India", region="South Mumbai", category="Historical Monument", rating=4.8,
         distance="1.2 km", safety_status="Safe Zone ✓",
         image="https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80",
         description="Iconic 20th-century waterfront arch monument built overlooking the Arabian Sea.",
         map_query="Gateway+of+India+Mumbai"),
    dict(name="Marine Drive Promenade", region="South Mumbai", category="Coastal Boulevard", rating=4.9,
         distance="0.5 km", safety_status="Safe Zone ✓",
         image="https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80",
         description="3.6 km long arc-shaped boulevard along the coast, famous for Queen's Necklace night views.",
         map_query="Marine+Drive+Mumbai"),
    dict(name="Sanjay Gandhi National Park", region="Western Suburbs (Borivali)", category="Nature & Wildlife",
         rating=4.7, distance="22.5 km", safety_status="Patrolled Trail ✓",
         image="https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=800&q=80",
         description="Sprawling protected rainforest home to free-roaming leopards, flora, and scenic lakes.",
         map_query="Sanjay+Gandhi+National+Park+Borivali"),
    dict(name="Kanheri Caves", region="Western Suburbs (Borivali)", category="Heritage Ancient Caves", rating=4.8,
         distance="25.0 km", safety_status="Safe Zone ✓",
         image="https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=800&q=80",
         description="109 ancient Buddhist rock-cut monuments inside Sanjay Gandhi National Park.",
         map_query="Kanheri+Caves+Mumbai"),
    dict(name="Bandra Fort & Sea Link Promenade", region="Western Suburbs (Bandra)", category="Coastal Fort & Sea View",
         rating=4.6, distance="12.8 km", safety_status="Safe Zone ✓",
         image="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
         description="17th-century Portuguese fort offering stunning vistas of the iconic Rajiv Gandhi Sea Link.",
         map_query="Bandra+Fort+Mumbai"),
    dict(name="Global Vipassana Pagoda", region="Northern Suburbs (Gorai)", category="Spiritual Monument", rating=4.8,
         distance="32.0 km", safety_status="Safe Zone ✓",
         image="https://images.unsplash.com/photo-1609949279531-cf48d64bed89?auto=format&fit=crop&w=800&q=80",
         description="Massive golden dome meditation hall and peace monument built on the Gorai peninsula.",
         map_query="Global+Vipassana+Pagoda+Gorai"),
    dict(name="Elephanta Caves Island", region="MMR Harbor", category="UNESCO World Heritage Site", rating=4.7,
         distance="11.0 km (Ferry Ride)", safety_status="Patrolled Island ✓",
         image="https://images.unsplash.com/photo-1620802051782-725fa33f9232?auto=format&fit=crop&w=800&q=80",
         description="Rock-cut cave temples dedicated to Lord Shiva, accessible by boat from Gateway of India.",
         map_query="Elephanta+Caves+Mumbai"),
    dict(name="Haji Ali Dargah", region="South-Central Mumbai", category="Coastal Shrine", rating=4.7,
         distance="7.2 km", safety_status="Monitored Zone ✓",
         image="https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80",
         description="Historic 15th-century mosque and tomb situated on an islet connected by a narrow causeway.",
         map_query="Haji+Ali+Dargah+Mumbai"),
    dict(name="CSMT World Heritage Terminus", region="South Mumbai", category="Colonial Architecture", rating=4.9,
         distance="1.8 km", safety_status="High Security Zone ✓",
         image="https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=800&q=80",
         description="Victorian Gothic Revival architectural masterpiece and bustling central transport hub.",
         map_query="Chhatrapati+Shivaji+Maharaj+Terminus"),
    dict(name="Upvan Lake & Yeoor Hills", region="Thane MMR Zone", category="Scenic Nature Reserve", rating=4.6,
         distance="28.0 km", safety_status="Safe Zone ✓",
         image="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
         description="Serene lakeside garden nestled against the lush forest hills of Sanjay Gandhi National Park in Thane.",
         map_query="Upvan+Lake+Thane"),
    dict(name="Central Park & Jewel of Navi Mumbai", region="Navi Mumbai Zone", category="Urban Park & Botanical Garden",
         rating=4.6, distance="30.0 km", safety_status="Safe Zone ✓",
         image="https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80",
         description="Massive urban recreation park featuring landscaped lawns, amphitheaters, and walking trails.",
         map_query="Central+Park+Kharghar+Navi+Mumbai"),
]
for a in attractions:
    db.add(Attraction(**a))

# ================= HOTELS =================
hotels = [
    dict(name="The Taj Mahal Palace", category="5-Star Luxury Heritage", rating=4.9, price_range="₹22,000 / night",
         distance="0.8 km", description="World-famous heritage luxury hotel offering breathtaking views of the Gateway of India."),
    dict(name="Trident Hotel Nariman Point", category="5-Star Business & Luxury", rating=4.7, price_range="₹14,000 / night",
         distance="0.4 km", description="Located right on Marine Drive offering panoramic coastal ocean views."),
]
for h in hotels:
    db.add(Hotel(**h))

# ================= FOOD =================
food_spots = [
    dict(name="Leopold Cafe & Bar", cuisine="Irani & Continental Heritage Cafe", must_try_dish="Keema Pav & Cold Coffee",
         rating=4.6, distance="1.4 km",
         description="Legendary cafe operating since 1871. Featured in Shantaram; famous for its lively vintage ambience."),
    dict(name="Bademiya Kebabs", cuisine="Mughlai Street Food", must_try_dish="Chicken Baida Roti & Seekh Kebab",
         rating=4.5, distance="1.3 km",
         description="World-renowned late-night street food destination behind the Taj Mahal Palace."),
]
for f in food_spots:
    db.add(FoodSpot(**f))

# ================= EMERGENCY SERVICES =================
emergency_services = [
    dict(category="24/7 Hospitals", icon_key="hospital", color="emerald", items=[
        dict(name="Bombay Hospital & Medical Research Centre", phone="+912222067676", distance="1.1 km", location="Marine Lines"),
        dict(name="INS Asvini Naval Hospital", phone="+912222151661", distance="2.4 km", location="Colaba"),
        dict(name="Lilavati Hospital & Research Centre", phone="+912226751000", distance="14.2 km", location="Bandra West"),
    ]),
    dict(category="Tourist Police Squads", icon_key="siren", color="sky", items=[
        dict(name="Colaba Tourist Police Precinct", phone="112", distance="0.8 km", location="Colaba Causeway"),
        dict(name="Azad Maidan Police Station (CST Area)", phone="+912222620330", distance="2.1 km", location="Fort"),
        dict(name="Marine Drive Police Control", phone="+912222812061", distance="1.3 km", location="Marine Drive"),
    ]),
    dict(category="24/7 Pharmacies", icon_key="pill", color="teal", items=[
        dict(name="Wellness Forever 24x7 Chemist", phone="+912222851122", distance="0.5 km", location="Churchgate"),
        dict(name="Apollo Pharmacy 24 Hours", phone="+912222020202", distance="1.2 km", location="Fort"),
    ]),
]
for group in emergency_services:
    items = group.pop("items")
    cat = EmergencyServiceCategory(**group)
    db.add(cat)
    db.flush()
    for it in items:
        db.add(EmergencyServiceItem(category_id=cat.id, **it))

# ================= LOCAL SCAMS =================
scams = [
    dict(title="Tampered Auto/Taxi Meter Fraud", location="Airports, CSMT & Gateway of India", severity="High Risk",
         description="Drivers may claim the meter is broken or request flat exorbitant fares for short distances.",
         prevention="Insist on metered rate or use our built-in Cab & Auto Estimator to show standard tariff rates. Threaten to call 112 if refused."),
    dict(title="Fake Unregistered Guides", location="Gateway of India & Elephanta Caves", severity="Moderate",
         description="Touts wearing official-looking lanyards offer 'VIP entry' or private tours at 10x the price.",
         prevention="Ask for an official Ministry of Tourism ID card before accepting any guide services."),
    dict(title="Pigeon Feeding & Photo Traps", location="Gateway Plaza & Marine Drive", severity="Low Risk",
         description="Vendors force bird seeds into your hand for photos and demand large cash fees afterward.",
         prevention="Politely say 'No thank you' and walk away immediately without accepting feed bags."),
]
for s in scams:
    db.add(LocalScam(**s))

# ================= PHRASEBOOK =================
phrase_groups = [
    ("Bargaining & Transport", [
        ("Bhaiyya meter se chalo", "Brother, please go by meter rate", "Bhai-ya me-ter say cha-lo"),
        ("Kitna hua?", "How much does this cost?", "Kit-na hoo-aa?"),
        ("Thoda kam karo na", "Please lower the price a bit", "Tho-da kam ka-ro na"),
    ]),
    ("Emergency & Assistance", [
        ("Madad chahiye!", "I need help!", "Ma-dad cha-hi-ye!"),
        ("Hospital kaha hai?", "Where is the nearest hospital?", "Hos-pi-tal ka-haa hai?"),
        ("Mujhe police station jana hai", "I want to go to the police station", "Moo-jhe po-lice sta-tion ja-na hai"),
    ]),
    ("Food & Water Safety", [
        ("Thanda paani / Bottled paani", "Cold water / Sealed mineral water", "Bot-tled paa-nee"),
        ("Kam teekha banana", "Please make it less spicy", "Kam tee-kha ba-naa-na"),
    ]),
]
for category_name, phrases in phrase_groups:
    cat = PhraseCategory(category=category_name)
    db.add(cat)
    db.flush()
    for hindi, translation, phonetic in phrases:
        db.add(Phrase(category_id=cat.id, hindi=hindi, translation=translation, phonetic=phonetic))

# ================= SMART ITINERARIES =================
smart_itineraries = [
    dict(slug="1day-heritage", title="1-Day Heritage & Seafront Trail",
         subtitle="Covers iconic South Mumbai landmarks safely and efficiently", slots=[
             ("09:00 AM", "Gateway of India & Taj Mahal Palace", "Best light for photos, low crowd."),
             ("11:30 AM", "CSMT Station & Fort Colonial Walking Tour", "Stick to patrolled heritage walkways."),
             ("02:00 PM", "Lunch at Leopold Cafe or Britannia & Co.", "Heritage Parsi & Irani delicacies."),
             ("05:00 PM", "Sunset stroll along Marine Drive Promenade", "Well-lit and heavily patrolled tourist precinct."),
         ]),
    dict(slug="3day-ultimate", title="3-Day Ultimate Mumbai Explorer",
         subtitle="Complete cultural, shopping, and food immersion", slots=[
             ("Day 1", "South Mumbai Heritage & Gateway of India Boat Cruise", "Full day in South District."),
             ("Day 2", "Bandra Fort, Linking Road Shopping & Carter Road Promenade", "Trendy suburban experience."),
             ("Day 3", "Sanjay Gandhi National Park & Kanheri Caves Trail", "Nature & ancient Buddhist rock carvings."),
         ]),
]
for it in smart_itineraries:
    slots = it.pop("slots")
    itinerary = SmartItinerary(**it)
    db.add(itinerary)
    db.flush()
    for time_label, activity, note in slots:
        db.add(SmartItineraryTimeSlot(itinerary_id=itinerary.id, time_label=time_label, activity=activity, note=note))

# ================= MMR AREAS =================
mmr_areas = [
    dict(slug="andheri", name="Andheri (West & East)", region="Western Line", safety_score=92,
         safety_tag="High Security • Active Nightlife",
         vibe="Bustling transit hub, Bollywood studios, coastal sunsets & commercial centers.",
         transit_and_safety_tip="Major interchange hub connecting Metro Line 1 (Ghatkopar-Versova) with the Western Local Rail. Stay alert at Andheri Station during 8–10 AM & 6–9 PM peak hours.",
         spots=[
             ("Versova Beach & Promenade", "Coastal Spot", "Lesser-crowded coastal promenade famous for quiet sunset walks and trendy cafes.", "⭐ Highly Recommended for Sunsets"),
             ("Mahakali Caves (Kondivite)", "Heritage Site", "19 ancient rock-cut Buddhist caves dating back to the 1st century BCE in Andheri East.", "🏛️ Ancient Heritage Gem"),
             ("Lokhandwala Market", "Shopping Hub", "Famous vibrant open market for street fashion, footwear, and boutique shopping.", "🛍️ Top Shopping Spot"),
         ],
         food=[
             ("Versova Social & Cafe", "Seafood Bowls & Artisanal Coffee", "Cafe / Bistro"),
             ("Lokhandwala Khau Galli", "Frankies, Momos & Shawarma Stalls", "Street Food"),
         ]),
    dict(slug="kandivali", name="Kandivali (West & East)", region="Western Line", safety_score=95,
         safety_tag="Family Safe • Suburb Residential Hub",
         vibe="Family-friendly suburban haven, famous street food trails, and gateway to green parks.",
         transit_and_safety_tip="Auto-rickshaws strictly operate by official meter rates here. Very safe for late-night family walks around Mahavir Nagar.",
         spots=[
             ("Mahavir Nagar Khau Galli", "Food Street", "One of Mumbai's most iconic vegetarian street food nightlife streets.", "🔥 Must-Visit Food Hub"),
             ("Growel's 101 Mall (East)", "Shopping & Dining", "Neoclassical European-themed mall with family entertainment and dining.", "🛍️ Family Mall"),
         ],
         food=[
             ("Mahavir Nagar Food Lane", "Cheese Grill Sandwiches, Ulta Vada Pav & Fusion Dosas", "Street Food"),
             ("Bhagwati Fast Food", "Pav Bhaji & Falooda", "Late-Night Dining"),
         ]),
    dict(slug="ghatkopar", name="Ghatkopar (East & West)", region="Central Line", safety_score=91,
         safety_tag="Well-Patrolled • Central-East Hub",
         vibe="Culture-rich central junction, famous vegetarian cuisine, and mega shopping destinations.",
         transit_and_safety_tip="Ghatkopar is the terminal station for Metro Line 1 connecting directly to Western Suburbs (Andheri/Versova). Auto meters are standard.",
         spots=[
             ("R-City Mall (Ghatkopar West)", "Mega Mall", "One of the largest shopping malls in MMR with 300+ stores, indoor gaming, and multiplexes.", "⭐ Highly Recommended"),
             ("Ghatkopar Khau Galli (Vallabh Road)", "Food Street", "World-renowned street food strip famous for inventive vegetarian dishes.", "🥪 Legendary Eats"),
         ],
         food=[
             ("Ghatkopar Khau Galli", "Ice Cream Dosa, Remix Cheese Sandwiches & Dabeli", "Street Food"),
             ("Achija Fast Food", "Butter Pav Bhaji & Paneer Tikka", "Family Dining"),
         ]),
    dict(slug="kurla", name="Kurla (West & East)", region="Central Line", safety_score=84,
         safety_tag="High-Traffic Hub • Stay Vigilant",
         vibe="Massive commercial hub, major railway interchange, and premier luxury mall gateway.",
         transit_and_safety_tip="Kurla is a heavy interchange junction (Central + Harbour Lines). Watch belongings on platform bridges and use pre-booked cabs or meters outside Phoenix Marketcity.",
         spots=[
             ("Phoenix Marketcity (Kurla West)", "Luxury & Entertainment Mall", "Colossal multi-floor mall with international brands, concerts, and fine dining.", "💎 Premium Destination"),
             ("BKC Border Promenade", "Business District", "Adjacent to Bandra-Kurla Complex with landscaped walkways, art installations, and upscale bars.", "🏢 Modern Corporate Zone"),
         ],
         food=[
             ("Phoenix Marketcity Courtyard", "Global Cuisines, Craft Beers & Artisanal Desserts", "Fine Dining"),
             ("Kurla West Station Lane", "Seekh Kebabs & Mughlai Rolls", "Street Delicacy"),
         ]),
    dict(slug="nallasopara", name="Nallasopara (West & East)", region="Extended MMR", safety_score=82,
         safety_tag="Scenic Coastal Edge • Extended Zone",
         vibe="Historical Buddhist heritage, peaceful black-sand beaches, and budget coastal retreats.",
         transit_and_safety_tip="Auto-rickshaws operate on fixed rates (no meters). Confirm auto fares before boarding at Nallasopara Station. Plan return travel before 9:00 PM.",
         spots=[
             ("Kalamb Beach (Nallasopara West)", "Quiet Beach Retreat", "Serene, semi-black sand beach away from city crowds; ideal for peaceful ocean views.", "🏖️ Quiet Escape"),
             ("Ancient Nallasopara Stupa", "Historical Monument", "One of the oldest Buddhist stupas in Western India (Ashokan era archaeological site).", "📜 Ancient History"),
         ],
         food=[
             ("Kalamb Beach Stalls", "Fresh Coconut Water, Agri-Koli Fish Thali & Snacks", "Coastal Eateries"),
             ("Nirmal Naka Eateries", "Maharashtrian Misal Pav & Vadapav", "Local Snacks"),
         ]),
]
for area_data in mmr_areas:
    spots = area_data.pop("spots")
    food_items = area_data.pop("food")
    area = MMRArea(**area_data)
    db.add(area)
    db.flush()
    for title, type_, desc, highlight in spots:
        db.add(MMRAreaSpot(area_id=area.id, title=title, type=type_, description=desc, highlight=highlight))
    for spot, dish, type_ in food_items:
        db.add(MMRAreaFood(area_id=area.id, spot=spot, dish=dish, type=type_))

# ================= STATIONS (with real lat/lng, matching MUMBAI_STATIONS) =================
stations_data = [
    ("Churchgate", "Western", False, 18.9322, 72.8264),
    ("Marine Lines", "Western", False, 18.9457, 72.8236),
    ("Charni Road", "Western", False, 18.9514, 72.8192),
    ("Grant Road", "Western", False, 18.9629, 72.8151),
    ("Mumbai Central", "Western", True, 18.9694, 72.8194),
    ("Dadar", "Interchange (Western & Central)", True, 19.0186, 72.8440),
    ("Bandra", "Western", True, 19.0544, 72.8406),
    ("Andheri", "Western & Harbour", True, 19.1197, 72.8468),
    ("Borivali", "Western", True, 19.2307, 72.8567),
    ("Virar", "Western", False, 19.4559, 72.8111),
    ("CSMT (VT)", "Central & Harbour", True, 18.9401, 72.8352),
    ("Byculla", "Central", False, 18.9762, 72.8327),
    ("Kurla", "Interchange (Central & Harbour)", True, 19.0663, 72.8794),
    ("Ghatkopar", "Central", True, 19.0864, 72.9081),
    ("Thane", "Central", True, 19.1863, 72.9752),
    ("Kalyan", "Central", True, 19.2432, 73.1301),
    ("Wadala Road", "Harbour", True, 19.0176, 72.8570),
    ("Vashi", "Harbour", True, 19.0771, 72.9986),
    ("Panvel", "Harbour", True, 18.9894, 73.1175),
]
station_objs = {}
for name, line_display, hub, lat, lng in stations_data:
    st = Station(name=name, display_line=line_display, is_hub=1 if hub else 0, latitude=lat, longitude=lng)
    db.add(st)
    db.flush()
    station_objs[name] = st

# Real per-line sequences so the BFS pathfinder can route correctly.
western_line = TrainLine(name="Western")
central_line = TrainLine(name="Central")
harbour_line = TrainLine(name="Harbour")
db.add_all([western_line, central_line, harbour_line])
db.flush()

western_order = ["Churchgate", "Marine Lines", "Charni Road", "Grant Road", "Mumbai Central",
                  "Dadar", "Bandra", "Andheri", "Borivali", "Virar"]
central_order = ["CSMT (VT)", "Byculla", "Dadar", "Kurla", "Ghatkopar", "Thane", "Kalyan"]
harbour_order = ["CSMT (VT)", "Wadala Road", "Kurla", "Andheri", "Vashi", "Panvel"]

for seq, name in enumerate(western_order):
    db.add(StationOnLine(line_id=western_line.id, station_id=station_objs[name].id, sequence=seq))
for seq, name in enumerate(central_order):
    db.add(StationOnLine(line_id=central_line.id, station_id=station_objs[name].id, sequence=seq))
for seq, name in enumerate(harbour_order):
    db.add(StationOnLine(line_id=harbour_line.id, station_id=station_objs[name].id, sequence=seq))

# ================= DEMO POLICE OFFICER =================
db.add(PoliceOfficer(
    badge_id="MUM-1024",
    full_name="Insp. R. Deshmukh",
    password_hash=pwd_context.hash("demo1234"),
    precinct="Mumbai Central Emergency Dispatch",
))

db.commit()
db.close()
print("Seed complete: attractions, hotels, food, emergency services, scams, phrasebook,")
print("smart itineraries, MMR areas, stations/lines, and 1 demo police officer (MUM-1024 / demo1234).")
