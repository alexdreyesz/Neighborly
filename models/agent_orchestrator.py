import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone, timedelta
from dataclasses import dataclass
from enum import Enum

from .base_agent import BaseAgent
from .supply_demand_balencer.agent import SupplyDemandBalancerAgent
from .org_sync_agent.agent import OrgSyncAgent
from .volunteer_match_agent.agent import VolunteerMatchAgent
from .event_analysis_agent.agent import EventAnalysisAgent

logger = logging.getLogger("agent_orchestrator")


class AgentStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


@dataclass
class AgentResult:
    agent_name: str
    status: AgentStatus
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    execution_time: Optional[float] = None
    timestamp: Optional[str] = None


class AgentOrchestrator:
    def __init__(self):
        self.agents = {
            'supply_demand_balancer': SupplyDemandBalancerAgent(),
            'org_sync_agent': OrgSyncAgent(),
            'volunteer_match_agent': VolunteerMatchAgent(),
            'event_analysis_agent': EventAnalysisAgent()
        }
        self.execution_history = []
        self.is_running = False
        
    async def run_full_cycle(self, input_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if self.is_running:
            logger.warning("Orchestrator is already running, skipping cycle")
            return {"error": "Orchestrator already running"}
        
        self.is_running = True
        start_time = datetime.now(timezone.utc)
        
        try:
            logger.info("Starting full agent cycle")
            
    
            cycle_input = input_data or {}
            cycle_input['cycle_id'] = start_time.isoformat()
            cycle_input['timestamp'] = start_time.isoformat()

            results = await self._execute_agent_sequence(cycle_input)
            
    
            aggregated_results = self._aggregate_results(results)
            
            execution_record = {
                'cycle_id': cycle_input['cycle_id'],
                'start_time': start_time.isoformat(),
                'end_time': datetime.now(timezone.utc).isoformat(),
                'results': results,
                'aggregated_results': aggregated_results,
                'status': 'completed'
            }
            self.execution_history.append(execution_record)
            
            logger.info(f"Full agent cycle completed in {execution_record['end_time']}")
            return aggregated_results
            
        except Exception as e:
            logger.error(f"Error in full agent cycle: {e}")
            return {"error": str(e)}
        finally:
            self.is_running = False

    async def run_single_agent(self, agent_name: str, input_data: Optional[Dict[str, Any]] = None) -> AgentResult:
        if agent_name not in self.agents:
            return AgentResult(
                agent_name=agent_name,
                status=AgentStatus.FAILED,
                error=f"Agent {agent_name} not found"
            )
        
        agent = self.agents[agent_name]
        start_time = datetime.now(timezone.utc)
        
        try:
            logger.info(f"Running agent: {agent_name}")
            
            result = await agent.process(input_data or {})
            execution_time = (datetime.now(timezone.utc) - start_time).total_seconds()
            
            return AgentResult(
                agent_name=agent_name,
                status=AgentStatus.COMPLETED,
                result=result,
                execution_time=execution_time,
                timestamp=start_time.isoformat()
            )
            
        except Exception as e:
            execution_time = (datetime.now(timezone.utc) - start_time).total_seconds()
            logger.error(f"Error running agent {agent_name}: {e}")
            
            return AgentResult(
                agent_name=agent_name,
                status=AgentStatus.FAILED,
                error=str(e),
                execution_time=execution_time,
                timestamp=start_time.isoformat()
            )

    async def _execute_agent_sequence(self, input_data: Dict[str, Any]) -> List[AgentResult]:
        results = []
        
        execution_plan = [
            {
                'name': 'org_sync_agent',
                'description': 'Sync organization data first to get current state',
                'dependencies': []
            },
            {
                'name': 'event_analysis_agent',
                'description': 'Analyze events to identify community needs',
                'dependencies': []
            },
            {
                'name': 'supply_demand_balancer',
                'description': 'Analyze supply-demand after org sync and event analysis',
                'dependencies': ['org_sync_agent', 'event_analysis_agent']
            },
            {
                'name': 'volunteer_match_agent',
                'description': 'Match volunteers after understanding current needs',
                'dependencies': ['supply_demand_balancer']
            }
        ]
        
        for step in execution_plan:
            agent_name = step['name']
            dependencies = step['dependencies']
            if not self._check_dependencies(dependencies, results):
                logger.warning(f"Skipping {agent_name} due to failed dependencies")
                results.append(AgentResult(
                    agent_name=agent_name,
                    status=AgentStatus.SKIPPED,
                    error="Dependencies failed"
                ))
                continue
            
            step_input = self._prepare_step_input(input_data, step, results)
            
            result = await self.run_single_agent(agent_name, step_input)
            results.append(result)
            
            await asyncio.sleep(1) #try not to overwhelm database
        
        return results

    def _check_dependencies(self, dependencies: List[str], results: List[AgentResult]) -> bool:
        for dep in dependencies:
            dep_result = next((r for r in results if r.agent_name == dep), None)
            if not dep_result or dep_result.status != AgentStatus.COMPLETED:
                return False
        return True

    def _prepare_step_input(self, base_input: Dict[str, Any], step: Dict[str, Any], results: List[AgentResult]) -> Dict[str, Any]:
        step_input = base_input.copy()
        
        for dep in step['dependencies']:
            dep_result = next((r for r in results if r.agent_name == dep), None)
            if dep_result and dep_result.result:
                step_input[f'{dep}_result'] = dep_result.result
        

        step_input['step_name'] = step['name']
        step_input['step_description'] = step['description']
        
        return step_input

    def _aggregate_results(self, results: List[AgentResult]) -> Dict[str, Any]:
        aggregated = {
            'cycle_summary': {
                'total_agents': len(results),
                'completed': len([r for r in results if r.status == AgentStatus.COMPLETED]),
                'failed': len([r for r in results if r.status == AgentStatus.FAILED]),
                'skipped': len([r for r in results if r.status == AgentStatus.SKIPPED]),
                'total_execution_time': sum(r.execution_time or 0 for r in results)
            },
            'agent_results': {},
            'insights': [],
            'recommendations': []
        }
        
        for result in results:
            aggregated['agent_results'][result.agent_name] = {
                'status': result.status.value,
                'execution_time': result.execution_time,
                'timestamp': result.timestamp,
                'result': result.result,
                'error': result.error
            }
        
        aggregated['insights'] = self._generate_insights(results)
        
        aggregated['recommendations'] = self._generate_recommendations(results)
        
        return aggregated

    def _generate_insights(self, results: List[AgentResult]) -> List[str]:

        insights = []
        

        supply_demand_result = next((r for r in results if r.agent_name == 'supply_demand_balancer'), None)
        if supply_demand_result and supply_demand_result.result:
            analysis = supply_demand_result.result.get('analysis', {})
            shortage_count = len([a for a in analysis.values() if a.get('is_shortage', False)])
            if shortage_count > 0:
                insights.append(f"Detected {shortage_count} categories with supply shortages")
        

        org_sync_result = next((r for r in results if r.agent_name == 'org_sync_agent'), None)
        if org_sync_result and org_sync_result.result:
            urgent_needs = org_sync_result.result.get('urgent_needs', [])
            if urgent_needs:
                insights.append(f"Found {len(urgent_needs)} urgent organizational needs")
        
        volunteer_result = next((r for r in results if r.agent_name == 'volunteer_match_agent'), None)
        if volunteer_result and volunteer_result.result:
            matches = volunteer_result.result.get('matches_found', 0)
            if matches > 0:
                insights.append(f"Generated {matches} volunteer-seeker matches")
        
        # Analyze event analysis results
        event_result = next((r for r in results if r.agent_name == 'event_analysis_agent'), None)
        if event_result and event_result.result:
            total_events = event_result.result.get('total_events', 0)
            urgent_events = event_result.result.get('urgent_events', 0)
            if total_events > 0:
                insights.append(f"Analyzed {total_events} events, {urgent_events} urgent")
        
        return insights

    def _generate_recommendations(self, results: List[AgentResult]) -> List[str]:
        recommendations = []
        
        failed_agents = [r for r in results if r.status == AgentStatus.FAILED]
        if failed_agents:
            recommendations.append(f"Review and fix {len(failed_agents)} failed agents")
        

        slow_agents = [r for r in results if r.execution_time and r.execution_time > 30]
        if slow_agents:
            recommendations.append("Consider optimizing slow-running agents")
        
        supply_demand_result = next((r for r in results if r.agent_name == 'supply_demand_balancer'), None)
        if supply_demand_result and supply_demand_result.result:
            created_needs = supply_demand_result.result.get('created_needs', [])
            if len(created_needs) > 5:
                recommendations.append("High number of shortage alerts - consider immediate action")
        
        return recommendations

    def get_execution_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        return self.execution_history[-limit:]

    def get_agent_status(self) -> Dict[str, str]:
        return {
            agent_name: "available" if agent else "unavailable"
            for agent_name, agent in self.agents.items()
        }

    async def schedule_periodic_execution(self, interval_minutes: int = 60):
        logger.info(f"Scheduling periodic execution every {interval_minutes} minutes")
        
        while True:
            try:
                await self.run_full_cycle()
                await asyncio.sleep(interval_minutes * 60)
            except Exception as e:
                logger.error(f"Error in periodic execution: {e}")
                await asyncio.sleep(60)  # Wait 1 minute before retrying


orchestrator = AgentOrchestrator()

