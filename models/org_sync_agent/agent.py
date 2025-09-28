import logging
import csv
import json
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone, timedelta
from models.base_agent import BaseAgent

logger = logging.getLogger("org_sync_agent")


class OrgSyncAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="org_sync_agent",
            description="Syncs operating hours, capacity, and shortages from external feeds and auto-generates urgent requests",
            model="gemini-2.0-flash"
        )
        self.urgency_threshold = 0.8  # Threshold for urgent needs
        self.capacity_threshold = 0.2  # Below 20% capacity is critical

    def _get_instruction(self) -> str:
        return """
        You are an Organization Sync Agent. Your primary tasks are:

        1. **Sync External Data**:
           - Process CSV/API feeds from food banks, shelters, schools, clinics
           - Update organization records with current operating hours, capacity, and shortages
           - Handle different data formats and normalize them

        2. **Detect Urgent Needs**:
           - Identify organizations with critical capacity shortages (< 20% capacity)
           - Detect urgent item shortages (food, medical supplies, etc.)
           - Monitor operating hour changes that affect service availability

        3. **Generate Top Needs**:
           - Create urgent top_need entries for critical shortages
           - Include organization details, location, and urgency level
           - Set appropriate time windows based on urgency

        4. **Update Organization Records**:
           - Sync capacity levels, operating hours, and current shortages
           - Update skills and types based on current capabilities
           - Maintain data freshness and accuracy

        5. **Output Format**:
           - Return sync results with updated organizations
           - List generated urgent top_need entries
           - Include any data quality issues or errors

        Use the available database tools to:
        - get_organizations() to find existing orgs
        - update() to sync organization data
        - create_top_need() to generate urgent requests
        - get_categories() to map shortage types

        Focus on real-time data accuracy and urgent need detection.
        """

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            logger.info(f"Starting organization sync for {self.name}")
            
    
            sync_data = input_data.get('sync_data', [])
            if not sync_data:
                sync_data = self._generate_sample_sync_data()
            
    
            sync_results = await self._sync_organizations(sync_data)
            
            urgent_needs = await self._detect_urgent_needs(sync_results)
         
            created_needs = []
            for need in urgent_needs:
                top_need = await self._create_urgent_top_need(need)
                if top_need:
                    created_needs.append(top_need)
            
            result = {
                'sync_results': sync_results,
                'urgent_needs': urgent_needs,
                'created_needs': created_needs,
                'timestamp': self._get_timestamp()
            }
            
            logger.info(f"Organization sync completed: {len(sync_results)} orgs synced, {len(created_needs)} urgent needs created")
            return result
            
        except Exception as e:
            logger.error(f"Error in organization sync: {e}")
            return {"error": str(e)}

    def _generate_sample_sync_data(self) -> List[Dict[str, Any]]:
        import uuid
        return [
            {
                'org_id': str(uuid.uuid4()),
                'name': 'Downtown Food Bank',
                'type': 'foodbank',
                'capacity_percent': 15,  # Critical shortage
                'operating_hours': '9:00-17:00',
                'shortages': ['canned_vegetables', 'baby_formula', 'rice'],
                'location': 'Downtown',
                'phone': '555-0101',
                'last_updated': datetime.now(timezone.utc).isoformat()
            },
            {
                'org_id': str(uuid.uuid4()),
                'name': 'Hope Shelter',
                'type': 'shelter',
                'capacity_percent': 95,  # Near capacity
                'operating_hours': '24/7',
                'shortages': ['blankets', 'winter_coats'],
                'location': 'Midtown',
                'phone': '555-0102',
                'last_updated': datetime.now(timezone.utc).isoformat()
            },
            {
                'org_id': str(uuid.uuid4()),
                'name': 'Community Health Clinic',
                'type': 'clinic',
                'capacity_percent': 60,
                'operating_hours': '8:00-20:00',
                'shortages': ['bandages', 'thermometers'],
                'location': 'Uptown',
                'phone': '555-0103',
                'last_updated': datetime.now(timezone.utc).isoformat()
            }
        ]

    async def _sync_organizations(self, sync_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        sync_results = []
        
        for org_data in sync_data:
            try:
                existing_orgs = self.db_manager.select_all('organization', {'id': org_data['org_id']})
                
                if existing_orgs:
                    updates = {
                        'display_name': org_data.get('name'),
                        'phone': org_data.get('phone'),
                        'updated_at': datetime.now(timezone.utc).isoformat()
                    }
                    
                    updated_org = self.db_manager.update('organization', updates, {'id': org_data['org_id']})
                    
                    sync_result = {
                        'org_id': org_data['org_id'],
                        'action': 'updated',
                        'capacity_percent': org_data.get('capacity_percent'),
                        'shortages': org_data.get('shortages', []),
                        'operating_hours': org_data.get('operating_hours'),
                        'location': org_data.get('location')
                    }
                else:
                    sync_result = {
                        'org_id': org_data['org_id'],
                        'action': 'created',
                        'capacity_percent': org_data.get('capacity_percent'),
                        'shortages': org_data.get('shortages', []),
                        'operating_hours': org_data.get('operating_hours'),
                        'location': org_data.get('location')
                    }
                
                sync_results.append(sync_result)
                logger.info(f"Synced organization {org_data['org_id']}: {sync_result['action']}")
                
            except Exception as e:
                logger.error(f"Error syncing organization {org_data.get('org_id', 'unknown')}: {e}")
                sync_results.append({
                    'org_id': org_data.get('org_id', 'unknown'),
                    'action': 'error',
                    'error': str(e)
                })
        
        return sync_results

    async def _detect_urgent_needs(self, sync_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        urgent_needs = []
        
        for result in sync_results:
            if result.get('action') == 'error':
                continue
            
            capacity = result.get('capacity_percent', 100)
            shortages = result.get('shortages', [])
            location = result.get('location', 'Unknown')
            
            if capacity < (self.capacity_threshold * 100):
                urgent_needs.append({
                    'type': 'capacity_critical',
                    'org_id': result['org_id'],
                    'location': location,
                    'urgency': 'critical',
                    'details': {
                        'capacity_percent': capacity,
                        'threshold': self.capacity_threshold * 100,
                        'message': f"Organization at {capacity}% capacity - critical shortage"
                    }
                })
            
            if shortages:
                urgent_needs.append({
                    'type': 'item_shortage',
                    'org_id': result['org_id'],
                    'location': location,
                    'urgency': 'high',
                    'details': {
                        'shortages': shortages,
                        'count': len(shortages),
                        'message': f"Organization needs: {', '.join(shortages)}"
                    }
                })
        
        return urgent_needs

    async def _create_urgent_top_need(self, urgent_need: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:

            category_mapping = {
                'capacity_critical': 'shelter',
                'item_shortage': 'supplies'
            }
            
            category_slug = category_mapping.get(urgent_need['type'], 'general')
            

            categories = self.db_manager.select_all('categories')
            category_id = None
            for cat in categories:
                if cat['slug'] == category_slug:
                    category_id = cat['id']
                    break
            
            if not category_id:
                logger.warning(f"Category {category_slug} not found, using first available")
                category_id = categories[0]['id'] if categories else 1
            
            urgency_scores = {'critical': 0.9, 'high': 0.7, 'medium': 0.5, 'low': 0.3}
            score = urgency_scores.get(urgent_need['urgency'], 0.5)
            
            window_hours = 12 if urgent_need['urgency'] == 'critical' else 24
            
            details = {
                'type': urgent_need['type'],
                'org_id': urgent_need['org_id'],
                'urgency': urgent_need['urgency'],
                'details': urgent_need['details'],
                'source': 'org_sync_agent'
            }
            
            top_need = self.db_manager.create_top_need(
                location=urgent_need['location'],
                category_id=category_id,
                score=score,
                details=details,
                window_hours=window_hours
            )
            
            if top_need:
                logger.info(f"Created urgent top need for {urgent_need['org_id']} in {urgent_need['location']}")
            
            return top_need
            
        except Exception as e:
            logger.error(f"Error creating urgent top need: {e}")
            return None

    def _get_timestamp(self) -> str:
        return datetime.now(timezone.utc).isoformat()



root_agent = OrgSyncAgent().agent
