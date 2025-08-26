#!/usr/bin/env python3
"""
List all incidents in the system
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'agent'))

import json
from models import Incident

def list_all_incidents():
    """List all incidents with details."""
    print("📋 All Incidents in System")
    print("=" * 50)
    
    try:
        with open('../data/incidents.json', 'r') as f:
            incidents_data = json.load(f)
            incidents = [Incident(**incident) for incident in incidents_data]
    except FileNotFoundError:
        print("❌ No incidents data found. Please run load_seed.py first.")
        return
    
    if not incidents:
        print("📭 No incidents found in the system.")
        return
    
    print(f"✅ Found {len(incidents)} total incidents\n")
    
    for i, incident in enumerate(incidents, 1):
        print(f"🔸 Incident {i}: {incident.incident_id}")
        print(f"   Farmer: {incident.farmer_id}")
        print(f"   Location: {incident.lga}, {incident.state}")
        print(f"   Crop: {incident.crop}")
        print(f"   Category: {incident.category}")
        print(f"   Description: {incident.description}")
        print(f"   Severity: {incident.enriched.severity_score}/100")
        print(f"   Status: {incident.status}")
        print(f"   Reported: {incident.reported_at}")
        
        if incident.recommendations:
            print(f"   Recommendations: {len(incident.recommendations)}")
            for rec in incident.recommendations:
                print(f"     - {rec.step}")
        
        if incident.resource_request.type_ != "none":
            print(f"   ⚠️  Resource Request: {incident.resource_request.type_}")
        
        print()

if __name__ == "__main__":
    list_all_incidents()
