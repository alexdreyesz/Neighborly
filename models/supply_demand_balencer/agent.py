from google.adk.agents import Agent

#postgre superbase

root_agent = Agent(
    name='safety_trust',
    model='gemini-2.0-flash',
    description="An agent that detects shortages (e.g., “4 requests for diapers, only 1 offer nearby”)",
    instruction="Raise that category in Top Needs + pings providers who have similar items in profile."
)

