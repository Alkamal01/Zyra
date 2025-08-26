#!/usr/bin/env python3
"""
Query incidents by Local Government Area (LGA)
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'agent'))

import json
from typing import Dict, List
from models import Incident
from utils import load_seed_data, group_incidents_by_category

def query_lga(lga_name: str):
    """Query incidents by LGA name."""
    print(f"🔍 Querying incidents for LGA: {lga_name}")
    
    # Load incidents from the generated data file
    try:
        with open('../data/incidents.json', 'r') as f:
            incidents_data = json.load(f)
            incidents = [Incident(**incident) for incident in incidents_data]
    except FileNotFoundError:
        print("❌ No incidents data found. Please run load_seed.py first.")
        return
    
    # Filter incidents by LGA
    lga_incidents = [inc for inc in incidents if inc.lga.lower() == lga_name.lower()]
    
    if not lga_incidents:
        print(f"❌ No incidents found for LGA: {lga_name}")
        return
    
    print(f"✅ Found {len(lga_incidents)} incidents in {lga_name}")
    
    # Group by category
    category_counts = group_incidents_by_category(lga_incidents)
    print("\n📊 Incidents by Category:")
    for category, count in category_counts.items():
        print(f"   {category}: {count}")
    
    # Show high severity incidents
    high_severity = [inc for inc in lga_incidents if inc.enriched.severity_score >= 70]
    if high_severity:
        print(f"\n⚠️  High Severity Incidents ({len(high_severity)}):")
        for inc in high_severity:
            print(f"   - {inc.incident_id}: {inc.category} (Score: {inc.enriched.severity_score})")
    
    # Show resource requests
    resource_requests = [inc for inc in lga_incidents if inc.resource_request.type_ != "none"]
    if resource_requests:
        print(f"\n🚨 Resource Requests ({len(resource_requests)}):")
        for inc in resource_requests:
            print(f"   - {inc.incident_id}: {inc.resource_request.type_}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python query_lga.py <LGA_NAME>")
        print("Example: python query_lga.py Makurdi")
        sys.exit(1)
    
    lga_name = sys.argv[1]
    query_lga(lga_name)
