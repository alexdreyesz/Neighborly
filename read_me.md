# Notability

> **Mission:** Lower the barrier for people to help each other in their local communities.  
> **Goal:** A location-aware mutual-aid app that connects people who want to give or receive help, surfacing the **top needs** nearby.

---

## 🌟 Primary Features

- **Offer Items & Services**  
  Users can share goods (clothes, food, furniture) or services (tutoring, rides, mentoring).  
- **Request Help**  
  Users can request items or services from the local community.  
- **Top Needs Dashboard**  
  Highlights the most urgent needs nearby, ranked by AI and community activity.  
- **Volunteer Events**  
  Post and sign up for local volunteer opportunities.  
- **Resource Directory**  
  Directs users to shelters, food pantries, schools, or other aid organizations.  

---

## 💡 Why This Matters

Communities often have resources, but awareness is fragmented. People want to help, but they don’t always know:  

- **What’s most needed**  
- **Where to help**  
- **Who to contact**  

**CommunityPulse solves this by:**  

- Standardizing offers/requests.  
- Auto-tagging and ranking urgency using AI.  
- Surfacing the **top 3 local need categories**.  
- Enabling **one-tap claiming** and safe coordination.  

---

## 🧑‍🤝‍🧑 Roles & Core Flows

**Roles (users can have multiple roles):**

- **Provider:** Offers items, skills, rides, or time.  
- **Seeker:** Requests help (food, hygiene, school supplies, rides, etc.).  
- **Org:** Pantries, shelters, schools, or churches.  

**MVP Screens:**  

1. **Home (Feed ↔ Map)** — Filters by distance & category; shows **Top Needs**.  
2. **Create Post** — Offer or Request (title, description, location, category, quantity, optional photos).  
3. **Post Detail** — Claim/Unclaim, safety tips, contact options.  
4. **Profile** — Role toggle, skills, languages, radius, org verification badge.  

---

## 🤖 AI Agents & Functionality

### 1. Supply-Demand Balancer
- **Input:** Stream of offers vs requests  
- **Task:** Detect shortages and highlight urgent needs  
- **Output:** Updates *Top Needs* + notifies relevant providers  

### 2. Safety & Trust Model ✅
- **Input:** Post content + profile metadata  
- **Task:** Detect unsafe language, scams, or duplicates  
- **Output:** Flags suspicious posts before they appear  

### 3. Org Sync Agent
- **Input:** CSV/API feeds from food banks, shelters, schools  
- **Task:** Sync operating hours, capacity, shortages  
- **Output:** Auto-generates urgent requests in *Top Needs*  

### 4. Volunteer Match Agent
- **Input:** Seeker requests + provider skill profiles  
- **Task:** Match volunteers to seekers  
- **Output:** Suggests matched posts for volunteering  

### 5. Event Aggregator Agent
- Auto-creates volunteer opportunities from local calendars, Eventbrite, church bulletins, etc.  

### 6. Recycling Agent
- Optimizes pickup schedules based on predicted waste volumes  

**Agent Chat Interface:** Users can ask questions like:  
*"Where should we redirect today’s food surplus?"* → Agents collaborate to plan actions.  

---

## 📂 Post Categories

- **Basic Needs:** food, clothing, housing, transportation, furniture, utilities  
- **Health & Care:** medical, mental_health, elderly_care, childcare, pet_care  
- **Life Development:** education, employment, technology  
- **Urgent / Safety:** emergency  

---

## 🤝 Volunteer Skills

- **Education & Support:** tutoring, counseling, translation, job coaching, financial planning, legal aid  
- **Daily Living:** cooking, driving, childcare, elder care, pet sitting, home repair  
- **Health & Care:** medical, elder care, counseling  
- **Technology:** tech support  

---

## 🏢 Organization Types & Services

| Org Type   | Services                                  |
|------------|------------------------------------------|
| Food Bank  | food, emergency, nutrition education     |
| Shelter    | housing, emergency, clothing, mental health |
| School     | education, childcare, food, technology  |
| Clinic     | medical, mental health, emergency        |

---

## 👤 Profile (MVP)

- Name & profile picture  
- Phone number  
- Role toggle (Provider, Seeker, Org)  
- Skills & languages  
- Radius for visibility  
- Org verification badge  

---

## ⚡ Remaining Bugs / To-Do

- Optimize logged-in user experience:  
  - Custom Dashboard  
  - Hide sign-in/sign-up when logged in; show log out + profile button  
  - Remove hero sections if unnecessary  

---

## 🛠 Tech Stack (Suggested)

- **Frontend:** React Native / Flutter  
- **Backend:** Node.js / Python (FastAPI)  
- **Database:** PostgreSQL / MongoDB  
- **AI Agents:** Python (Pandas, NLP, ML)  
- **Maps & Location:** Google Maps API / Mapbox  
