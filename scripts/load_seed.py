#!/usr/bin/env python3
"""
Load and process seed incident data for Zyra demo
"""

import sys
import os
import json
import asyncio
from datetime import datetime

# Add agent directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'agent'))

from models import FarmerReport, Geo, CropType, CategoryType
from utils import load_seed_data, enrich_incident, generate_recommendation, should_raise_resource_request, get_resource_request_type

async def process_seed_data():
    """Process all seed incident data."""
    print("🌱 Processing seed incident data...")
    
    seed_data = load_seed_data()
    if not seed_data:
        print("❌ No seed data found!")
        return
    
    print(f"📊 Found {len(seed_data)} seed incidents")
    print()
    
    for i, incident_data in enumerate(seed_data, 1):
        print(f"📝 Processing incident {i}/{len(seed_data)}: {incident_data['farmer_id']} - {incident_data['category']}")
        
        # Create FarmerReport object
        farmer_report = FarmerReport(
            farmer_id=incident_data['farmer_id'],
            lga=incident_data['lga'],
            state=incident_data['state'],
            geo=Geo(lat=incident_data['geo']['lat'], lon=incident_data['geo']['lon']),
            crop=incident_data['crop'],
            category=incident_data['category'],
            description=incident_data['description']
        )
        
        # Enrich the incident
        enrichment = enrich_incident(
            farmer_report.category, farmer_report.crop,
            farmer_report.geo.lat, farmer_report.geo.lon,
            farmer_report.description
        )
        
        # Generate recommendation
        recommendation = generate_recommendation(
            farmer_report.category, farmer_report.crop, enrichment.severity_score
        )
        
        # Create incident data
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
        
        # Save to local storage
        save_incident_locally(incident_data)
        
        print(f"✅ Processed - ID: {incident_id}, Severity: {enrichment.severity_score}/100")
        if incident_data["resource_request"]["requested"]:
            print(f"   ⚠️  Resource request raised: {incident_data['resource_request']['type']}")
        print()
    
    print("✅ All sample incidents processed successfully!")

def save_incident_locally(incident_data):
    """Save incident to local JSON file."""
    storage_file = os.path.join(os.path.dirname(__file__), "..", "data", "incidents.json")
    
    # Load existing incidents
    incidents = []
    if os.path.exists(storage_file):
        try:
            with open(storage_file, 'r') as f:
                incidents = json.load(f)
        except:
            incidents = []
    
    # Add new incident
    incidents.append(incident_data)
    
    # Save back to file
    os.makedirs(os.path.dirname(storage_file), exist_ok=True)
    with open(storage_file, 'w') as f:
        json.dump(incidents, f, indent=2)

if __name__ == "__main__":
    asyncio.run(process_seed_data())
