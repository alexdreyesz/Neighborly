
import asyncio
import argparse
import logging
import json
from typing import Dict, Any, Optional
from datetime import datetime, timezone

from .agent_orchestrator import orchestrator
from .base_agent import BaseAgent


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("agent_runner")


class AgentRunner:

    def __init__(self):
        self.orchestrator = orchestrator
    
    async def run_full_cycle(self, input_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:

        logger.info("Starting full agent cycle")
        return await self.orchestrator.run_full_cycle(input_data)
    
    async def run_single_agent(self, agent_name: str, input_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        logger.info(f"Running single agent: {agent_name}")
        result = await self.orchestrator.run_single_agent(agent_name, input_data)
        return {
            'agent_name': result.agent_name,
            'status': result.status.value,
            'result': result.result,
            'error': result.error,
            'execution_time': result.execution_time,
            'timestamp': result.timestamp
        }
    
    async def run_supply_demand_analysis(self) -> Dict[str, Any]:
        return await self.run_single_agent('supply_demand_balancer')
    
    async def run_org_sync(self, sync_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        input_data = {'sync_data': sync_data} if sync_data else {}
        return await self.run_single_agent('org_sync_agent', input_data)
    
    async def run_volunteer_matching(self) -> Dict[str, Any]:
        return await self.run_single_agent('volunteer_match_agent')
    
    async def run_event_analysis(self) -> Dict[str, Any]:
        return await self.run_single_agent('event_analysis_agent')
    
    def get_system_status(self) -> Dict[str, Any]:
        return {
            'orchestrator_running': self.orchestrator.is_running,
            'agent_status': self.orchestrator.get_agent_status(),
            'execution_history': self.orchestrator.get_execution_history(5),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }


async def main():
    parser = argparse.ArgumentParser(description="Multi-Modal Agent System Runner")
    parser.add_argument('--mode', choices=['full', 'supply-demand', 'org-sync', 'volunteer-match', 'status'], 
                       default='full', help='Execution mode')
    parser.add_argument('--input-file', help='JSON file with input data')
    parser.add_argument('--output-file', help='JSON file to save results')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose logging')
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    runner = AgentRunner()
    
    try:

        input_data = None
        if args.input_file:
            with open(args.input_file, 'r') as f:
                input_data = json.load(f)
        

        if args.mode == 'full':
            result = await runner.run_full_cycle(input_data)
        elif args.mode == 'supply-demand':
            result = await runner.run_supply_demand_analysis()
        elif args.mode == 'org-sync':
            result = await runner.run_org_sync(input_data)
        elif args.mode == 'volunteer-match':
            result = await runner.run_volunteer_matching()
        elif args.mode == 'status':
            result = runner.get_system_status()
        

        if args.output_file:
            with open(args.output_file, 'w') as f:
                json.dump(result, f, indent=2, default=str)
            print(f"Results saved to {args.output_file}")
        else:
            print(json.dumps(result, indent=2, default=str))
    
    except Exception as e:
        logger.error(f"Error in main execution: {e}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(asyncio.run(main()))

