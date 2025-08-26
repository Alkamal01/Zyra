#!/usr/bin/env python3
"""
Acceptance tests for Zyra system
"""

import sys
import os
import json
import asyncio
from datetime import datetime

# Add agent directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'agent'))

from models import FarmerReport, Geo, CropType, CategoryType
from utils import (
    load_seed_data, enrich_incident, generate_recommendation, 
    should_raise_resource_request, get_resource_request_type,
    load_incidents_from_local, group_incidents_by_category
)

def test_incident_creation():
    """Test creating 4 sample incidents."""
    print("🧪 Test 1: Creating 4 sample incidents")
    
    seed_data = load_seed_data()
    assert len(seed_data) == 4, f"Expected 4 seed incidents, got {len(seed_data)}"
    
    incidents_created = []
    
    for incident_data in seed_data:
        # Create FarmerReport
        farmer_report = FarmerReport(
            farmer_id=incident_data['farmer_id'],
            lga=incident_data['lga'],
            state=incident_data['state'],
            geo=Geo(lat=incident_data['geo']['lat'], lon=incident_data['geo']['lon']),
            crop=incident_data['crop'],
            category=incident_data['category'],
            description=incident_data['description']
        )
        
        # Enrich incident
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
        incident_id = f"inc-test-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        incident = {
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
        
        incidents_created.append(incident)
        print(f"  ✅ Created incident {incident_id} for {farmer_report.farmer_id}")
    
    print(f"✅ Successfully created {len(incidents_created)} incidents")
    return incidents_created

def test_lga_query():
    """Test querying incidents by LGA."""
    print("\n🧪 Test 2: Querying incidents by LGA")
    
    # Create test incidents
    incidents = test_incident_creation()
    
    # Test Kano Municipal query
    kano_incidents = [inc for inc in incidents if inc["lga"] == "Kano Municipal"]
    assert len(kano_incidents) == 1, f"Expected 1 incident for Kano Municipal, got {len(kano_incidents)}"
    
    print(f"✅ Found {len(kano_incidents)} incidents for Kano Municipal")
    
    # Test category grouping
    category_counts = group_incidents_by_category(incidents)
    assert len(category_counts) > 0, "Expected category counts to be non-empty"
    
    print(f"✅ Category breakdown: {category_counts}")
    
    return incidents

def test_high_severity_resource_requests():
    """Test that high severity incidents trigger resource requests."""
    print("\n🧪 Test 3: High severity resource requests")
    
    incidents = test_incident_creation()
    
    # Check for flood incident (should be high severity)
    flood_incidents = [inc for inc in incidents if inc["category"] == "flood"]
    assert len(flood_incidents) == 1, "Expected 1 flood incident"
    
    flood_incident = flood_incidents[0]
    assert flood_incident["enriched"]["severity_score"] >= 70, f"Flood incident should be high severity, got {flood_incident['enriched']['severity_score']}"
    assert flood_incident["resource_request"]["requested"] == True, "High severity flood should trigger resource request"
    
    print(f"✅ Flood incident severity: {flood_incident['enriched']['severity_score']}/100")
    print(f"✅ Resource request triggered: {flood_incident['resource_request']['type']}")
    
    # Count total high severity incidents
    high_severity = [inc for inc in incidents if inc["enriched"]["severity_score"] >= 70]
    print(f"✅ Total high severity incidents: {len(high_severity)}")
    
    return incidents

def test_enrichment_and_recommendations():
    """Test incident enrichment and recommendation generation."""
    print("\n🧪 Test 4: Enrichment and recommendations")
    
    incidents = test_incident_creation()
    
    for incident in incidents:
        # Check enrichment
        assert "enriched" in incident, "Incident should have enrichment data"
        assert "weather_hint" in incident["enriched"], "Enrichment should include weather hint"
        assert "severity_score" in incident["enriched"], "Enrichment should include severity score"
        assert "tags" in incident["enriched"], "Enrichment should include tags"
        
        # Check recommendations
        assert "recommendations" in incident, "Incident should have recommendations"
        assert len(incident["recommendations"]) > 0, "Incident should have at least one recommendation"
        
        # Check audit trail
        assert "audit" in incident, "Incident should have audit trail"
        assert len(incident["audit"]) > 0, "Audit trail should not be empty"
        
        print(f"  ✅ {incident['incident_id']}: Weather={incident['enriched']['weather_hint']}, Severity={incident['enriched']['severity_score']}, Tags={incident['enriched']['tags']}")
    
    print("✅ All incidents properly enriched with recommendations and audit trails")

def run_all_tests():
    """Run all acceptance tests."""
    print("🚀 Running Zyra Acceptance Tests")
    print("=" * 50)
    
    try:
        # Test 1: Create 4 sample incidents
        incidents = test_incident_creation()
        
        # Test 2: LGA query functionality
        test_lga_query()
        
        # Test 3: High severity resource requests
        test_high_severity_resource_requests()
        
        # Test 4: Enrichment and recommendations
        test_enrichment_and_recommendations()
        
        print("\n" + "=" * 50)
        print("✅ All acceptance tests passed!")
        print(f"📊 Total incidents tested: {len(incidents)}")
        print("🎉 Zyra system is working correctly!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        raise

if __name__ == "__main__":
    run_all_tests()
