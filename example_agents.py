import asyncio
import json
import logging
from datetime import datetime, timezone

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("example_usage")

async def example_supply_demand_analysis():
    try:
        from models import AgentRunner
        
        runner = AgentRunner()
        

        result = await runner.run_supply_demand_analysis()
        
        print("Supply-Demand Analysis Results:")
        print(f"- Analysis completed: {result.get('status') == 'completed'}")
        print(f"- Categories analyzed: {len(result.get('result', {}).get('analysis', {}))}")
        print(f"- Shortages detected: {len(result.get('result', {}).get('created_needs', []))}")
        
        return result
        
    except Exception as e:
        logger.error(f"Error in supply-demand analysis: {e}")
        return None

async def example_org_sync():
    try:
        from models import AgentRunner
        
        runner = AgentRunner()
        
        sync_data = [
            {
                'org_id': 'foodbank-001',
                'name': 'Community Food Bank',
                'type': 'foodbank',
                'capacity_percent': 25, 
                'operating_hours': '9:00-17:00',
                'shortages': ['canned_vegetables', 'baby_formula'],
                'location': 'Downtown',
                'phone': '555-0101'
            }
        ]
        
        result = await runner.run_org_sync({'sync_data': sync_data})
        
        print("Organization Sync Results:")
        print(f"- Sync completed: {result.get('status') == 'completed'}")
        print(f"- Organizations synced: {len(result.get('result', {}).get('sync_results', []))}")
        print(f"- Urgent needs found: {len(result.get('result', {}).get('urgent_needs', []))}")
        
        return result
        
    except Exception as e:
        logger.error(f"Error in organization sync: {e}")
        return None

async def example_volunteer_matching():
    try:
        from models import AgentRunner
        
        runner = AgentRunner()
    
        result = await runner.run_volunteer_matching()
        
        print("Volunteer Matching Results:")
        print(f"- Matching completed: {result.get('status') == 'completed'}")
        print(f"- Seeker requests: {result.get('result', {}).get('seeker_requests', 0)}")
        print(f"- Available volunteers: {result.get('result', {}).get('available_volunteers', 0)}")
        print(f"- Matches found: {result.get('result', {}).get('matches_found', 0)}")
        
        return result
        
    except Exception as e:
        logger.error(f"Error in volunteer matching: {e}")
        return None

async def example_full_cycle():
    try:
        from models import AgentRunner
        
        runner = AgentRunner()
        
        result = await runner.run_full_cycle()
        
        print("Full Cycle Results:")
        print(f"- Cycle completed: {result.get('cycle_summary', {}).get('completed', 0)} agents")
        print(f"- Total execution time: {result.get('cycle_summary', {}).get('total_execution_time', 0):.2f}s")
        print(f"- Insights generated: {len(result.get('insights', []))}")
        print(f"- Recommendations: {len(result.get('recommendations', []))}")
        
        return result
        
    except Exception as e:
        logger.error(f"Error in full cycle: {e}")
        return None

async def example_custom_input():
    try:
        from models import AgentRunner
        
        runner = AgentRunner()
        
        custom_input = {
            'priority_categories': ['food', 'shelter', 'healthcare'],
            'location_focus': 'downtown',
            'urgency_threshold': 0.8,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        result = await runner.run_full_cycle(custom_input)
        
        print("Custom Input Results:")
        print(f"- Custom cycle completed: {result.get('cycle_summary', {}).get('completed', 0)} agents")
        
        return result
        
    except Exception as e:
        logger.error(f"Error with custom input: {e}")
        return None

async def main():
    print("=" * 60)
    print("Multi-Modal Agent System - Usage Examples")
    print("=" * 60)
    
    # Example 1: Supply-Demand Analysis
    print("\n1. Supply-Demand Analysis Example")
    print("-" * 40)
    await example_supply_demand_analysis()
    
    # Example 2: Organization Sync
    print("\n2. Organization Sync Example")
    print("-" * 40)
    await example_org_sync()
    
    # Example 3: Volunteer Matching
    print("\n3. Volunteer Matching Example")
    print("-" * 40)
    await example_volunteer_matching()
    
    # Example 4: Full Cycle
    print("\n4. Full Agent Cycle Example")
    print("-" * 40)
    await example_full_cycle()
    
    # Example 5: Custom Input
    print("\n5. Custom Input Example")
    print("-" * 40)
    await example_custom_input()
    
    print("\n" + "=" * 60)
    print("All examples completed!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
