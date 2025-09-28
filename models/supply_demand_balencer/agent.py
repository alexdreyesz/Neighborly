import logging
from typing import Dict, Any, List, Optional
from collections import defaultdict, Counter
from models.base_agent import BaseAgent

logger = logging.getLogger("supply_demand_balancer")


class SupplyDemandBalancerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="supply_demand_balancer",
            description="Detects shortages by analyzing offers vs requests and raises categories in Top Needs",
            model="gemini-2.0-flash"
        )
        self.shortage_threshold = 0.3  # if requests > offers * (1 + threshold), it's a shortage
        self.minimum_requests = 3  # min requests to consider a shortage

    def _get_instruction(self) -> str:
        return """
        You are a Supply-Demand Balancer Agent. Your primary tasks are:

        1. **Analyze Supply vs Demand**: 
           - Get all open posts (both offers and requests) by category
           - Count requests vs offers for each category
           - Identify categories with significant shortages

        2. **Detect Shortages**:
           - A shortage exists when: (requests - offers) / max(offers, 1) > 0.3
           - Minimum 3 requests required to consider a shortage
           - Consider location proximity (within radius_meters)

        3. **Raise Top Needs**:
           - Create top_need entries for shortage categories
           - Score based on severity: (requests - offers) / requests
           - Include details about the shortage (request count, offer count, locations)

        4. **Notify Providers**:
           - Find profiles with relevant skills/items for shortage categories
           - Update their profiles or create notifications

        5. **Output Format**:
           - Return analysis results with shortage categories
           - Include created top_need entries
           - List notified providers

        Use the available database tools to:
        - get_posts() to analyze current supply/demand
        - get_profiles() to find potential providers
        - create_top_need() to raise shortage alerts
        - get_categories() to understand category structure

        Focus on actionable insights and immediate shortage resolution.
        """

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            logger.info(f"Starting supply-demand analysis for {self.name}")
            
            posts = self.db_manager.select_all('posts', {'status': 'open'})
            categories = self.db_manager.select_all('categories')
            

            category_analysis = self._analyze_category_shortages(posts, categories)
            

            created_needs = []
            for category, analysis in category_analysis.items():
                if analysis['is_shortage']:
                    need = await self._create_shortage_alert(category, analysis)
                    if need:
                        created_needs.append(need)
            
            notified_providers = await self._notify_providers(category_analysis)
            
            result = {
                'analysis': category_analysis,
                'created_needs': created_needs,
                'notified_providers': notified_providers,
                'timestamp': self._get_timestamp()
            }
            
            logger.info(f"Supply-demand analysis completed: {len(created_needs)} needs created")
            return result
            
        except Exception as e:
            logger.error(f"Error in supply-demand analysis: {e}")
            return {"error": str(e)}

    def _analyze_category_shortages(self, posts: List[Dict[str, Any]], categories: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
        category_map = {cat['slug']: cat for cat in categories}
        analysis = {}
        
        category_posts = defaultdict(list)
        for post in posts:
            if post.get('categories'):
                category_posts[post['categories']].append(post)
        
        for category_slug, category_posts_list in category_posts.items():
            if category_slug not in category_map:
                continue
                
            category = category_map[category_slug]
            requests = [p for p in category_posts_list if not p.get('is_free', True)]
            offers = [p for p in category_posts_list if p.get('is_free', True)]
            
            request_count = len(requests)
            offer_count = len(offers)
            
            shortage_ratio = (request_count - offer_count) / max(offer_count, 1) if offer_count > 0 else float('inf')
            is_shortage = (request_count >= self.minimum_requests and 
                          shortage_ratio > self.shortage_threshold)
            
            request_locations = [p.get('location_text', 'Unknown') for p in requests]
            offer_locations = [p.get('location_text', 'Unknown') for p in offers]
            
            analysis[category_slug] = {
                'category_id': category['id'],
                'category_title': category['title'],
                'request_count': request_count,
                'offer_count': offer_count,
                'shortage_ratio': shortage_ratio,
                'is_shortage': is_shortage,
                'request_locations': request_locations,
                'offer_locations': offer_locations,
                'severity_score': (request_count - offer_count) / max(request_count, 1) if request_count > 0 else 0
            }
        
        return analysis

    async def _create_shortage_alert(self, category_slug: str, analysis: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            location_counter = Counter(analysis['request_locations'])
            primary_location = location_counter.most_common(1)[0][0] if location_counter else 'Unknown'
            
            details = {
                'category': category_slug,
                'request_count': analysis['request_count'],
                'offer_count': analysis['offer_count'],
                'shortage_ratio': analysis['shortage_ratio'],
                'request_locations': analysis['request_locations'],
                'offer_locations': analysis['offer_locations'],
                'urgency': 'high' if analysis['severity_score'] > 0.7 else 'medium'
            }
            
            need = self.db_manager.create_top_need(
                location=primary_location,
                category_id=analysis['category_id'],
                score=analysis['severity_score'],
                details=details,
                window_hours=48  # 48-hour window for shortage alerts
            )
            
            if need:
                logger.info(f"Created shortage alert for {category_slug} in {primary_location}")
            
            return need
            
        except Exception as e:
            logger.error(f"Error creating shortage alert for {category_slug}: {e}")
            return None

    async def _notify_providers(self, category_analysis: Dict[str, Dict[str, Any]]) -> List[Dict[str, Any]]:
        notified = []
        
        for category_slug, analysis in category_analysis.items():
            if not analysis['is_shortage']:
                continue
            

            providers = self.db_manager.get_profiles_by_role('provider')
            
            org_types = self._get_relevant_org_types(category_slug)
            organizations = []
            for org_type in org_types:
                orgs = self.db_manager.get_organizations_by_type([org_type])
                organizations.extend(orgs)
            
        
            for provider in providers[:5]:  #  top 5 providers
                notification = {
                    'provider_id': provider['id'],
                    'category': category_slug,
                    'shortage_details': analysis,
                    'notification_type': 'shortage_alert',
                    'created_at': self._get_timestamp()
                }
                notified.append(notification)
            
            for org in organizations[:3]:  #  top 3 organizations
                notification = {
                    'organization_id': org['id'],
                    'category': category_slug,
                    'shortage_details': analysis,
                    'notification_type': 'shortage_alert',
                    'created_at': self._get_timestamp()
                }
                notified.append(notification)
        
        logger.info(f"Notified {len(notified)} providers about shortages")
        return notified

    def _get_relevant_org_types(self, category_slug: str) -> List[str]:
    
        category_mapping = {
            'food': ['foodbank'],
            'clothing': ['shelter'],
            'education': ['school'],
            'healthcare': ['clinic'],
            'shelter': ['shelter'],
            'transportation': ['shelter', 'clinic']
        }
        
       
        for keyword, org_types in category_mapping.items():
            if keyword in category_slug.lower():
                return org_types
        
        return ['shelter', 'foodbank'] 
    
    def _get_timestamp(self) -> str:
        from datetime import datetime, timezone
        return datetime.now(timezone.utc).isoformat()


root_agent = SupplyDemandBalancerAgent().agent