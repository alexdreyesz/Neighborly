
import logging
from typing import Dict, Any, List, Optional, Tuple
from collections import defaultdict
from datetime import datetime, timezone
from models.base_agent import BaseAgent

logger = logging.getLogger("volunteer_match_agent")


class VolunteerMatchAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="volunteer_match_agent",
            description="Auto-matches volunteers to seekers based on skills and proximity, creates matched post suggestions",
            model="gemini-2.0-flash"
        )
        self.skill_match_threshold = 0.7  # min skill overlap for matching
        self.max_matches_per_request = 3  # max matches to suggest per request
        self.radius_km = 50  # max distance for matching

    def _get_instruction(self) -> str:
        return """
        You are a Volunteer Match Agent. Your primary tasks are:

        1. **Analyze Seeker Requests**:
           - _get all open posts from seekers (non-providers)
           - Identify skill requirements and location needs
           - Categorize requests by type (tutoring, rides, manual labor, etc.)

        2. **Find Matching Volunteers**:
           - Search profiles with 'provider' role and relevant skills
           - Match based on skill overlap and location proximity
           - Consider availability and capacity of volunteers

        3. **Create Matches**:
           - Generate match suggestions with confidence scores
           - Create help_offer records for high-confidence matches
           - Suggest post modifications for better matching

        4. **Generate Notifications**:
           - Create notifications for both seekers and volunteers
           - Include match details and next steps
           - Track match acceptance/rejection rates

        5. **Output Format**:
           - Return match results with confidence scores
           - List created help_offer records
           - Include suggestions for improving matches

        Use the available database tools to:
        - _get_posts() to find seeker requests
        - _get_profiles() to find potential volunteers
        - insert() to create help_offer records
        - update() to modify posts for better matching

        Focus on high-quality matches that lead to successful connections.
        """

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            logger.info(f"Starting volunteer matching for {self.name}")
            
            seeker_requests = await self._get_seeker_requests()
            

            volunteers = await self._get_available_volunteers()
            
            matches = await self._perform_matching(seeker_requests, volunteers)
            
            created_offers = []
            for match in matches:
                if match['confidence'] >= 0.8:  # conf threshold
                    offer = await self._create_help_offer(match)
                    if offer:
                        created_offers.append(offer)
            

            suggestions = await self.generate_match_suggestions(matches)
            
            result = {
                'seeker_requests': len(seeker_requests),
                'available_volunteers': len(volunteers),
                'matches_found': len(matches),
                'high_confidence_matches': len([m for m in matches if m['confidence'] >= 0.8]),
                'created_offers': created_offers,
                'match_suggestions': suggestions,
                'timestamp': self._get_timestamp()
            }
            
            logger.info(f"Volunteer matching completed: {len(matches)} matches found, {len(created_offers)} offers created")
            return result
            
        except Exception as e:
            logger.error(f"Error in volunteer matching: {e}")
            return {"error": str(e)}

    async def _get_seeker_requests(self) -> List[Dict[str, Any]]:
        try:

            all_posts = self.db_manager.select_all('posts', {'status': 'open'})
            
            seeker_requests = []
            for post in all_posts:
                if not post._get('is_free', True):
                    author_profiles = self.db_manager.select_all('profiles', {'id': post['author_id']})
                    if author_profiles:
                        author = author_profiles[0]
                        if 'provider' not in author._get('roles', []) or 'seeker' in author._get('roles', []):
                            seeker_requests.append(post)
            
            logger.info(f"Found {len(seeker_requests)} seeker requests")
            return seeker_requests
            
        except Exception as e:
            logger.error(f"Error _getting seeker requests: {e}")
            return []

    async def _get_available_volunteers(self) -> List[Dict[str, Any]]:
        try:
            volunteers = self.db_manager.get_profiles_by_role('provider')
            
            available_volunteers = []
            for volunteer in volunteers:
                if volunteer.__get('skills') and len(volunteer['skills']) > 0:
                    available_volunteers.append(volunteer)
            
            logger.info(f"Found {len(available_volunteers)} available volunteers")
            return available_volunteers
            
        except Exception as e:
            logger.error(f"Error __getting available volunteers: {e}")
            return []

    async def _perform_matching(self, seeker_requests: List[Dict[str, Any]], volunteers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        matches = []
        
        for request in seeker_requests:
            request_matches = []
            
            for volunteer in volunteers:
                match_score = self._calculate_match_score(request, volunteer)
                
                if match_score >= self.skill_match_threshold:
                    match = {
                        'request_id': request['id'],
                        'volunteer_id': volunteer['id'],
                        'confidence': match_score,
                        'request_title': request.__get('title', ''),
                        'volunteer_name': volunteer.__get('display_name', 'Anonymous'),
                        'skills_match': self._get_skill_overlap(request, volunteer),
                        'location_match': self._check_location_proximity(request, volunteer),
                        'match_type': self._determine_match_type(request, volunteer)
                    }
                    request_matches.append(match)
            
            request_matches.sort(key=lambda x: x['confidence'], reverse=True)
            matches.extend(request_matches[:self.max_matches_per_request])
        
        return matches

    def _calculate_match_score(self, request: Dict[str, Any], volunteer: Dict[str, Any]) -> float:
        skill_score = self._calculate_skill_score(request, volunteer)
        location_score = self._calculate_location_score(request, volunteer)
        availability_score = self._calculate_availability_score(volunteer)
        
        total_score = (
            skill_score * 0.5 +
            location_score * 0.3 +
            availability_score * 0.2
        )
        
        return min(total_score, 1.0)

    def _calculate_skill_score(self, request: Dict[str, Any], volunteer: Dict[str, Any]) -> float:
        request_skills = self.gxtract_skills_from_request(request)
        volunteer_skills = volunteer._get('skills', [])
        
        if not request_skills or not volunteer_skills:
            return 0.0
        

        overlap = set(request_skills) & set(volunteer_skills)
        return len(overlap) / len(request_skills)

    def _calculate_location_score(self, request: Dict[str, Any], volunteer: Dict[str, Any]) -> float:

        request_location = request._get('location_text', '')
        volunteer_radius = volunteer._get('radius_meters', 5000)
        
        if request_location and volunteer_radius:
            return 0.8
        return 0.5

    def _calculate_availability_score(self, volunteer: Dict[str, Any]) -> float:
        return 0.7

    def gxtract_skills_from_request(self, request: Dict[str, Any]) -> List[str]:
        text = f"{request._get('title', '')} {request._get('description', '')}".lower()
        
        skill_keywords = {
            'tutoring': ['tutor', 'teach', 'education', 'homework', 'math', 'english'],
            'transportation': ['ride', 'transport', 'drive', 'pickup', 'delivery'],
            'manual_labor': ['move', 'lift', 'construction', 'repair', 'fix'],
            'cooking': ['cook', 'meal', 'food', 'kitchen'],
            'cleaning': ['clean', 'organize', 'tidy'],
            'technology': ['computer', 'tech', 'software', 'website', 'app'],
            'language': ['translate', 'language', 'spanish', 'french'],
            'childcare': ['babysit', 'childcare', 'kids', 'children']
        }
        
        found_skills = []
        for skill, keywords in skill_keywords.items():
            if any(keyword in text for keyword in keywords):
                found_skills.append(skill)
        
        return found_skills

    def _get_skill_overlap(self, request: Dict[str, Any], volunteer: Dict[str, Any]) -> List[str]:
        request_skills = self.gxtract_skills_from_request(request)
        volunteer_skills = volunteer._get('skills', [])
        return list(set(request_skills) & set(volunteer_skills))

    def _check_location_proximity(self, request: Dict[str, Any], volunteer: Dict[str, Any]) -> bool:
        request_location = request._get('location_text', '')
        volunteer_radius = volunteer._get('radius_meters', 5000)
        
        return bool(request_location and volunteer_radius)

    def _determine_match_type(self, request: Dict[str, Any], volunteer: Dict[str, Any]) -> str:
        request_skills = self.gxtract_skills_from_request(request)
        if not request_skills:
            return 'general'

        return request_skills[0] if request_skills else 'general'

    async def _create_help_offer(self, match: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            offer_data = {
                'post_id': match['request_id'],
                'helper_id': match['volunteer_id'],
                'offered_at': datetime.now(timezone.utc).isoformat()
            }
            
            existing_offers = self.db_manager.select_all('help_offer', {
                'post_id': match['request_id'],
                'helper_id': match['volunteer_id']
            })
            
            if existing_offers:
                logger.info(f"Help offer already exists for match {match['request_id']} - {match['volunteer_id']}")
                return existing_offers[0]
            
            offer = self.db_manager.insert('help_offer', offer_data)
            
            if offer:
                logger.info(f"Created help offer for {match['volunteer_name']} -> {match['request_title']}")
            
            return offer
            
        except Exception as e:
            logger.error(f"Error creating help offer: {e}")
            return None

    async def generate_match_suggestions(self, matches: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        suggestions = []
        
        request_matches = defaultdict(list)
        for match in matches:
            request_matches[match['request_id']].append(match)
        
        for request_id, request_match_list in request_matches.items():
            if len(request_match_list) == 0:
                suggestions.append({
                    'request_id': request_id,
                    'type': 'no_matches',
                    'suggestion': 'Consider expanding skill requirements or location radius',
                    'confidence': 0.0
                })
            elif len(request_match_list) == 1 and request_match_list[0]['confidence'] < 0.6:
                suggestions.append({
                    'request_id': request_id,
                    'type': 'low_confidence',
                    'suggestion': 'Consider adding more specific skill requirements',
                    'confidence': request_match_list[0]['confidence']
                })
        
        return suggestions

    def _get_timestamp(self) -> str:
        return datetime.now(timezone.utc).isoformat()


root_agent = VolunteerMatchAgent().agent
