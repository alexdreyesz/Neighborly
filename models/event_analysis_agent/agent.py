
import logging
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone, timedelta
from models.base_agent import BaseAgent

logger = logging.getLogger("event_analysis_agent")


class EventAnalysisAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="event_analysis_agent",
            description="Analyzes events to identify community needs and generate relevant posts/offers",
            model="gemini-2.0-flash"
        )
        self.event_analysis_window_days = 30  #
        self.capacity_threshold = 0.8  

    def _get_instruction(self) -> str:
        return """
        You are an Event Analysis Agent. Your primary tasks are:

        1. **Analyze Events**:
           - Get all events from the database
           - Identify events with high capacity utilization
           - Detect events that might need additional resources or volunteers
           - Analyze event patterns and community needs

        2. **Generate Community Needs**:
           - Create posts for events that need volunteers
           - Generate offers for events that need resources
           - Identify recurring event patterns that suggest ongoing needs

        3. **Event-Community Integration**:
           - Link events to relevant categories
           - Match events with available volunteers
           - Create help offers for event-related needs

        4. **Output Format**:
           - Return analysis of all events
           - List generated posts and offers
           - Include recommendations for event improvements

        Use the available database tools to:
        - get_events() to analyze current events
        - get_posts() to check existing event-related posts
        - get_profiles() to find potential event volunteers
        - create_top_need() to highlight urgent event needs

        Focus on actionable insights that help the community support events.
        """

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            logger.info(f"Starting event analysis for {self.name}")

            events = self.db_manager.select_all('events')
        
            event_analysis = self._analyze_events(events)
            
            generated_posts = []
            for event in events:
                if self._event_needs_support(event):
                    post = await self._generate_event_support_post(event)
                    if post:
                        generated_posts.append(post)
            
            created_needs = []
            for event in events:
                if self._event_is_urgent(event):
                    need = await self._create_event_top_need(event)
                    if need:
                        created_needs.append(need)
            
            result = {
                'total_events': len(events),
                'events_analyzed': len(event_analysis),
                'events_needing_support': len([e for e in events if self._event_needs_support(e)]),
                'urgent_events': len([e for e in events if self._event_is_urgent(e)]),
                'generated_posts': generated_posts,
                'created_needs': created_needs,
                'event_analysis': event_analysis,
                'timestamp': self._get_timestamp()
            }
            
            logger.info(f"Event analysis completed: {len(generated_posts)} posts generated, {len(created_needs)} needs created")
            return result
            
        except Exception as e:
            logger.error(f"Error in event analysis: {e}")
            return {"error": str(e)}

    def _analyze_events(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        analysis = []
        
        for event in events:
            event_analysis = {
                'event_id': event.get('id'),
                'title': event.get('title', 'Untitled Event'),
                'start_at': event.get('start_at'),
                'capacity': event.get('capacity'),
                'location': event.get('location_text', 'Unknown'),
                'org_id': event.get('org_id'),
                'needs_volunteers': self._needs_volunteers(event),
                'needs_resources': self._needs_resources(event),
                'capacity_utilization': self._calculate_capacity_utilization(event),
                'urgency_score': self._calculate_urgency_score(event)
            }
            analysis.append(event_analysis)
        
        return analysis

    def _event_needs_support(self, event: Dict[str, Any]) -> bool:

        start_at = event.get('start_at')
        if start_at:
            try:
                event_time = datetime.fromisoformat(start_at.replace('Z', '+00:00'))
                if event_time < datetime.now(timezone.utc):
                    return False  # Event is in the past
            except:
                pass
        
        capacity_util = self._calculate_capacity_utilization(event)
        if capacity_util > self.capacity_threshold:
            return True
        
        return self._needs_volunteers(event) or self._needs_resources(event)

    def _event_is_urgent(self, event: Dict[str, Any]) -> bool:
        start_at = event.get('start_at')
        if start_at:
            try:
                event_time = datetime.fromisoformat(start_at.replace('Z', '+00:00'))
                days_until_event = (event_time - datetime.now(timezone.utc)).days
                if days_until_event <= 7 and days_until_event >= 0:
                    return True
            except:
                pass
        
        capacity_util = self._calculate_capacity_utilization(event)
        return capacity_util > 0.9

    def _needs_volunteers(self, event: Dict[str, Any]) -> bool:
        capacity = event.get('capacity')
        return capacity and capacity > 50

    def _needs_resources(self, event: Dict[str, Any]) -> bool:
        description = event.get('description', '').lower()
        resource_keywords = ['need', 'require', 'looking for', 'seeking', 'help']
        return any(keyword in description for keyword in resource_keywords)

    def _calculate_capacity_utilization(self, event: Dict[str, Any]) -> float:
        return 0.5  # 50% 

    def _calculate_urgency_score(self, event: Dict[str, Any]) -> float:
        score = 0.0
        
        start_at = event.get('start_at')
        if start_at:
            try:
                event_time = datetime.fromisoformat(start_at.replace('Z', '+00:00'))
                days_until_event = (event_time - datetime.now(timezone.utc)).days
                if days_until_event <= 7:
                    score += 0.8
                elif days_until_event <= 14:
                    score += 0.5
                elif days_until_event <= 30:
                    score += 0.2
            except:
                pass
        
        # Capacity-based urgency
        capacity_util = self._calculate_capacity_utilization(event)
        if capacity_util > 0.9:
            score += 0.7
        elif capacity_util > 0.8:
            score += 0.4
        
        return min(score, 1.0)

    async def _generate_event_support_post(self, event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            if self._needs_volunteers(event):
                post_type = "volunteer_request"
                title = f"Volunteers needed for: {event.get('title', 'Community Event')}"
                description = f"Help make this event successful! {event.get('description', '')}"
            else:
                post_type = "resource_request"
                title = f"Resources needed for: {event.get('title', 'Community Event')}"
                description = f"Support this event with needed resources. {event.get('description', '')}"
            
            post_data = {
                'id': str(uuid.uuid4()),
                'title': title,
                'description': description,
                'categories': 'events',
                'is_free': False,  # This is a request
                'location_text': event.get('location_text', 'Unknown'),
                'org_id': event.get('org_id'),
                'status': 'open',
                'created_at': datetime.now(timezone.utc).isoformat()
            }
            
            post = self.db_manager.insert('posts', post_data)
            
            if post:
                logger.info(f"Generated support post for event: {event.get('title', 'Unknown')}")
            
            return post
            
        except Exception as e:
            logger.error(f"Error generating event support post: {e}")
            return None

    async def _create_event_top_need(self, event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            categories = self.db_manager.select_all('categories')
            event_category = next((cat for cat in categories if cat['slug'] == 'events'), None)
            category_id = event_category['id'] if event_category else categories[0]['id'] if categories else 1
            
            urgency_score = self._calculate_urgency_score(event)
            
            details = {
                'event_id': event.get('id'),
                'event_title': event.get('title', 'Unknown Event'),
                'start_at': event.get('start_at'),
                'capacity': event.get('capacity'),
                'needs_volunteers': self._needs_volunteers(event),
                'needs_resources': self._needs_resources(event),
                'source': 'event_analysis_agent'
            }
            
            need = self.db_manager.create_top_need(
                location=event.get('location_text', 'Unknown'),
                category_id=category_id,
                score=urgency_score,
                details=details,
                window_hours=168  # 7 days window for events
            )
            
            if need:
                logger.info(f"Created top need for urgent event: {event.get('title', 'Unknown')}")
            
            return need
            
        except Exception as e:
            logger.error(f"Error creating event top need: {e}")
            return None

    def _get_timestamp(self) -> str:
        return datetime.now(timezone.utc).isoformat()


root_agent = EventAnalysisAgent().agent
