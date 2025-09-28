
# import logging
# from typing import Dict, Any, List, Optional, Tuple
# from collections import defaultdict
# from datetime import datetime, timezone
# from models.base_agent import BaseAgent

# logger = logging.getLogger("volunteer_match_agent")


# class VolunteerMatchAgent(BaseAgent):
#     def __init__(self):
#         super().__init__(
#             name="volunteer_match_agent",
#             description="Auto-matches volunteers to seekers based on skills and proximity, creates matched post suggestions",
#             model="gemini-2.0-flash"
#         )
#         self.skill_match_threshold = 0.7  # min skill overlap for matching
#         self.max_matches_per_request = 3  # max matches to suggest per request
#         self.radius_km = 50  # max distance for matching

#     def _get_instruction(self) -> str:
#         return """
#         You are a Volunteer Match Agent. Your primary tasks are:

#         1. **Analyze Seeker Requests**:
#            - _get all open posts from seekers (non-providers)
#            - Identify skill requirements and location needs
#            - Categorize requests by type (tutoring, rides, manual labor, etc.)

#         2. **Find Matching Volunteers**:
#            - Search profiles with 'provider' role and relevant skills
#            - Match based on skill overlap and location proximity
#            - Consider availability and capacity of volunteers

#         3. **Create Matches**:
#            - Generate match suggestions with confidence scores
#            - Create help_offer records for high-confidence matches
#            - Suggest post modifications for better matching

#         4. **Generate Notifications**:
#            - Create notifications for both seekers and volunteers
#            - Include match details and next steps
#            - Track match acceptance/rejection rates

#         5. **Output Format**:
#            - Return match results with confidence scores
#            - List created help_offer records
#            - Include suggestions for improving matches

#         Use the available database tools to:
#         - _get_posts() to find seeker requests
#         - _get_profiles() to find potential volunteers
#         - insert() to create help_offer records
#         - update() to modify posts for better matching

#         Focus on high-quality matches that lead to successful connections.
#         """

#     async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
#         try:
#             logger.info(f"Starting volunteer matching for {self.name}")
            
#             seeker_requests = await self._get_seeker_requests()
            

#             volunteers = await self._get_available_volunteers()
            
#             matches = await self._perform_matching(seeker_requests, volunteers)
            
#             created_offers = []
#             for match in matches:
#                 if match['confidence'] >= 0.8:  # conf threshold
#                     offer = await self._create_help_offer(match)
#                     if offer:
#                         created_offers.append(offer)
            

#             suggestions = await self.generate_match_suggestions(matches)
            
#             result = {
#                 'seeker_requests': len(seeker_requests),
#                 'available_volunteers': len(volunteers),
#                 'matches_found': len(matches),
#                 'high_confidence_matches': len([m for m in matches if m['confidence'] >= 0.8]),
#                 'created_offers': created_offers,
#                 'match_suggestions': suggestions,
#                 'timestamp': self._get_timestamp()
#             }
            
#             logger.info(f"Volunteer matching completed: {len(matches)} matches found, {len(created_offers)} offers created")
#             return result
            
#         except Exception as e:
#             logger.error(f"Error in volunteer matching: {e}")
#             return {"error": str(e)}

#     async def _get_seeker_requests(self) -> List[Dict[str, Any]]:
#         try:

#             all_posts = self.db_manager.select_all('posts', {'status': 'open'})
            
#             seeker_requests = []
#             for post in all_posts:
#                 if not post.get('is_free', True):
#                     author_profiles = self.db_manager.select_all('profiles', {'id': post['author_id']})
#                     if author_profiles:
#                         author = author_profiles[0]
#                         if 'provider' not in author.get('roles', []) or 'seeker' in author.get('roles', []):
#                             seeker_requests.append(post)
            
#             logger.info(f"Found {len(seeker_requests)} seeker requests")
#             return seeker_requests
            
#         except Exception as e:
#             logger.error(f"Error _getting seeker requests: {e}")
#             return []

#     async def _get_available_volunteers(self) -> List[Dict[str, Any]]:
#         try:
#             volunteers = self.db_manager.get_profiles_by_role('provider')
            
#             available_volunteers = []
#             for volunteer in volunteers:
#                 if volunteer.get('skills') and len(volunteer['skills']) > 0:
#                     available_volunteers.append(volunteer)
            
#             logger.info(f"Found {len(available_volunteers)} available volunteers")
#             return available_volunteers
            
#         except Exception as e:
#             logger.error(f"Error __getting available volunteers: {e}")
#             return []

#     async def _perform_matching(self, seeker_requests: List[Dict[str, Any]], volunteers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
#         matches = []
        
#         for request in seeker_requests:
#             request_matches = []
            
#             for volunteer in volunteers:
#                 match_score = self._calculate_match_score(request, volunteer)
                
#                 if match_score >= self.skill_match_threshold:
#                     match = {
#                         'request_id': request['id'],
#                         'volunteer_id': volunteer['id'],
#                         'confidence': match_score,
#                         'request_title': request.get('title', ''),
#                         'volunteer_name': volunteer.get('display_name', 'Anonymous'),
#                         'skills_match': self._get_skill_overlap(request, volunteer),
#                         'location_match': self._check_location_proximity(request, volunteer),
#                         'match_type': self._determine_match_type(request, volunteer)
#                     }
#                     request_matches.append(match)
            
#             request_matches.sort(key=lambda x: x['confidence'], reverse=True)
#             matches.extend(request_matches[:self.max_matches_per_request])
        
#         return matches

#     def _calculate_match_score(self, request: Dict[str, Any], volunteer: Dict[str, Any]) -> float:
#         skill_score = self._calculate_skill_score(request, volunteer)
#         location_score = self._calculate_location_score(request, volunteer)
#         availability_score = self._calculate_availability_score(volunteer)
        
#         total_score = (
#             skill_score * 0.5 +
#             location_score * 0.3 +
#             availability_score * 0.2
#         )
        
#         return min(total_score, 1.0)

#     def _calculate_skill_score(self, request: Dict[str, Any], volunteer: Dict[str, Any]) -> float:
#         request_skills = self.extract_skills_from_request(request)
#         volunteer_skills = volunteer.get('skills', [])
        
#         if not request_skills or not volunteer_skills:
#             return 0.0
        

#         overlap = set(request_skills) & set(volunteer_skills)
#         return len(overlap) / len(request_skills)

#     def _calculate_location_score(self, request: Dict[str, Any], volunteer: Dict[str, Any]) -> float:

#         request_location = request.get('location_text', '')
#         volunteer_radius = volunteer.get('radius_meters', 5000)
        
#         if request_location and volunteer_radius:
#             return 0.8
#         return 0.5

#     def _calculate_availability_score(self, volunteer: Dict[str, Any]) -> float:
#         return 0.7

#     def extract_skills_from_request(self, request: Dict[str, Any]) -> List[str]:
#         text = f"{request.get('title', '')} {request.get('description', '')}".lower()
        
#         skill_keywords = {
#             'tutoring': ['tutor', 'teach', 'education', 'homework', 'math', 'english'],
#             'transportation': ['ride', 'transport', 'drive', 'pickup', 'delivery'],
#             'manual_labor': ['move', 'lift', 'construction', 'repair', 'fix'],
#             'cooking': ['cook', 'meal', 'food', 'kitchen'],
#             'cleaning': ['clean', 'organize', 'tidy'],
#             'technology': ['computer', 'tech', 'software', 'website', 'app'],
#             'language': ['translate', 'language', 'spanish', 'french'],
#             'childcare': ['babysit', 'childcare', 'kids', 'children']
#         }
        
#         found_skills = []
#         for skill, keywords in skill_keywords.items():
#             if any(keyword in text for keyword in keywords):
#                 found_skills.append(skill)
        
#         return found_skills

#     def _get_skill_overlap(self, request: Dict[str, Any], volunteer: Dict[str, Any]) -> List[str]:
#         request_skills = self.extract_skills_from_request(request)
#         volunteer_skills = volunteer.get('skills', [])
#         return list(set(request_skills) & set(volunteer_skills))

#     def _check_location_proximity(self, request: Dict[str, Any], volunteer: Dict[str, Any]) -> bool:
#         request_location = request.get('location_text', '')
#         volunteer_radius = volunteer.get('radius_meters', 5000)
        
#         return bool(request_location and volunteer_radius)

#     def _determine_match_type(self, request: Dict[str, Any], volunteer: Dict[str, Any]) -> str:
#         request_skills = self.extract_skills_from_request(request)
#         if not request_skills:
#             return 'general'

#         return request_skills[0] if request_skills else 'general'

#     async def _create_help_offer(self, match: Dict[str, Any]) -> Optional[Dict[str, Any]]:
#         try:
#             offer_data = {
#                 'post_id': match['request_id'],
#                 'helper_id': match['volunteer_id'],
#                 'offered_at': datetime.now(timezone.utc).isoformat()
#             }
            
#             existing_offers = self.db_manager.select_all('help_offer', {
#                 'post_id': match['request_id'],
#                 'helper_id': match['volunteer_id']
#             })
            
#             if existing_offers:
#                 logger.info(f"Help offer already exists for match {match['request_id']} - {match['volunteer_id']}")
#                 return existing_offers[0]
            
#             offer = self.db_manager.insert('help_offer', offer_data)
            
#             if offer:
#                 logger.info(f"Created help offer for {match['volunteer_name']} -> {match['request_title']}")
            
#             return offer
            
#         except Exception as e:
#             logger.error(f"Error creating help offer: {e}")
#             return None

#     async def generate_match_suggestions(self, matches: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
#         suggestions = []
        
#         request_matches = defaultdict(list)
#         for match in matches:
#             request_matches[match['request_id']].append(match)
        
#         for request_id, request_match_list in request_matches.items():
#             if len(request_match_list) == 0:
#                 suggestions.append({
#                     'request_id': request_id,
#                     'type': 'no_matches',
#                     'suggestion': 'Consider expanding skill requirements or location radius',
#                     'confidence': 0.0
#                 })
#             elif len(request_match_list) == 1 and request_match_list[0]['confidence'] < 0.6:
#                 suggestions.append({
#                     'request_id': request_id,
#                     'type': 'low_confidence',
#                     'suggestion': 'Consider adding more specific skill requirements',
#                     'confidence': request_match_list[0]['confidence']
#                 })
        
#         return suggestions

#     def _get_timestamp(self) -> str:
#         return datetime.now(timezone.utc).isoformat()


# root_agent = VolunteerMatchAgent().agent


import logging
from typing import Dict, Any, List, Optional, Tuple
from collections import defaultdict
from datetime import datetime, timezone, timedelta
from models.base_agent import BaseAgent

logger = logging.getLogger("volunteer_match_agent")


class VolunteerMatchAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="volunteer_match_agent",
            description="Auto-matches volunteers to seekers based on skills and proximity, creates matched post suggestions and events",
            model="gemini-2.0-flash"
        )
        self.skill_match_threshold = 0.7  # min skill overlap for matching
        self.max_matches_per_request = 3  # max matches to suggest per request
        self.radius_km = 50  # max distance for matching
        self.event_creation_threshold = 0.8  # confidence threshold for auto-event creation

    def _get_instruction(self) -> str:
        return """
        You are a Volunteer Match Agent. Your primary tasks are:

        1. **Analyze Seeker Requests**:
           - Get all open posts from seekers (non-providers)
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

        4. **Create Events**:
           - Generate events based on successful help_offer matches
           - Set appropriate event timing and duration
           - Include both volunteer and seeker as participants
           - Add relevant event details and location information

        5. **Generate Notifications**:
           - Create notifications for both seekers and volunteers
           - Include match details and next steps
           - Track match acceptance/rejection rates

        6. **Output Format**:
           - Return match results with confidence scores
           - List created help_offer records
           - Include created events with details
           - Include suggestions for improving matches

        Use the available database tools to:
        - _get_posts() to find seeker requests
        - _get_profiles() to find potential volunteers
        - insert() to create help_offer records
        - insert() to create events from successful matches
        - update() to modify posts for better matching

        Focus on high-quality matches that lead to successful connections and productive events.
        """

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            logger.info(f"Starting volunteer matching for {self.name}")
            
            seeker_requests = await self._get_seeker_requests()
            volunteers = await self._get_available_volunteers()
            matches = await self._perform_matching(seeker_requests, volunteers)
            
            created_offers = []
            created_events = []
            
            for match in matches:
                if match['confidence'] >= 0.8:  # confidence threshold
                    # Create help offer
                    offer = await self._create_help_offer(match)
                    if offer:
                        created_offers.append(offer)
                        
                        # Create event based on the help offer
                        event = await self._create_event_from_offer(match, offer)
                        if event:
                            created_events.append(event)
            
            suggestions = await self.generate_match_suggestions(matches)
            
            result = {
                'seeker_requests': len(seeker_requests),
                'available_volunteers': len(volunteers),
                'matches_found': len(matches),
                'high_confidence_matches': len([m for m in matches if m['confidence'] >= 0.8]),
                'created_offers': created_offers,
                'created_events': created_events,
                'match_suggestions': suggestions,
                'timestamp': self._get_timestamp()
            }
            
            logger.info(f"Volunteer matching completed: {len(matches)} matches found, {len(created_offers)} offers created, {len(created_events)} events created")
            return result
            
        except Exception as e:
            logger.error(f"Error in volunteer matching: {e}")
            return {"error": str(e)}

    async def _get_seeker_requests(self) -> List[Dict[str, Any]]:
        try:
            all_posts = self.db_manager.select_all('posts', {'status': 'open'})
            
            seeker_requests = []
            for post in all_posts:
                if not post.get('is_free', True):
                    author_profiles = self.db_manager.select_all('profiles', {'id': post['author_id']})
                    if author_profiles:
                        author = author_profiles[0]
                        if 'provider' not in author.get('roles', []) or 'seeker' in author.get('roles', []):
                            seeker_requests.append(post)
            
            logger.info(f"Found {len(seeker_requests)} seeker requests")
            return seeker_requests
            
        except Exception as e:
            logger.error(f"Error getting seeker requests: {e}")
            return []

    async def _get_available_volunteers(self) -> List[Dict[str, Any]]:
        try:
            volunteers = self.db_manager.get_profiles_by_role('provider')
            
            available_volunteers = []
            for volunteer in volunteers:
                if volunteer.get('skills') and len(volunteer['skills']) > 0:
                    available_volunteers.append(volunteer)
            
            logger.info(f"Found {len(available_volunteers)} available volunteers")
            return available_volunteers
            
        except Exception as e:
            logger.error(f"Error getting available volunteers: {e}")
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
                        'request_title': request.get('title', ''),
                        'request_description': request.get('description', ''),
                        'volunteer_name': volunteer.get('display_name', 'Anonymous'),
                        'volunteer_email': volunteer.get('email', ''),
                        'skills_match': self._get_skill_overlap(request, volunteer),
                        'location_match': self._check_location_proximity(request, volunteer),
                        'location_text': request.get('location_text', ''),
                        'match_type': self._determine_match_type(request, volunteer),
                        'seeker_id': request.get('author_id')
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
        request_skills = self.extract_skills_from_request(request)
        volunteer_skills = volunteer.get('skills', [])
        
        if not request_skills or not volunteer_skills:
            return 0.0

        overlap = set(request_skills) & set(volunteer_skills)
        return len(overlap) / len(request_skills)

    def _calculate_location_score(self, request: Dict[str, Any], volunteer: Dict[str, Any]) -> float:
        request_location = request.get('location_text', '')
        volunteer_radius = volunteer.get('radius_meters', 5000)
        
        if request_location and volunteer_radius:
            return 0.8
        return 0.5

    def _calculate_availability_score(self, volunteer: Dict[str, Any]) -> float:
        return 0.7

    def extract_skills_from_request(self, request: Dict[str, Any]) -> List[str]:
        text = f"{request.get('title', '')} {request.get('description', '')}".lower()
        
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
        request_skills = self.extract_skills_from_request(request)
        volunteer_skills = volunteer.get('skills', [])
        return list(set(request_skills) & set(volunteer_skills))

    def _check_location_proximity(self, request: Dict[str, Any], volunteer: Dict[str, Any]) -> bool:
        request_location = request.get('location_text', '')
        volunteer_radius = volunteer.get('radius_meters', 5000)
        
        return bool(request_location and volunteer_radius)

    def _determine_match_type(self, request: Dict[str, Any], volunteer: Dict[str, Any]) -> str:
        request_skills = self.extract_skills_from_request(request)
        if not request_skills:
            return 'general'

        return request_skills[0] if request_skills else 'general'

    async def _create_help_offer(self, match: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            offer_data = {
                'post_id': match['request_id'],
                'helper_id': match['volunteer_id'],
                'offered_at': datetime.now(timezone.utc).isoformat(),
                'status': 'pending'
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

    async def _create_event_from_offer(self, match: Dict[str, Any], offer: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create an event based on a successful help offer"""
        try:
            # Determine event timing based on match type
            event_duration, suggested_start_time = self._determine_event_timing(match['match_type'])
            
            # Create event data
            event_data = {
                'title': f"Volunteer Help: {match['request_title']}",
                'description': self._generate_event_description(match),
                'location': match.get('location_text', 'TBD'),
                'start_time': suggested_start_time.isoformat(),
                'end_time': (suggested_start_time + event_duration).isoformat(),
                'created_by': match['volunteer_id'],  # Volunteer creates the event
                'event_type': 'volunteer_help',
                'status': 'scheduled',
                'help_offer_id': offer.get('id'),
                'post_id': match['request_id'],
                'metadata': {
                    'match_confidence': match['confidence'],
                    'skills_involved': match['skills_match'],
                    'match_type': match['match_type'],
                    'auto_created': True
                },
                'created_at': datetime.now(timezone.utc).isoformat(),
                'updated_at': datetime.now(timezone.utc).isoformat()
            }
            
            # Check if event already exists for this help offer
            existing_events = self.db_manager.select_all('events', {
                'help_offer_id': offer.get('id')
            })
            
            if existing_events:
                logger.info(f"Event already exists for help offer {offer.get('id')}")
                return existing_events[0]
            
            # Create the event
            event = self.db_manager.insert('events', event_data)
            
            if event:
                # Create event participants (volunteer and seeker)
                await self._create_event_participants(event, match)
                logger.info(f"Created event '{event_data['title']}' for help offer {offer.get('id')}")
            
            return event
            
        except Exception as e:
            logger.error(f"Error creating event from offer: {e}")
            return None

    async def _create_event_participants(self, event: Dict[str, Any], match: Dict[str, Any]) -> None:
        """Create event participants for both volunteer and seeker"""
        try:
            participants = [
                {
                    'event_id': event.get('id'),
                    'user_id': match['volunteer_id'],
                    'role': 'volunteer',
                    'status': 'accepted',  # Volunteer auto-accepts since they created the offer
                    'created_at': datetime.now(timezone.utc).isoformat()
                },
                {
                    'event_id': event.get('id'),
                    'user_id': match['seeker_id'],
                    'role': 'recipient',
                    'status': 'invited',  # Seeker needs to accept
                    'created_at': datetime.now(timezone.utc).isoformat()
                }
            ]
            
            for participant_data in participants:
                # Check if participant already exists
                existing = self.db_manager.select_all('event_participants', {
                    'event_id': event.get('id'),
                    'user_id': participant_data['user_id']
                })
                
                if not existing:
                    self.db_manager.insert('event_participants', participant_data)
                    logger.info(f"Added participant {participant_data['user_id']} to event {event.get('id')}")
            
        except Exception as e:
            logger.error(f"Error creating event participants: {e}")

    def _determine_event_timing(self, match_type: str) -> Tuple[timedelta, datetime]:
        """Determine appropriate event duration and suggested start time based on match type"""
        now = datetime.now(timezone.utc)
        
        # Default to next day at 10 AM
        suggested_start = now.replace(hour=10, minute=0, second=0, microsecond=0) + timedelta(days=1)
        
        # Adjust timing based on match type
        timing_rules = {
            'tutoring': (timedelta(hours=1), suggested_start.replace(hour=16)),  # 4 PM, 1 hour
            'transportation': (timedelta(minutes=30), suggested_start.replace(hour=9)),  # 9 AM, 30 min
            'manual_labor': (timedelta(hours=3), suggested_start.replace(hour=10)),  # 10 AM, 3 hours
            'cooking': (timedelta(hours=2), suggested_start.replace(hour=11)),  # 11 AM, 2 hours
            'cleaning': (timedelta(hours=2), suggested_start.replace(hour=10)),  # 10 AM, 2 hours
            'technology': (timedelta(hours=1.5), suggested_start.replace(hour=14)),  # 2 PM, 1.5 hours
            'language': (timedelta(hours=1), suggested_start.replace(hour=16)),  # 4 PM, 1 hour
            'childcare': (timedelta(hours=4), suggested_start.replace(hour=9)),  # 9 AM, 4 hours
            'general': (timedelta(hours=1), suggested_start)  # Default
        }
        
        return timing_rules.get(match_type, timing_rules['general'])

    def _generate_event_description(self, match: Dict[str, Any]) -> str:
        """Generate a descriptive event description based on the match"""
        description_parts = [
            f"Volunteer help session for: {match['request_title']}",
            f"Volunteer: {match['volunteer_name']}",
            f"Skills involved: {', '.join(match['skills_match'])}",
            f"Match confidence: {match['confidence']:.0%}"
        ]
        
        if match.get('request_description'):
            description_parts.append(f"Details: {match['request_description'][:200]}...")
        
        description_parts.extend([
            "",
            "This event was automatically created based on a volunteer match.",
            "Please coordinate final details directly with each other."
        ])
        
        return "\n".join(description_parts)

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
            elif len(request_match_list) > 0:
                high_confidence_matches = [m for m in request_match_list if m['confidence'] >= self.event_creation_threshold]
                if high_confidence_matches:
                    suggestions.append({
                        'request_id': request_id,
                        'type': 'events_created',
                        'suggestion': f'Created {len(high_confidence_matches)} events from high-confidence matches',
                        'confidence': max(m['confidence'] for m in high_confidence_matches)
                    })
        
        return suggestions

    def _get_timestamp(self) -> str:
        return datetime.now(timezone.utc).isoformat()


root_agent = VolunteerMatchAgent().agent