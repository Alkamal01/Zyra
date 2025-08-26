#!/usr/bin/env python3
"""
Zyra CLI - Command Line Interface
"""

import sys
import os
import json
import asyncio
from datetime import datetime

# Add agent directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'agent'))

from models import FarmerReport, Geo, CropType, CategoryType
from utils import load_seed_data, load_incidents_from_local

class ZyraCLI:
    def __init__(self):
        self.api_base = "http://localhost:8000"
    
    def print_menu(self):
        print("🌱 Zyra CLI - Agricultural Extension Agent")
        print("=" * 50)
        print("1. Submit sample reports (demo)")
        print("2. Query incidents by LGA")
        print("3. List all incidents")
        print("4. Exit")
        print()
    
    async def submit_sample_reports(self):
        print("🌱 Processing sample reports...")
        seed_data = load_seed_data()
        
        for i, incident_data in enumerate(seed_data, 1):
            print(f"📝 Processing {i}/{len(seed_data)}: {incident_data['farmer_id']} - {incident_data['category']}")
            
            # Simulate processing
            from utils import enrich_incident, generate_recommendation, should_raise_resource_request, get_resource_request_type
            
            farmer_report = FarmerReport(
                farmer_id=incident_data['farmer_id'],
                lga=incident_data['lga'],
                state=incident_data['state'],
                geo=Geo(lat=incident_data['geo']['lat'], lon=incident_data['geo']['lon']),
                crop=incident_data['crop'],
                category=incident_data['category'],
                description=incident_data['description']
            )
            
            enrichment = enrich_incident(
                farmer_report.category, farmer_report.crop,
                farmer_report.geo.lat, farmer_report.geo.lon,
                farmer_report.description
            )
            
            recommendation = generate_recommendation(
                farmer_report.category, farmer_report.crop, enrichment.severity_score
            )
            
            now = datetime.utcnow().isoformat() + "Z"
            incident_id = f"inc-{datetime.now().strftime('%Y%m%d%H%M%S')}"
            
            incident_data = {
                "incident_id": incident_id,
                "farmer_id": farmer_report.farmer_id,
                "lga": farmer_report.lga,
                "state": farmer_report.state,
                "geo": {"lat": farmer_report.geo.lat, "lon": farmer_report.geo.lon},
                "crop": farmer_report.crop.value,
                "category": farmer_report.category.value,
                "description": farmer_report.description,
                "reported_at": now,
                "enriched": {
                    "weather_hint": enrichment.weather_hint.value,
                    "severity_score": enrichment.severity_score,
                    "tags": enrichment.tags
                },
                "status": "recommended",
                "recommendations": [{
                    "step": recommendation.step,
                    "source": recommendation.source,
                    "created_at": recommendation.created_at
                }],
                "resource_request": {
                    "requested": should_raise_resource_request(enrichment.severity_score, farmer_report.category),
                    "type": get_resource_request_type(farmer_report.category, farmer_report.crop) if should_raise_resource_request(enrichment.severity_score, farmer_report.category) else "none",
                    "notes": f"High severity {farmer_report.category.value} incident" if should_raise_resource_request(enrichment.severity_score, farmer_report.category) else "",
                    "created_at": now if should_raise_resource_request(enrichment.severity_score, farmer_report.category) else None
                },
                "audit": [
                    {"event": "created", "at": now},
                    {"event": "enriched", "at": now},
                    {"event": "recommendation_added", "at": now}
                ]
            }
            
            self.save_incident_locally(incident_data)
            print(f"✅ Processed - ID: {incident_id}, Severity: {enrichment.severity_score}/100")
        
        print("✅ All sample incidents processed!")
    
    async def query_lga(self):
        lga = input("Enter LGA name: ").strip()
        incidents = load_incidents_from_local()
        lga_incidents = [inc for inc in incidents if inc["lga"] == lga]
        
        if not lga_incidents:
            print(f"No incidents found for {lga}")
            return
        
        print(f"\n📊 Found {len(lga_incidents)} incidents for {lga}:")
        for incident in lga_incidents:
            print(f"  • {incident['incident_id']} | {incident['crop']} | {incident['category']} | Severity: {incident['enriched']['severity_score']}")
    
    async def list_all_incidents(self):
        incidents = load_incidents_from_local()
        if not incidents:
            print("No incidents found.")
            return
        
        print(f"\n📋 All Incidents ({len(incidents)}):")
        for incident in incidents:
            print(f"  • {incident['incident_id']} | {incident['farmer_id']} | {incident['lga']} | {incident['crop']} | {incident['category']} | Severity: {incident['enriched']['severity_score']}")
    
    def save_incident_locally(self, incident_data):
        storage_file = os.path.join(os.path.dirname(__file__), "..", "data", "incidents.json")
        incidents = []
        if os.path.exists(storage_file):
            try:
                with open(storage_file, 'r') as f:
                    incidents = json.load(f)
            except:
                incidents = []
        
        incidents.append(incident_data)
        os.makedirs(os.path.dirname(storage_file), exist_ok=True)
        with open(storage_file, 'w') as f:
            json.dump(incidents, f, indent=2)
    
    async def run(self):
        while True:
            self.print_menu()
            choice = input("Enter choice (1-4): ").strip()
            
            if choice == '1':
                await self.submit_sample_reports()
            elif choice == '2':
                await self.query_lga()
            elif choice == '3':
                await self.list_all_incidents()
            elif choice == '4':
                print("👋 Goodbye!")
                break
            else:
                print("Invalid choice!")
            
            input("\nPress Enter to continue...")

def main():
    cli = ZyraCLI()
    asyncio.run(cli.run())

if __name__ == "__main__":
    main()
