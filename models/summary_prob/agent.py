from google.adk.agents import Agent
from google.adk.tools import google_search


root_agent = Agent(name='summary_prob', 
                   model='gemini-2.0-flash',
                    description='Summary Agent', 
                       instruction=""" 
                        You are a Summary Agent.
                        You are given a topic.
                        Your task is to provide a concise explanation of the topic, 
                        highlight its importance, list common challenges, and suggest possible solutions 
                        or future directions.

                        Structure your response as follows:
                        1. Brief explanation of the topic
                        2. Why it's important
                        3. Common challenges
                        4. Possible solutions or future directions
                        
                        Use the google_search tool to gather current and relevant information.
                        Provide specific examples and recent developments when possible.
                        """,

                    tools=[google_search])