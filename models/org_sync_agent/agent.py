from google.adk.agents import Agent
import json

#simulation_data = json.load(open("data/sim_data/safety_trust_data.json"))

root_agent = Agent(
    name='org_sync_agent',
    model='gemini-2.0-flash',
    description="An agent that ensures the safety and trustworthiness of users. " \
    "remember to only respond with medium, low, or high and nothing else",
    instruction="Given the user profiles and their posts, create a risk level for the post," \
    " you can only respond with 'LOW', 'MEDIUM',  or 'HIGH'."
)




