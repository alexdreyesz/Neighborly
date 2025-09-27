from google.adk.agents import Agent
from google.adk.tools import google_search
from pydantic import BaseModel, Field


root_agent = Agent(name='summary_prob', 
                   model='gemini-2.0-flash',
                    description='Summary Agent', 
                   instruction=""" 
                   You are a Summary Agent.
                    You are given a topic.
                     Your task is to provide a concise explanation of the topic, 
                    highlight its importance, list common challenges, and suggest possible solutions 
                    or future directions.

                    You have the following tools at your disposal:
                    -google_search 
                    """,
                    tools=[google_search])