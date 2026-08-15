# 🌍 SUKHAD-JOURNEY

**Smart Tourist Assistance & Safety Platform for the Mumbai Metropolitan Region (MMR)**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

> *"अतिथि देवो भव"* — **The Guest is God**

**Sukhad-Journey** is a comprehensive, mobile-first smart tourist assistance platform designed to make travel across the Mumbai Metropolitan Region (MMR) safer, easier, and more accessible. 

By unifying local transportation guidance, emergency support, attraction discovery, trip planning, and a digital tourist pass into a single interface, Sukhad-Journey acts as a definitive digital companion for visitors navigating the bustling streets of Mumbai.

---

## 📌 The Challenge

Navigating Mumbai and its surrounding areas presents a unique set of challenges for tourists—especially first-time visitors. Common pain points include:

*   Finding safe, verified, and well-rated places to visit.
*   Decoding the complex and fast-paced Mumbai suburban railway network.
*   Accessing immediate local emergency contacts and services.
*   Estimating fair transportation costs across different travel modes.
*   Overcoming language barriers and understanding unique local slang.
*   Organizing efficient daily sightseeing itineraries in a geographically vast city.

**Sukhad-Journey** solves these challenges by consolidating essential travel and safety tools into one highly intuitive application.

---

## ✨ Key Features

### 🛡️ 1. Tourist Safety & Emergency SOS
*   **One-Tap Emergency SOS:** Instant access to 112 emergency dialing and local police assistance.
*   **Safety Context:** Coverage of designated safety zones, local safety guidance, and critical emergency contacts tailored to specific wards.

### 🧭 2. Regional & Attraction Guide
*   **Complete MMR Coverage:** Detailed travel information across Mumbai City, Suburbs, Thane, Navi Mumbai, and surrounding districts.
*   **Smart Attraction Directory:** Rich data including exact locations, categories, user ratings, real-time distance, safety status, and direct map integrations.

### 🏨 3. Curated Stays & Local Food
*   **Accommodation Guide:** Handpicked hotels filterable by category, ratings, distance, and approximate price ranges.
*   **Culinary Discovery:** Explore popular food hubs, iconic street food spots, and authentic local Maharashtrian cuisine.

### 🚆 4. Mumbai Local Train Navigator & Fare Estimator
*   **Suburban Rail Navigation:** Seamless route planning across the Western, Central, and Harbour lines with smart interchange suggestions (e.g., Dadar, Kurla).
*   **Dynamic Fare Estimator:** Approximate cost calculations across local trains, BEST buses, autos, and cabs to help manage travel budgets.

### 🗣️ 5. Bambaiya Hindi Phrasebook
*   A localized dictionary of key expressions, slang, and phrases to help visitors communicate smoothly with local vendors, drivers, and residents.

### 🗺️ 6. Smart Itineraries & Digital Tourist Pass
*   **Trip Planner:** Organize daily sightseeing schedules, activities, and optimal routes.
*   **Digital Safety Pass:** Generates a secure digital profile featuring QR-based check-in capabilities, credential verification, validity tracking, and emergency contacts.

### 👤 7. Flexible Access Modes
*   **Guest Mode:** Instantly browse key features and public guides without creating an account.
*   **Registered Profiles:** Phone number + OTP authentication to unlock a personalized dashboard, saved itineraries, and the digital pass.

---

## 🏗️ Application Flow

```text
┌─────────────────────┐
│    SUKHAD-JOURNEY   │
│    Welcome Screen   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Explore Safe Journey│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    Guest Overview   │
└──────────┬──────────┘
     ┌─────┴─────┐
     │           │
     ▼           ▼
 Guest Mode  Login / Register
     │           │
     │           ▼
     │    OTP Verification
     │           │
     │           ▼
     │    Tourist Profile
     │           │
     └─────┬─────┘
           │
           ▼
┌─────────────────────┐
│   Main Dashboard    │
└──────────┬──────────┘
           │
 ┌─────────┼─────────┬─────────┬─────────┐
 ▼         ▼         ▼         ▼         ▼
Safety Attractions  Food     Hotels   Transport
```

---

## 🧩 Core Modules

| Module | Purpose |
| :--- | :--- |
| **🏠 Home Dashboard** | The main navigation hub for all application features. |
| **🛡️ Emergency & Safety** | Quick access to safety contacts, SOS dialing, and local alerts. |
| **🗺️ MMR Guide** | Comprehensive regional travel and attraction database. |
| **🏨 Hotels & 🍴 Food** | Curated stays and authentic local culinary recommendations. |
| **🚆 Train Pathfinder** | Station-to-station navigation and line interchange guides. |
| **💰 Fare Estimator** | Budget estimations across multiple transit options. |
| **🗣️ Phrasebook** | Common local expressions, greetings, and translations. |
| **📅 Itineraries** | Custom trip planning tools and daily schedule management. |
| **🪪 Tourist Pass** | Digital identity verification and QR-based check-ins. |

---

## 🛠️ Tech Stack

*   **Frontend Framework:** [React](https://reactjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/) for type-safe code
*   **Build Tool:** [Vite](https://vitejs.dev/) for lightning-fast HMR and optimized builds
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) for utility-first responsive design
*   **Icons:** [Lucide React](https://lucide.dev/) for clean, consistent UI iconography

---

## 🚀 Getting Started

### Prerequisites
Make sure you have **Node.js** (v16 or higher) and **npm** installed on your system.

### Installation

**1. Clone the repository:**
```bash
git clone [https://github.com/NikhilYadav540/Sukhad-Journey.git](https://github.com/NikhilYadav540/Sukhad-Journey.git)
```

**2. Navigate to the project directory:**
```bash
cd Sukhad-Journey
```

**3. Install dependencies:**
```bash
npm install
```

**4. Start the local development server:**
```bash
npm run dev
```

**5. View the app:**
Open your browser and visit the local server URL displayed in your terminal (typically `http://localhost:5173`).

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check the [issues page](https://github.com/NikhilYadav540/Sukhad-Journey/issues) if you want to contribute.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---
