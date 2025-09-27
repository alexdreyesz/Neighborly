import pygame
import json
import random
import math
import os
from dataclasses import dataclass, asdict
from typing import List
from datetime import datetime
from enum import Enum

pygame.init()

WINDOW_WIDTH = 1200
WINDOW_HEIGHT = 800
FPS = 60

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
BLUE = (0, 100, 255)
RED = (255, 100, 100)
GREEN = (100, 255, 100)
YELLOW = (255, 255, 100)
PURPLE = (255, 100, 255)
ORANGE = (255, 165, 0)
GRAY = (128, 128, 128)

class PersonType(Enum):
    RESIDENT = "resident"
    VOLUNTEER = "volunteer"
    ORGANIZATION = "organization"
    PROVIDER = "provider"

class UrgencyLevel(Enum):
    IMMEDIATE = "Immediate"
    THIS_WEEK = "This week" 
    ANYTIME = "Anytime"

@dataclass
class Post:
    id: int
    user_id: int
    post_type: str  # "offer" or "request"
    category: str
    title: str
    description: str
    urgency: str
    location: tuple
    timestamp: str
    safety_flags: List[str]
    is_duplicate: bool
    user_reputation: float

@dataclass
class Person:
    id: int
    name: str
    person_type: PersonType
    x: float
    y: float
    skills: List[str]
    needs: List[str]
    reputation: float
    posts_created: int
    safety_score: float
    
@dataclass
class Organization:
    id: int
    name: str
    org_type: str  # "food_bank", "shelter", "school", "clinic"
    x: float
    y: float
    capacity: int
    current_usage: int
    operating_hours: str
    current_shortages: List[str]
    services: List[str]

@dataclass
class SupplyDemandData:
    category: str
    offers: int
    requests: int
    shortage_level: float
    timestamp: str
    location_clusters: List[tuple]

class TownSimulation:
    def __init__(self):
        self.screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
        pygame.display.set_caption("Community Town Simulation")
        self.clock = pygame.time.Clock()
        self.running = True
        
        self.num_people = 300
        self.num_organizations = 15

        self.people = []
        self.organizations = []
        self.posts = []
        self.supply_demand_data = []
        self.volunteer_matches = []
   
        self.post_id_counter = 1
        self.person_id_counter = 1
        self.org_id_counter = 1
        
        # categories posts
        self.categories = [
            "food", "clothing", "housing", "transportation", "childcare",
            "medical", "education", "employment", "furniture", "technology",
            "emergency", "mental_health", "elderly_care", "pet_care", "utilities"
        ]
        
        # skills for volunteers
        self.skills = [
            "tutoring", "driving", "cooking", "childcare", "elder_care",
            "medical", "counseling", "translation", "tech_support", "home_repair",
            "job_coaching", "financial_planning", "legal_aid", "pet_sitting"
        ]
        
        # org types and their services
        self.org_services = {
            "food_bank": ["food", "emergency", "nutrition_education"],
            "shelter": ["housing", "emergency", "clothing", "mental_health"],
            "school": ["education", "childcare", "food", "technology"],
            "clinic": ["medical", "mental_health", "emergency"]
        }
        
        self.initialize_simulation()
        
    def initialize_simulation(self):
        org_types = ["food_bank", "shelter", "school", "clinic"]
        for i in range(self.num_organizations):  
            org_type = random.choice(org_types)
            org = Organization(
                id=self.org_id_counter,
                name=f"{org_type.replace('_', ' ').title()} {i+1}",
                org_type=org_type,
                x=random.uniform(50, WINDOW_WIDTH-50),
                y=random.uniform(50, WINDOW_HEIGHT-50),
                capacity=random.randint(20, 200),
                current_usage=random.randint(5, 150),
                operating_hours=f"{random.randint(6,9)}AM-{random.randint(4,8)}PM",
                current_shortages=random.sample(self.categories, random.randint(1,4)),
                services=self.org_services[org_type]
            )
            self.organizations.append(org)
            self.org_id_counter += 1
            
        for i in range(self.num_people): 
            person_type = random.choices(list(PersonType), weights=[100, 35, 5, 15] )[0] #num of people there
            
            person = Person(
                id=self.person_id_counter,
                name=f"Person_{i+1}",
                person_type=person_type,
                x=random.uniform(50, WINDOW_WIDTH-50),
                y=random.uniform(50, WINDOW_HEIGHT-50),
                skills=random.sample(self.skills, random.randint(1, 4)) if person_type in [PersonType.VOLUNTEER, PersonType.PROVIDER] else [],
                needs=random.sample(self.categories, random.randint(0, 3)),
                reputation=random.uniform(0.1, 1.0),
                posts_created=0,
                safety_score=random.uniform(0.5, 1.0)
            )
            self.people.append(person)
            self.person_id_counter += 1
    
    def generate_suspicious_content(self, description: str) -> List[str]:
        flags = []
        suspicious_patterns = [
            ("scam", ["money", "cash", "wire", "urgent payment"]),
            ("inappropriate", ["personal info", "meet alone", "private"]),
            ("spam", ["click here", "amazing deal", "limited time"])
        ]
        
        for flag_type, keywords in suspicious_patterns:
            if any(keyword in description.lower() for keyword in keywords):
                flags.append(flag_type)
                
        if random.random() < 0.05:  # 5% chance of being flagged as duplicate
            flags.append("duplicate")
            
        return flags
    
    def generate_post(self, person: Person) -> Post:
        post_type = "offer" if person.person_type in [PersonType.PROVIDER, PersonType.VOLUNTEER] else random.choice(["offer", "request"])
        category = random.choice(self.categories)
        
        if post_type == "offer":
            titles = {
                "food": [
                    "Free groceries available", "Home-cooked meals ready", "Fresh vegetables from garden",
                    "Leftover catering food", "Baby formula available", "Free bread from bakery",
                    "Community soup kitchen", "Fresh fruit pickup", "Pantry cleanout items",
                    "Restaurant surplus food", "Holiday meal preparation", "Bulk rice and beans",
                    "Free lunch for kids", "Farmers market extras", "Meal prep containers",
                    "Homemade preserves", "Free coffee and pastries", "Community potluck leftovers"
                ],
                "clothing": [
                    "Winter coats for kids", "Professional attire donation", "Gently used shoes",
                    "Back to school clothes", "Baby clothes 0-2T", "Plus size women's clothing",
                    "Men's work boots size 10-12", "Formal wear for interviews", "Maternity clothes",
                    "Halloween costumes", "Sports uniforms", "Rain gear available",
                    "Designer clothes donation", "Warm blankets and linens", "Undergarments new with tags",
                    "School uniforms", "Vintage clothing lot", "Athletic wear and sneakers"
                ],
                "transportation": [
                    "Rides to appointments", "Moving help with truck", "Airport pickup service",
                    "Daily commute carpool", "Grocery store runs", "School pickup/dropoff",
                    "Medical transport", "Job interview rides", "Bus pass donations",
                    "Car repair help", "Jump start service", "Furniture delivery",
                    "Senior citizen rides", "Emergency transportation", "Weekend taxi service",
                    "Bike repair and tune-up", "Moving boxes and supplies", "Gas money assistance"
                ],
                "childcare": [
                    "Babysitting services", "After school care", "Weekend childcare",
                    "Date night babysitting", "Emergency childcare", "Summer camp alternative",
                    "Tutoring and homework help", "Newborn care assistance", "Special needs support",
                    "Playdates and activities", "School holiday coverage", "Evening childcare",
                    "Birthday party supervision", "Sick child care", "Single parent support",
                    "Toddler activities", "Teen mentorship", "Art and craft sessions"
                ],
                "medical": [
                    "Free health screenings", "Prescription delivery", "Medical equipment loan",
                    "First aid training", "Blood pressure checks", "Mental health counseling",
                    "Dental cleaning vouchers", "Eye exam assistance", "Physical therapy help",
                    "Medical appointment rides", "Health insurance navigation", "Medication management",
                    "Wellness workshops", "Vaccine clinic", "Senior health checks",
                    "Nutrition counseling", "Support group meetings", "Medical bill assistance"
                ],
                "education": [
                    "Math tutoring available", "English lessons", "Computer skills help",
                    "SAT prep sessions", "Adult literacy classes", "Job skills training",
                    "Resume writing help", "College application aid", "Language exchange",
                    "Art lessons for kids", "Music instrument lessons", "Science fair help",
                    "Homework club", "Study group formation", "Public speaking practice",
                    "Financial literacy class", "Digital literacy training", "Career counseling"
                ],
                "employment": [
                    "Job referral network", "Interview practice", "Professional networking",
                    "Skills training workshop", "Resume review service", "LinkedIn profile help",
                    "Career change guidance", "Freelance opportunities", "Part-time positions",
                    "Work from home jobs", "Apprenticeship programs", "Job fair information",
                    "Professional references", "Industry connections", "Salary negotiation tips",
                    "Portfolio development", "Business startup help", "Professional mentorship"
                ],
                "furniture": [
                    "Moving sale everything", "Free dining table", "Kids bedroom set",
                    "Office furniture donation", "Couch and chairs", "Kitchen appliances",
                    "Mattress and box spring", "Bookshelves and storage", "Patio furniture set",
                    "Baby furniture and gear", "Electronics and TV", "Home decor items",
                    "Exercise equipment", "Garden furniture", "Craft supplies lot",
                    "Holiday decorations", "Board games and toys", "Household essentials"
                ],
                "technology": [
                    "Free laptop repair", "Phone setup help", "WiFi troubleshooting",
                    "Computer donations", "Tech support for seniors", "Software installation",
                    "Online safety training", "Digital device lessons", "Internet access sharing",
                    "Smartphone tutorials", "Social media setup", "Online banking help",
                    "Video call assistance", "Email account creation", "Password management",
                    "Device data transfer", "App recommendations", "Digital photo organizing"
                ],
                "emergency": [
                    "Emergency shelter space", "Crisis support available", "Food bank emergency",
                    "Utility bill assistance", "Rent payment help", "Emergency childcare",
                    "Medical emergency aid", "Transportation to hospital", "Temporary housing",
                    "Storm damage cleanup", "Emergency supplies kit", "Pet emergency care",
                    "Legal emergency help", "Family crisis support", "Disaster relief aid",
                    "Safety planning help", "Emergency contact service", "Crisis intervention"
                ],
                "mental_health": [
                    "Peer support meetings", "Anxiety management group", "Grief counseling",
                    "Stress relief workshop", "Meditation sessions", "Support group hosting",
                    "Crisis intervention training", "Wellness check-ins", "Mindfulness practice",
                    "Art therapy sessions", "Music therapy group", "Recovery support",
                    "Teen counseling", "Family therapy", "Trauma support group",
                    "Suicide prevention training", "Mental health first aid", "Self-care workshops"
                ],
                "elderly_care": [
                    "Senior companion visits", "Grocery shopping help", "Technology assistance",
                    "Light housekeeping", "Medication reminders", "Doctor appointment rides",
                    "Social activities planning", "Meal preparation", "Pet care for seniors",
                    "Home safety checks", "Bill paying assistance", "Library book delivery",
                    "Garden maintenance", "Letter writing help", "Phone call check-ins",
                    "Exercise programs", "Memory care activities", "Holiday celebration help"
                ],
                "pet_care": [
                    "Dog walking service", "Pet sitting available", "Free pet supplies",
                    "Veterinary care vouchers", "Pet grooming help", "Emergency pet care",
                    "Pet training classes", "Animal foster care", "Pet food donations",
                    "Spay/neuter assistance", "Pet adoption events", "Lost pet search help",
                    "Senior pet care", "Special needs pets", "Pet therapy visits",
                    "Animal rescue transport", "Pet photography", "Pet memorial services"
                ],
                "utilities": [
                    "Utility bill assistance", "Energy audit help", "Weatherization supplies",
                    "Generator sharing", "Internet access sharing", "Phone service help",
                    "Heating bill relief", "Solar panel information", "Energy saving tips",
                    "Appliance repair", "HVAC maintenance", "Plumbing assistance",
                    "Electrical work help", "Home insulation", "Water conservation tips",
                    "Emergency power backup", "Utility payment plans", "Energy assistance programs"
                ],
                "housing": [
                    "Temporary housing", "Room rental offer", "House-sitting available",
                    "Moving assistance", "Home repairs help", "Painting services",
                    "Cleaning services", "Landscaping help", "Security deposit loan",
                    "Roommate matching", "Housing search help", "Lease negotiation",
                    "Home maintenance", "Pest control assistance", "Storage space offer",
                    "Garage cleanout help", "Home organizing", "Furniture assembly"
                ]
            }
        else:  # requests
            titles = {
                "food": [
                    "Need groceries urgently", "Looking for baby formula", "Food for family of 5",
                    "Emergency food assistance", "School lunch money needed", "Food allergies - need help",
                    "Diabetic meals needed", "Fresh produce wanted", "Thanksgiving meal help",
                    "Baby food and supplies", "Gluten-free options needed", "Halal food sources",
                    "Food stamps application", "Community garden space", "Cooking lessons needed",
                    "Kitchen equipment loan", "Meal delivery help", "Food bank referral"
                ],
                "housing": [
                    "Need temporary shelter", "Looking for apartment", "Housing assistance needed",
                    "Eviction prevention help", "Security deposit loan", "Room rental search",
                    "Homeless shelter info", "Moving help needed", "Storage unit rental",
                    "Roommate wanted", "Pet-friendly housing", "Accessible housing search",
                    "Rent payment assistance", "Housing voucher help", "Landlord references",
                    "Lease cosigner needed", "Home repairs urgent", "Utility setup help"
                ],
                "medical": [
                    "Need doctor appointment", "Prescription help needed", "Medical transportation",
                    "Health insurance enrollment", "Dental care urgent", "Vision care needed",
                    "Mental health counseling", "Physical therapy access", "Medical equipment needed",
                    "Hospital bill assistance", "Specialist referral needed", "Medical records help",
                    "Wheelchair rental", "Home health aide", "Medication management",
                    "Blood test assistance", "Surgery support needed", "Recovery care help"
                ],
                "employment": [
                    "Job search help needed", "Resume assistance urgent", "Interview preparation",
                    "Work clothes needed", "Transportation to work", "Childcare for work",
                    "Job training programs", "Career counseling", "Professional references",
                    "Skills certification help", "Job placement assistance", "Workplace accommodation",
                    "Part-time opportunities", "Remote work setup", "Professional networking",
                    "Business license help", "Freelance guidance", "Unemployment assistance"
                ],
                "transportation": [
                    "Need ride to work daily", "Car repair assistance", "Bus pass needed",
                    "Medical appointment ride", "Moving truck rental", "Airport ride needed",
                    "Kids school transport", "Grocery shopping rides", "Job interview transport",
                    "Car insurance help", "Driver's license renewal", "Vehicle registration help",
                    "Gas money assistance", "Parking permit help", "Public transit info",
                    "Bicycle repair needed", "Car seat installation", "Emergency towing"
                ],
                "childcare": [
                    "Babysitter needed ASAP", "After school care", "Weekend childcare help",
                    "Special needs childcare", "Newborn help needed", "Summer camp scholarship",
                    "Tutoring for child", "Daycare scholarship", "Emergency babysitting",
                    "Playdate coordination", "Child transportation", "Birthday party help",
                    "Homework assistance", "Bedtime routine help", "Sick child care",
                    "School pickup help", "Teen supervision", "Child activity transport"
                ],
                "clothing": [
                    "Winter coats for kids", "Professional attire needed", "School uniforms",
                    "Maternity clothes size L", "Work boots size 11", "Formal dress rental",
                    "Baby clothes 6-12 months", "Plus size clothing", "Rain gear needed",
                    "Athletic wear for teens", "Graduation outfit", "Interview clothes",
                    "Halloween costume help", "Warm blankets needed", "Undergarments needed",
                    "Shoes for growing kids", "Costume for play", "Uniform alterations"
                ],
                "furniture": [
                    "Bed and mattress needed", "Kitchen table wanted", "Kids furniture needed",
                    "Moving boxes required", "Refrigerator needed", "Washing machine help",
                    "Couch and chairs", "Office desk needed", "Storage solutions",
                    "Baby crib and supplies", "Wheelchair accessible", "Dining room set",
                    "Bedroom furniture", "Kitchen appliances", "Entertainment center",
                    "Patio furniture", "Exercise equipment", "Home office setup"
                ],
                "technology": [
                    "Computer for school", "Internet access needed", "Phone repair help",
                    "Laptop for job search", "WiFi setup assistance", "Tech support needed",
                    "Online learning tools", "Digital literacy help", "Smartphone needed",
                    "Printer for documents", "Software assistance", "Data recovery help",
                    "Video conferencing setup", "Email account help", "Social media guidance",
                    "Online banking setup", "Digital photo help", "App installation"
                ],
                "emergency": [
                    "Immediate shelter needed", "Emergency food now", "Crisis intervention",
                    "Utility shutoff help", "Rent due tomorrow", "Medical emergency",
                    "Domestic violence help", "Homeless tonight", "Emergency childcare",
                    "Pet emergency care", "Transportation crisis", "Legal emergency",
                    "Mental health crisis", "Family emergency", "Natural disaster aid",
                    "Safety planning help", "Emergency supplies", "Immediate cash help"
                ],
                "mental_health": [
                    "Counseling services needed", "Support group access", "Crisis intervention",
                    "Anxiety help urgent", "Depression support", "Trauma counseling",
                    "Addiction recovery", "Family therapy needed", "Teen counseling",
                    "Grief support group", "Stress management", "Anger management",
                    "Eating disorder help", "PTSD treatment", "Bipolar support",
                    "Suicide prevention help", "Self-harm support", "Mental health advocate"
                ],
                "elderly_care": [
                    "Senior care needed", "Companion for elderly", "Medical rides for senior",
                    "Grocery shopping help", "Medication management", "Home safety check",
                    "Social visits needed", "Technology help for senior", "Meal preparation",
                    "Light housekeeping", "Pet care for elderly", "Bill paying help",
                    "Garden maintenance", "Transportation to activities", "Health monitoring",
                    "Emergency contact needed", "Memory care support", "Exercise companion"
                ],
                "pet_care": [
                    "Dog walker needed", "Pet sitting urgent", "Veterinary care help",
                    "Pet food assistance", "Emergency pet care", "Pet grooming help",
                    "Animal foster needed", "Lost pet search", "Pet supplies needed",
                    "Spay/neuter assistance", "Pet training help", "Senior pet care",
                    "Special needs pet", "Pet medication help", "Animal transport",
                    "Pet boarding needed", "Vet bill assistance", "Pet behavioral help"
                ],
                "utilities": [
                    "Electric bill help", "Heat shutoff notice", "Internet service needed",
                    "Phone service help", "Water bill assistance", "Gas bill overdue",
                    "Energy assistance needed", "Utility deposit help", "Service restoration",
                    "Weatherization help", "Appliance repair", "HVAC assistance",
                    "Plumbing emergency", "Electrical work needed", "Home insulation",
                    "Energy audit needed", "Solar information", "Generator rental"
                ],
                "education": [
                    "Tutoring needed", "School supplies help", "College application aid",
                    "Adult education classes", "GED preparation", "Language learning",
                    "Computer literacy", "Job skills training", "Scholarship information",
                    "School lunch assistance", "Transportation to school", "Homework help",
                    "Study group needed", "Test preparation", "Career counseling",
                    "Library card help", "Educational supplies", "Learning disability support"
                ]
            }

        
        title = random.choice(titles.get(category, [f"{post_type.title()} for {category}"]))
        
        # potential safety issues
        base_descriptions = {
            "offer": [
                f"Available to help with {category} in our community",
                f"Happy to provide {category} support to neighbors in need",
                f"Offering {category} assistance - please reach out",
                f"Community member willing to help with {category}",
                f"Local {category} support available",
                f"Sharing resources for {category} needs",
                f"Volunteer help available for {category}",
                f"No cost {category} assistance offered"
            ],
            "request": [
                f"Seeking help with {category} situation",
                f"Family needs assistance with {category}",
                f"Looking for {category} support in our area",
                f"Could use community help with {category}",
                f"Requesting {category} assistance",
                f"In need of {category} help",
                f"Struggling with {category} - need support",
                f"Emergency {category} assistance needed"
            ]
        }
        
        post_type = random.choice(["offer", "request"])
        description = random.choice(base_descriptions[post_type])

        

        if random.random() < 0.1:  # 10% chance
            suspicious_additions = [
                " Send cash payment upfront! No questions asked!",
                " Meet me alone in parking lot after dark",
                " Click this suspicious link for amazing deals!!!",
                " Wire money immediately or offer expires",
                " Must have your social security number first",
                " Bring all your personal documents to meet",
                " Only contact through encrypted messaging app",
                " No phone calls, cash only transactions",
                " Delete this message after reading",
                " Urgent - government assistance available (fake)",
                " Collect personal information for verification",
                " Request bank account details for payment"
            ]
            description += random.choice(suspicious_additions)
        
        urgency_weights = {
            "emergency": [0.7, 0.2, 0.1],
            "medical": [0.5, 0.3, 0.2], 
            "food": [0.3, 0.4, 0.3],
            "housing": [0.4, 0.4, 0.2]
        }
        weights = urgency_weights.get(category, [0.2, 0.3, 0.5])
        urgency = random.choices(list(UrgencyLevel), weights=weights)[0].value
        
        is_duplicate = random.random() < 0.08  # 8% chance of duplicate
        
        post = Post(
            id=self.post_id_counter,
            user_id=person.id,
            post_type=post_type,
            category=category,
            title=title,
            description=description,
            urgency=urgency,
            location=(person.x, person.y),
            timestamp=datetime.now().isoformat(),
            safety_flags=self.generate_suspicious_content(description),
            is_duplicate=is_duplicate,
            user_reputation=person.reputation
        )
        
        self.post_id_counter += 1
        person.posts_created += 1
        
        return post
    
    def generate_supply_demand_data(self):
        for category in self.categories:
            offers = sum(1 for post in self.posts if post.category == category and post.post_type == "offer")
            requests = sum(1 for post in self.posts if post.category == category and post.post_type == "request")
            
            shortage_level = max(0, (requests - offers) / max(requests, 1))
            
            category_posts = [post for post in self.posts if post.category == category]
            location_clusters = [(post.location[0], post.location[1]) for post in category_posts[:5]]
            
            supply_demand = SupplyDemandData(
                category=category,
                offers=offers,
                requests=requests,
                shortage_level=shortage_level,
                timestamp=datetime.now().isoformat(),
                location_clusters=location_clusters
            )
            
            self.supply_demand_data.append(supply_demand)
    
    def generate_volunteer_matches(self):
        volunteers = [p for p in self.people if p.person_type == PersonType.VOLUNTEER and p.skills]
        request_posts = [p for p in self.posts if p.post_type == "request"]
        
        matches = []
        for post in request_posts[:50]:
            poster = next((p for p in self.people if p.id == post.user_id), None)
            if not poster:
                continue
                
            relevant_volunteers = []
            for volunteer in volunteers:
                skill_match = any(skill in post.description.lower() or skill in post.category.lower() for skill in volunteer.skills)
                if skill_match:
                    distance = math.sqrt((volunteer.x - post.location[0])**2 + (volunteer.y - post.location[1])**2)
                    relevant_volunteers.append({
                        "volunteer_id": volunteer.id,
                        "volunteer_name": volunteer.name,
                        "skills": volunteer.skills,
                        "distance": distance,
                        "reputation": volunteer.reputation
                    })
            
            if relevant_volunteers:
                relevant_volunteers.sort(key=lambda x: (x["distance"], -x["reputation"]))
                
                match = {
                    "post_id": post.id,
                    "seeker_id": post.user_id,
                    "category": post.category,
                    "urgency": post.urgency,
                    "matched_volunteers": relevant_volunteers[:3], 
                    "match_score": random.uniform(0.6, 1.0),
                    "timestamp": datetime.now().isoformat()
                }
                matches.append(match)
        
        self.volunteer_matches = matches
    
    def update_organizations(self):
        for org in self.organizations:

            org.current_usage += random.randint(-5, 8)
            org.current_usage = max(0, min(org.current_usage, org.capacity))
            
            if random.random() < 0.3:  # 30% chance to change shortages
                if org.current_shortages and random.random() < 0.5:
                    org.current_shortages.remove(random.choice(org.current_shortages))
                else:
                    new_shortage = random.choice(self.categories)
                    if new_shortage not in org.current_shortages:
                        org.current_shortages.append(new_shortage)
    
    def draw(self):
        self.screen.fill(WHITE)
        
        for org in self.organizations:
            color = {
                "food_bank": GREEN,
                "shelter": BLUE,
                "school": YELLOW,
                "clinic": RED
            }.get(org.org_type, GRAY)
            
            pygame.draw.rect(self.screen, color, (org.x-10, org.y-10, 20, 20))
            
            capacity_ratio = org.current_usage / org.capacity
            bar_width = 30
            bar_height = 5
            pygame.draw.rect(self.screen, BLACK, (org.x-15, org.y+15, bar_width, bar_height))
            pygame.draw.rect(self.screen, RED if capacity_ratio > 0.8 else GREEN, 
                           (org.x-15, org.y+15, bar_width * capacity_ratio, bar_height))
        
        for person in self.people:
            color = {
                PersonType.RESIDENT: BLACK,
                PersonType.VOLUNTEER: GREEN,
                PersonType.ORGANIZATION: BLUE,
                PersonType.PROVIDER: PURPLE
            }.get(person.person_type, GRAY)
            
            pygame.draw.circle(self.screen, color, (int(person.x), int(person.y)), 3)
        

        recent_posts = self.posts[-50:] if len(self.posts) > 50 else self.posts
        for post in recent_posts:
            color = RED if post.post_type == "request" else GREEN
            if post.safety_flags:
                color = ORANGE
            pygame.draw.circle(self.screen, color, (int(post.location[0]), int(post.location[1])), 2)
        
        legend_y = 10
        font = pygame.font.Font(None, 24)
        
        legend_items = [
            ("Organizations:", BLACK),
            ("Food Bank", GREEN),
            ("Shelter", BLUE), 
            ("School", YELLOW),
            ("Clinic", RED),
            ("People:", BLACK),
            ("Resident", BLACK),
            ("Volunteer", GREEN),
            ("Provider", PURPLE),
            ("Posts:", BLACK),
            ("Request", RED),
            ("Offer", GREEN),
            ("Flagged", ORANGE)
        ]
        
        x_offset = 10
        for i, (text, color) in enumerate(legend_items):
            if i > 0 and i % 7 == 0:
                x_offset += 150
                legend_y = 10
                
            text_surface = font.render(text, True, color)
            self.screen.blit(text_surface, (x_offset, legend_y))
            legend_y += 25
        
        stats_y = WINDOW_HEIGHT - 100
        stats = [
            f"People: {len(self.people)}",
            f"Organizations: {len(self.organizations)}", 
            f"Posts: {len(self.posts)}",
            f"Matches: {len(self.volunteer_matches)}"
        ]
        
        for i, stat in enumerate(stats):
            text_surface = font.render(stat, True, BLACK)
            self.screen.blit(text_surface, (10, stats_y + i * 20))
        
        pygame.display.flip()
    
    def save_simulation_data(self):
        os.makedirs("data/sim_data/", exist_ok=True)
        
        simulation_data = {
            "people": [asdict(person) for person in self.people],
            "organizations": [asdict(org) for org in self.organizations],
            "posts": [asdict(post) for post in self.posts],
            "supply_demand": [asdict(sd) for sd in self.supply_demand_data],
            "volunteer_matches": self.volunteer_matches,
            "simulation_metadata": {
                "timestamp": datetime.now().isoformat(),
                "total_people": len(self.people),
                "total_organizations": len(self.organizations),
                "total_posts": len(self.posts),
                "categories": self.categories,
                "skills": self.skills
            }
        }
        
        with open("data/sim_data/complete_simulation.json", "w") as f:
            json.dump(simulation_data, f, indent=2, default=str)
        
        
        # 1. Urgency Classifier Agent Data (NOT USING ❌)
        urgency_data = { 
            "posts_for_classification": [
                {
                    "post_id": post.id,
                    "title": post.title,
                    "description": post.description,
                    "category": post.category,
                    "actual_urgency": post.urgency,  # For training/validation
                    "timestamp": post.timestamp
                }
                for post in self.posts
            ]
        }
        
        with open("data/sim_data/urgency_classifier_data.json", "w") as f:
            json.dump(urgency_data, f, indent=2)
        
        # 2. Supply-Demand Balancer Agent Data  
        supply_demand_export = {
            "supply_demand_analysis": [asdict(sd) for sd in self.supply_demand_data],
            "shortage_alerts": [
                {
                    "category": sd.category,
                    "shortage_level": sd.shortage_level,
                    "requests": sd.requests,
                    "offers": sd.offers,
                    "alert_level": "HIGH" if sd.shortage_level > 0.7 else "MEDIUM" if sd.shortage_level > 0.4 else "LOW"
                }
                for sd in self.supply_demand_data if sd.shortage_level > 0.3
            ]
        }
        
        with open("data/sim_data/supply_demand_data.json", "w") as f:
            json.dump(supply_demand_export, f, indent=2)
        
        # 3. Safety & Trust Agent Data
        safety_data = {
            "posts_for_safety_check": [
                {
                    "post_id": post.id,
                    "content": post.description,
                    "user_id": post.user_id,
                    "user_reputation": post.user_reputation,
                    "detected_flags": post.safety_flags,
                    "is_duplicate": post.is_duplicate,
                    "risk_level": "HIGH" if len(post.safety_flags) > 1 else "MEDIUM" if post.safety_flags else "LOW"
                }
                for post in self.posts
            ],
            "user_safety_scores": [
                {
                    "user_id": person.id,
                    "reputation": person.reputation,
                    "safety_score": person.safety_score,
                    "posts_created": person.posts_created
                }
                for person in self.people
            ]
        }
        
        with open("data/sim_data/safety_trust_data.json", "w") as f:
            json.dump(safety_data, f, indent=2)
        
        # 4. Org Sync Agent Data
        org_sync_data = {
            "organizations": [
                {
                    "org_id": org.id,
                    "name": org.name,
                    "type": org.org_type,
                    "capacity": org.capacity,
                    "current_usage": org.current_usage,
                    "capacity_percentage": (org.current_usage / org.capacity) * 100,
                    "operating_hours": org.operating_hours,
                    "current_shortages": org.current_shortages,
                    "services": org.services,
                    "location": {"x": org.x, "y": org.y},
                    "status": "FULL" if org.current_usage >= org.capacity * 0.9 else "AVAILABLE"
                }
                for org in self.organizations
            ],
            "urgent_needs_from_orgs": [
                {
                    "org_id": org.id,
                    "org_name": org.name,
                    "shortages": org.current_shortages,
                    "capacity_strain": org.current_usage / org.capacity,
                    "auto_generated_requests": [
                        {
                            "category": shortage,
                            "urgency": "Immediate" if org.current_usage > org.capacity * 0.8 else "This week",
                            "quantity_needed": random.randint(10, 50),
                            "location": {"x": org.x, "y": org.y}
                        }
                        for shortage in org.current_shortages
                    ]
                }
                for org in self.organizations if org.current_shortages
            ]
        }
        
        with open("data/sim_data/org_sync_data.json", "w") as f:
            json.dump(org_sync_data, f, indent=2)
        
        # 5. Volunteer Match Agent Data
        volunteer_match_export = {
            "volunteer_matches": self.volunteer_matches,
            "volunteer_profiles": [
                {
                    "volunteer_id": person.id,
                    "name": person.name,
                    "skills": person.skills,
                    "reputation": person.reputation,
                    "location": {"x": person.x, "y": person.y},
                    "availability_score": random.uniform(0.3, 1.0)
                }
                for person in self.people if person.person_type == PersonType.VOLUNTEER
            ],
            "unmatched_requests": [
                {
                    "post_id": post.id,
                    "category": post.category,
                    "urgency": post.urgency,
                    "location": {"x": post.location[0], "y": post.location[1]},
                    "skills_needed": [skill for skill in self.skills if skill in post.description.lower()],
                    "seeker_id": post.user_id
                }
                for post in self.posts 
                if post.post_type == "request" and not any(match["post_id"] == post.id for match in self.volunteer_matches)
            ]
        }
        
        with open("data/sim_data/volunteer_match_data.json", "w") as f:
            json.dump(volunteer_match_export, f, indent=2)
        
        print(f"Simulation data saved to data/sim_data/")
        print(f"Generated {len(self.posts)} posts from {len(self.people)} people and {len(self.organizations)} organizations")
        print(f"Found {len(self.volunteer_matches)} volunteer matches")
        print(f"Detected {len([p for p in self.posts if p.safety_flags])} posts with safety flags")
        
    def run(self):
        frame_count = 0
        last_post_generation = 0
        
        while self.running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_s:
                        self.generate_supply_demand_data()
                        self.generate_volunteer_matches() 
                        self.save_simulation_data()
            
            if frame_count - last_post_generation > FPS // 2:
                for _ in range(random.randint(10, 30)):
                    person = random.choice(self.people)
                    if random.random() < 0.3:  # 30% chance any person posts
                        post = self.generate_post(person)
                        self.posts.append(post)
                
                last_post_generation = frame_count
                
                self.update_organizations()
                

                # if len(self.posts) > 2000:
                #     self.posts = self.posts[-800:]  # Keep most recent 800 posts
            
            self.draw()
            self.clock.tick(FPS)
            frame_count += 1
            
            if frame_count % (FPS * 10) == 0:
                self.generate_supply_demand_data()
                self.generate_volunteer_matches()
                self.save_simulation_data()
        
        self.generate_supply_demand_data()
        self.generate_volunteer_matches()
        self.save_simulation_data()
        
        pygame.quit()

if __name__ == "__main__":
    print("Starting Community Town Simulation")
    print("Press 'S' to save data manually")
    print("Data auto-saves every 30 seconds")
    print("Close window to exit and save final data")
    
    simulation = TownSimulation()
    simulation.run()