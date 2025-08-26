import asyncio
import os
import sys
from dotenv import load_dotenv
from uagents import Agent, Context
from uagents.setup import fund_agent_if_low
from protocols import agri_protocol
from models import FarmerReport, OperatorQuery, AgentResponse
from utils import load_seed_data, enrich_incident, generate_recommendation, should_raise_resource_request, get_resource_request_type
import json

# Load environment variables
load_dotenv()

# Create the Zyra agent
agent = Agent(
    name=os.getenv("AGENT_NAME", "zyra_agricultural_agent"),
    seed=os.getenv("AGENT_SEED", "zyra_seed_123"),
    port=8001,
    endpoint=["http://127.0.0.1:8001/submit"],
)

# Include the agricultural protocol
agent.include(agri_protocol)

@agent.on_event("startup")
async def startup(ctx: Context):
    """
    Agent startup event - initialize and fund if needed.
    """
    ctx.logger.info("🌱 Zyra Agricultural Extension Agent starting up...")
    ctx.logger.info(f"Agent address: {agent.address}")
    
    # Fund agent if needed (for demo purposes)
    await fund_agent_if_low(agent.wallet.address())
    
    ctx.logger.info("✅ Agent ready to process farmer reports and operator queries")

@agent.on_interval(period=30.0)
async def periodic_check(ctx: Context):
    """
    Periodic check for any pending tasks or maintenance.
    """
    # For demo purposes, we'll just log that we're alive
    ctx.logger.debug("Agent heartbeat - ready to serve")

def process_seed_data():
    """
    Process seed incident data for demo purposes.
    """
    print("🌱 Processing seed incident data...")
    
    seed_data = load_seed_data()
    if not seed_data:
        print("❌ No seed data found")
        return
    
    print(f"📊 Found {len(seed_data)} seed incidents")
    
    for i, incident_data in enumerate(seed_data, 1):
        print(f"\n📝 Processing incident {i}/{len(seed_data)}: {incident_data['farmer_id']} - {incident_data['category']}")
        
        # Create FarmerReport from seed data
        farmer_report = FarmerReport(
            farmer_id=incident_data['farmer_id'],
            lga=incident_data['lga'],
            state=incident_data['state'],
            geo=incident_data['geo'],
            crop=incident_data['crop'],
            category=incident_data['category'],
            description=incident_data['description']
        )
        
        # Process the report using utility functions
        try:
            # Step 1: Enrich the incident
            enrichment = enrich_incident(
                farmer_report.category, farmer_report.crop, 
                farmer_report.geo.lat, farmer_report.geo.lon, 
                farmer_report.description
            )
            
            # Step 2: Generate recommendation
            recommendation = generate_recommendation(
                farmer_report.category, farmer_report.crop, enrichment.severity_score
            )
            
            # Step 3: Check if resource request needed
            resource_requested = should_raise_resource_request(enrichment.severity_score, farmer_report.category)
            resource_type = get_resource_request_type(farmer_report.category, farmer_report.crop) if resource_requested else "none"
            
            print(f"✅ Processed incident {i}")
            print(f"   Severity: {enrichment.severity_score}/100")
            print(f"   Weather: {enrichment.weather_hint.value}")
            print(f"   Recommendation: {recommendation.step[:100]}...")
            if resource_requested:
                print(f"   Resource Request: {resource_type}")
                
        except Exception as e:
            print(f"❌ Error processing incident {i}: {e}")

def demo_operator_query():
    """
    Demo operator query for Kano Municipal.
    """
    print("\n🔍 Demo: Operator query for Kano Municipal")
    
    # Load incidents from local storage
    storage_file = os.path.join(os.path.dirname(__file__), "..", "data", "incidents.json")
    
    if os.path.exists(storage_file):
        try:
            with open(storage_file, 'r') as f:
                incidents = json.load(f)
            
            # Filter by LGA
            lga_incidents = [inc for inc in incidents if inc["lga"] == "Kano Municipal"]
            
            if lga_incidents:
                print(f"✅ Found {len(lga_incidents)} incidents in Kano Municipal")
                for incident in lga_incidents:
                    print(f"   - {incident['incident_id']}: {incident['crop']} {incident['category']} (Severity: {incident['enriched']['severity_score']})")
            else:
                print("ℹ️  No incidents found for Kano Municipal")
        except Exception as e:
            print(f"❌ Error reading incidents: {e}")
    else:
        print("ℹ️  No incidents file found yet")

def run_demo():
    """
    Run the complete demo sequence.
    """
    print("🚀 Starting Zyra Demo Sequence")
    print("=" * 50)
    
    # Step 1: Process seed data
    process_seed_data()
    
    # Step 2: Demo operator query
    demo_operator_query()
    
    print("\n" + "=" * 50)
    print("✅ Demo sequence completed!")
    print("\n📊 Check the generated data/incidents.json file for stored incidents")

def main():
    """
    Main entry point for the Zyra agent.
    """
    if len(sys.argv) > 1 and sys.argv[1] == "demo":
        # Run demo mode
        run_demo()
    else:
        # Run the agent normally
        print("🌱 Starting Zyra Agricultural Extension Agent...")
        print("Use 'python main.py demo' to run the demo sequence")
        agent.run()

if __name__ == "__main__":
    main()
