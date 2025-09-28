import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone
from dotenv import load_dotenv
import os
from supabase import create_client, Client
from models.base_agent import DatabaseManager
from models.supply_demand_balencer.agent import SupplyDemandBalancerAgent
from models.org_sync_agent.agent import OrgSyncAgent
from models.volunteer_match_agent.agent import VolunteerMatchAgent
from models import AgentRunner
import math
from typing import Dict, Any, List


def safe_float(value):
    if isinstance(value, float):
        if math.isinf(value) or math.isnan(value):
            return None 
    return value

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("test_agents")

db_manager = create_client(SUPABASE_URL, SUPABASE_KEY)

class AgentResultUploader:
    def __init__(self, supabase_client: Client):
        self.db = supabase_client
        
    def upload_supply_demand_results(self, supply_result: Dict[Any, Any]) -> bool:
        try:
            if supply_result["status"] != "completed":
                logger.warning(f"Supply-demand agent failed: {supply_result.get('error')}")
                return False
                
            analysis = supply_result["result"]["analysis"]
            timestamp = supply_result["timestamp"]
            
            top_needs_entries = []
            
            for _, data in analysis.items():

                if data.get("is_shortage", False) or data.get("severity_score", 0) > 0.5 or data.get("offer_count", 0) == 0:
                    for location in data.get("request_locations", []):
                        entry = {
                            "location": location,
                            "window_start": timestamp,
                            "window_end": datetime.fromisoformat(timestamp.replace('Z', '+00:00')).replace(tzinfo=timezone.utc).isoformat(),
                            "category_id": data.get("category_id"),
                            "score": float(data.get("severity_score", 0)),
                            "details": {
                                "agent_source": "supply_demand_balancer",
                                "shortage_ratio": safe_float(data.get("shortage_ratio")),
                                "request_count": data.get("request_count"),
                                "offer_count": data.get("offer_count"),
                                "category_title": data.get("category_title"),
                                "analysis_timestamp": timestamp
                            }
                        }
                        top_needs_entries.append(entry)

            if top_needs_entries:
                self.db.table("top_needs").upsert(top_needs_entries).execute()
                logger.info(f"✅ Uploaded {len(top_needs_entries)} supply-demand entries to top_needs")
            else:
                logger.info("❌ No significant shortages found in supply-demand analysis")
                
            return True
                
        except Exception as e:
            logger.error(f"❌ Error uploading supply-demand results: {e}")
            return False

    def upload_org_sync_results(self, org_result: Dict[Any, Any]) -> bool:
        try:
            if org_result["status"] != "completed":
                logger.warning(f"Org sync agent failed: {org_result.get('error')}")
                return False
                
            result = org_result["result"]
            
    
            created_needs = result.get("created_needs", [])
            if created_needs:
                top_needs_entries = []
                for need in created_needs:
                    entry = {
                        "location": need["location"],
                        "window_start": need["window_start"],
                        "window_end": need["window_end"],
                        "category_id": need["category_id"],
                        "score": need["score"],
                        "details": need["details"]
                    }
                    top_needs_entries.append(entry)
                self.db.table("top_needs").insert(top_needs_entries).execute()
                logger.info(f"Uploaded {len(top_needs_entries)} org sync needs to top_needs")
            

            sync_results = result.get("sync_results", [])
            for org_data in sync_results:
                org_id = org_data["org_id"] 
                org_status = {
                    "org_id": org_id,
                    "capacity_percent": org_data["capacity_percent"],
                    "shortages": org_data["shortages"],
                    "operating_hours": org_data["operating_hours"],
                    "location": org_data["location"],
                    "last_sync": result["timestamp"],
                    "status": "active"
                }
                try:
                    self.db.table("org_status").upsert(org_status, on_conflict="org_id").execute()
                except Exception as e:
                    logger.warning(f"Could not update org status for {org_id}: {e}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error uploading org sync results: {e}")
            return False

    def upload_volunteer_results(self, volunteer_result: Dict[Any, Any]) -> bool:
        try:
            if volunteer_result["status"] != "completed":
                logger.warning(f"Volunteer agent failed: {volunteer_result.get('error')}")
                return False
                
            result = volunteer_result["result"]
            
            created_offers = result.get("created_offers", [])
            if created_offers:
                self.db.table("help_offer").insert(created_offers).execute()
                logger.info(f"Uploaded {len(created_offers)} volunteer offers")
            

            created_events = result.get("created_events", [])
            if created_events:
                self.db.table("events").insert(created_events).execute()
                logger.info(f"Uploaded {len(created_events)} volunteer events")
            
    
            volunteer_stats = {
                "seeker_requests": result.get("seeker_requests", 0),
                "available_volunteers": result.get("available_volunteers", 0),
                "matches_found": result.get("matches_found", 0),
                "high_confidence_matches": result.get("high_confidence_matches", 0),
                "match_suggestions": json.dumps(result.get("match_suggestions", [])),
                "timestamp": result.get("timestamp"),
                "agent_source": "volunteer_match_agent"
            }
            try:
                self.db.table("volunteer_analytics").insert(volunteer_stats).execute()
                logger.info("Uploaded volunteer matching analytics")
            except Exception as e:
                logger.warning(f"Could not upload volunteer analytics: {e}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error uploading volunteer results: {e}")
            return False


# ----------------- TESTING FUNCTIONS ----------------- #

async def test_agent_system_with_upload():
    uploader = AgentResultUploader(db_manager)
    
    try:
        logger.info("Initializing Agent Runner...")
        runner = AgentRunner()
        
        logger.info("Getting system status...")
        status = runner.get_system_status()
        print("System Status:")
        print(json.dumps(status, indent=2, default=str))

        # Run supply-demand agent
        logger.info("Testing Supply-Demand Balancer Agent...")
        supply_result = await runner.run_supply_demand_analysis()
        print("\nSupply-Demand Analysis Result:")
        print(json.dumps(supply_result, indent=2, default=str))
        uploader.upload_supply_demand_results(supply_result)
    
        # Run organization sync agent
        logger.info("Testing Organization Sync Agent...")
        org_result = await runner.run_org_sync()
        print("\nOrganization Sync Result:")
        print(json.dumps(org_result, indent=2, default=str))
        uploader.upload_org_sync_results(org_result)
        
        # Run volunteer match agent
        logger.info("Testing Volunteer Match Agent...")
        volunteer_result = await runner.run_volunteer_matching()
        print("\nVolunteer Matching Result:")
        print(json.dumps(volunteer_result, indent=2, default=str))
        uploader.upload_volunteer_results(volunteer_result)
        
    except Exception as e:
        logger.error(f"Test error: {e}")
        raise

async def test_individual_agents():
    logger.info("Testing individual agent components...")
    
    supply_agent = SupplyDemandBalancerAgent()
    logger.info(f"Created agent: {supply_agent.name}")

    org_agent = OrgSyncAgent()
    logger.info(f"Created agent: {org_agent.name}")

    volunteer_agent = VolunteerMatchAgent()
    logger.info(f"Created agent: {volunteer_agent.name}")
    
    logger.info("Individual agent tests completed!")

# ----------------- MAIN ----------------- #

def main():
    print("=" * 60)
    print("Multi-Modal Agent System Test with Database Upload")
    print("=" * 60)
    
    asyncio.run(test_individual_agents())
    
    print("\n" + "=" * 60)
    print("Full System Test with Upload")
    print("=" * 60)
    asyncio.run(test_agent_system_with_upload())

if __name__ == "__main__":
    main()
