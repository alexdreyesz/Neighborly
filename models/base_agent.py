import os
import asyncio
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Callable
from abc import ABC, abstractmethod
from google.adk.agents import Agent, InvocationContext
from google.adk.tools import FunctionTool
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("agents")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("SUPABASE_URL and SUPABASE_KEY environment variables must be set.")
    raise SystemExit("Missing Supabase credentials")


class DatabaseManager:    
    def __init__(self, supabase_client: Client):
        self.client = supabase_client

    def select_all(self, table_name: str, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        try:
            query = self.client.table(table_name).select("*")
            if filters:
                for k, v in filters.items():
                    query = query.eq(k, v)
            res = query.execute()
            data = getattr(res, "data", None)
            return data or []
        except Exception as e:
            logger.exception("Error selecting from %s: %s", table_name, e)
            return []

    def select_with_join(self, table_name: str, join_table: str, join_condition: str, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:

        try:
            query = self.client.table(table_name).select(f"*, {join_table}(*)")
            if filters:
                for k, v in filters.items():
                    query = query.eq(k, v)
            res = query.execute()
            data = getattr(res, "data", None)
            return data or []
        except Exception as e:
            logger.exception("Error selecting with join from %s: %s", table_name, e)
            return []

    def insert(self, table_name: str, record: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            res = self.client.table(table_name).insert(record).execute()
            return getattr(res, "data", None)
        except Exception as e:
            logger.exception("Error inserting into %s: %s", table_name, e)
            return None

    def update(self, table_name: str, updates: Dict[str, Any], match: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            query = self.client.table(table_name).update(updates)
            for k, v in match.items():
                query = query.eq(k, v)
            res = query.execute()
            return getattr(res, "data", None)
        except Exception as e:
            logger.exception("Error updating %s: %s", table_name, e)
            return None

    def upsert(self, table_name: str, record: Dict[str, Any], on_conflict: Optional[List[str]] = None):
        try:
            if on_conflict:
                res = self.client.table(table_name).upsert(record, on_conflict=on_conflict).execute()
            else:
                res = self.client.table(table_name).upsert(record).execute()
            return getattr(res, "data", None)
        except Exception as e:
            logger.exception("Error upserting into %s: %s", table_name, e)
            return None

    def get_posts_by_category(self, category: str, status: str = 'open') -> List[Dict[str, Any]]:
        return self.select_all('posts', {'categories': category, 'status': status})

    def get_profiles_by_skills(self, skills: List[str]) -> List[Dict[str, Any]]:
        try:
            query = self.client.table('profiles').select("*")
            for skill in skills:
                query = query.contains('skills', [skill])
            res = query.execute()
            return getattr(res, "data", None) or []
        except Exception as e:
            logger.exception("Error getting profiles by skills: %s", e)
            return []

    def get_profiles_by_role(self, role: str) -> List[Dict[str, Any]]:
        try:
            query = self.client.table('profiles').select("*")
            query = query.contains('roles', [role])
            res = query.execute()
            return getattr(res, "data", None) or []
        except Exception as e:
            logger.exception("Error getting profiles by role: %s", e)
            return []

    def get_organizations_by_type(self, org_types: List[str]) -> List[Dict[str, Any]]:
        try:
            query = self.client.table('organization').select("*")
            for org_type in org_types:
                query = query.contains('types', [org_type])
            res = query.execute()
            return getattr(res, "data", None) or []
        except Exception as e:
            logger.exception("Error getting organizations by type: %s", e)
            return []

    def create_top_need(self, location: str, category_id: int, score: float, details: Dict[str, Any], window_hours: int = 24) -> Optional[Dict[str, Any]]:
        now = datetime.now(timezone.utc)
        window_end = now + timedelta(hours=window_hours)
        record = {
            'location': location,
            'window_start': now.isoformat(),
            'window_end': window_end.isoformat(),
            'category_id': category_id,
            'score': score,
            'details': details,
            'created_at': now.isoformat()
        }
        return self.insert('top_needs', record)


class BaseAgent(ABC):
    def __init__(self, name: str, description: str, model: str = 'gemini-2.0-flash'):
        self.name = name
        self.description = description
        self.model = model
        self.db_manager = None
        self.agent = None
        self._setup_database()
        self._create_agent()

    def _setup_database(self):
        try:
            supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
            self.db_manager = DatabaseManager(supabase_client)
            logger.info(f"Database connection established for {self.name}")
        except Exception as e:
            logger.error(f"Failed to setup database for {self.name}: {e}")
            raise

    def _create_agent(self):
        tools = self._get_database_tools()
        self.agent = Agent(
            name=self.name,
            model=self.model,
            description=self.description,
            instruction=self._get_instruction(),
            tools=tools
        )

    def _get_database_tools(self) -> List[FunctionTool]:

        return [
            FunctionTool(self._tool_get_posts),
            FunctionTool(self._tool_get_profiles),
            FunctionTool(self._tool_get_organizations),
            FunctionTool(self._tool_get_events),
            FunctionTool(self._tool_create_top_need),
            FunctionTool(self._tool_update_post),
            FunctionTool(self._tool_get_categories)
        ]

    def _tool_get_posts(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        return self.db_manager.select_all('posts', filters)

    def _tool_get_profiles(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        return self.db_manager.select_all('profiles', filters)

    def _tool_get_organizations(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        return self.db_manager.select_all('organization', filters)

    def _tool_get_events(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        return self.db_manager.select_all('events', filters)

    def _tool_create_top_need(self, location: str, category_id: int, score: float, details: Dict[str, Any], window_hours: int = 24) -> Optional[Dict[str, Any]]:
        return self.db_manager.create_top_need(location, category_id, score, details, window_hours)

    def _tool_update_post(self, post_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        return self.db_manager.update('posts', updates, {'id': post_id})

    def _tool_get_categories(self) -> List[Dict[str, Any]]:
        return self.db_manager.select_all('categories')

    @abstractmethod
    def _get_instruction(self) -> str:
        pass

    @abstractmethod
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        pass

    async def invoke(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            result = await self.agent.invoke(input_data)
            return result
        except Exception as e:
            logger.error(f"Error invoking {self.name}: {e}")
            return {"error": str(e)}
