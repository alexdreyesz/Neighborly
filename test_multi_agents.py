import asyncio
import json
import logging
from datetime import datetime, timezone

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("test_agents")

async def test_agent_system():
    try:
        from models import AgentRunner
        
        logger.info("Initializing Agent Runner...")
        runner = AgentRunner()
        
        logger.info("Getting system status...")
        status = runner.get_system_status()
        print("System Status:")
        print(json.dumps(status, indent=2, default=str))
        
        logger.info("Testing Supply-Demand Balancer Agent...")
        supply_result = await runner.run_supply_demand_analysis()
        print("\nSupply-Demand Analysis Result:")
        print(json.dumps(supply_result, indent=2, default=str))
        
        logger.info("Testing Organization Sync Agent...")
        org_result = await runner.run_org_sync()
        print("\nOrganization Sync Result:")
        print(json.dumps(org_result, indent=2, default=str))
        
        logger.info("Testing Volunteer Match Agent...")
        volunteer_result = await runner.run_volunteer_matching()
        print("\nVolunteer Matching Result:")
        print(json.dumps(volunteer_result, indent=2, default=str))
        
        # Test full cycle
        logger.info("Testing Full Agent Cycle...")
        full_result = await runner.run_full_cycle()
        print("\nFull Cycle Result:")
        print(json.dumps(full_result, indent=2, default=str))
        
        logger.info("All tests completed successfully!")
        
    except ImportError as e:
        logger.error(f"Import error: {e}")
        logger.info("Make sure you have installed all dependencies:")
        logger.info("pip install google-adk supabase python-dotenv")
    except Exception as e:
        logger.error(f"Test error: {e}")
        raise

async def test_individual_agents():
    try:
        from models.base_agent import DatabaseManager
        from models.supply_demand_balencer.agent import SupplyDemandBalancerAgent
        from models.org_sync_agent.agent import OrgSyncAgent
        from models.volunteer_match_agent.agent import VolunteerMatchAgent
        
        logger.info("Testing individual agent components...")
        
        # Test SD agent
        logger.info("Creating Supply-Demand Balancer Agent...")
        supply_agent = SupplyDemandBalancerAgent()
        print(f"Created agent: {supply_agent.name}")
        
        # Test org agent
        logger.info("Creating Organization Sync Agent...")
        org_agent = OrgSyncAgent()
        print(f"Created agent: {org_agent.name}")
        
        # Test volunter agent
        logger.info("Creating Volunteer Match Agent...")
        volunteer_agent = VolunteerMatchAgent()
        print(f"Created agent: {volunteer_agent.name}")
        
        logger.info("Individual agent tests completed!")
        
    except Exception as e:
        logger.error(f"Individual agent test error: {e}")
        raise

def main():
    print("=" * 60)
    print("Multi-Modal Agent System Test")
    print("=" * 60)

    asyncio.run(test_individual_agents())
    
    print("\n" + "=" * 60)
    print("Full System Test")
    print("=" * 60)

    asyncio.run(test_agent_system())

if __name__ == "__main__":
    main()
