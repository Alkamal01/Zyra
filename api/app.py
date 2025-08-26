from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import os
import sys
from datetime import datetime

# Add agent directory to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'agent'))

from models import FarmerReport, OperatorQuery, AgentResponse, Geo, CropType, CategoryType, Incident
from utils import enrich_incident, generate_recommendation, should_raise_resource_request, get_resource_request_type

app = FastAPI(
    title="Zyra Agricultural Extension API",
    description="API for the Zyra autonomous agricultural extension agent",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (commented out since web files were removed)
# app.mount("/web", StaticFiles(directory="../web"), name="web")

# Request/Response models for API
class FarmerReportRequest(BaseModel):
    farmer_id: str
    lga: str
    state: str
    lat: float
    lon: float
    crop: str
    category: str
    description: str

class OperatorQueryRequest(BaseModel):
    lga: str

class IncidentResponse(BaseModel):
    incident_id: str
    farmer_id: str
    lga: str
    state: str
    geo: Dict[str, float]
    crop: str
    category: str
    description: str
    reported_at: str
    enriched: Dict[str, Any]
    status: str
    recommendations: List[Dict[str, str]]
    resource_request: Dict[str, Any]
    audit: List[Dict[str, str]]

class LGAQueryResponse(BaseModel):
    lga: str
    total_incidents: int
    category_breakdown: Dict[str, int]
    high_severity_count: int
    top_high_severity: List[str]
    incidents: List[IncidentResponse]

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Zyra Agricultural Extension API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "submit_report": "/api/submit-report",
            "query_lga": "/api/query-lga",
            "list_incidents": "/api/incidents",
            "get_incident": "/api/incidents/{incident_id}",
            "health": "/health",
            "web_interface": "/web/index.html"
        }
    }

@app.get("/web")
async def web_interface():
    """Serve the web interface."""
    return FileResponse("../web/index.html")

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'}

@app.post("/api/submit-report", response_model=Dict[str, Any])
async def submit_farmer_report(request: FarmerReportRequest):
    """
    Submit a farmer report for processing.
    """
    try:
        # Validate crop and category
        try:
            crop = CropType(request.crop)
            category = CategoryType(request.category)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Invalid crop or category: {e}")
        
        # Create FarmerReport object
        farmer_report = FarmerReport(
            farmer_id=request.farmer_id,
            lga=request.lga,
            state=request.state,
            geo=Geo(lat=request.lat, lon=request.lon),
            crop=crop,
            category=category,
            description=request.description
        )
        
        # For demo purposes, we'll simulate the agent processing
        # In production, this would send to the uAgent
        
        # Enrich the incident
        enrichment = enrich_incident(
            category, crop, request.lat, request.lon, request.description
        )
        
        # Generate recommendation
        recommendation = generate_recommendation(category, crop, enrichment.severity_score)
        
        # Create incident data
        now = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
        incident_id = f"inc-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        
        incident_data = {
            "incident_id": incident_id,
            "farmer_id": request.farmer_id,
            "lga": request.lga,
            "state": request.state,
            "geo": {"lat": request.lat, "lon": request.lon},
            "crop": crop.value,
            "category": category.value,
            "description": request.description,
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
                "requested": should_raise_resource_request(enrichment.severity_score, category),
                "type": get_resource_request_type(category, crop) if should_raise_resource_request(enrichment.severity_score, category) else "none",
                "notes": f"High severity {category.value} incident" if should_raise_resource_request(enrichment.severity_score, category) else "",
                "created_at": now if should_raise_resource_request(enrichment.severity_score, category) else None
            },
            "audit": [
                {"event": "created", "at": now},
                {"event": "enriched", "at": now},
                {"event": "recommendation_added", "at": now}
            ]
        }
        
        # Save to local storage
        save_incident_locally(incident_data)
        
        # Prepare response
        response_message = f"Thank you for your report. Your incident has been recorded (ID: {incident_id}). "
        response_message += f"Severity level: {enrichment.severity_score}/100. "
        response_message += f"Recommendation: {recommendation.step}"
        
        if incident_data["resource_request"]["requested"]:
            response_message += f" A resource request has been raised for {incident_data['resource_request']['type']}."
        
        return {
            "success": True,
            "message": response_message,
            "incident_id": incident_id,
            "severity": enrichment.severity_score,
            "recommendation": recommendation.step,
            "resource_requested": incident_data["resource_request"]["requested"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing report: {str(e)}")

@app.post("/api/query-lga", response_model=LGAQueryResponse)
async def query_incidents_by_lga(request: OperatorQueryRequest):
    """
    Query incidents by Local Government Area (LGA).
    """
    try:
        # Load incidents from local storage
        incidents = load_incidents_from_local()
        
        # Filter by LGA
        lga_incidents = [inc for inc in incidents if inc["lga"] == request.lga]
        
        # Group by category
        category_counts = group_incidents_by_category(lga_incidents)
        
        # Get high severity incidents
        high_severity = [inc for inc in lga_incidents if inc["enriched"]["severity_score"] >= 70]
        top_high_severity = sorted(high_severity, key=lambda x: x["enriched"]["severity_score"], reverse=True)[:3]
        
        return LGAQueryResponse(
            lga=request.lga,
            total_incidents=len(lga_incidents),
            category_breakdown=category_counts,
            high_severity_count=len(high_severity),
            top_high_severity=[format_incident_summary(inc) for inc in top_high_severity],
            incidents=[IncidentResponse(**inc) for inc in lga_incidents]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying incidents: {str(e)}")

@app.get("/api/incidents", response_model=List[IncidentResponse])
async def list_all_incidents():
    """
    List all incidents.
    """
    try:
        incidents = load_incidents_from_local()
        return [IncidentResponse(**inc) for inc in incidents]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading incidents: {str(e)}")

@app.get("/api/incidents/{incident_id}", response_model=IncidentResponse)
async def get_incident(incident_id: str):
    """
    Get a specific incident by ID.
    """
    try:
        incidents = load_incidents_from_local()
        incident = next((inc for inc in incidents if inc["incident_id"] == incident_id), None)
        
        if not incident:
            raise HTTPException(status_code=404, detail="Incident not found")
        
        return IncidentResponse(**incident)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving incident: {str(e)}")

@app.get("/api/stats")
async def get_stats():
    """
    Get system statistics.
    """
    try:
        incidents = load_incidents_from_local()
        
        if not incidents:
            return {
                "total_incidents": 0,
                "by_status": {},
                "by_category": {},
                "by_lga": {},
                "high_severity_count": 0
            }
        
        # Calculate statistics
        by_status = {}
        by_category = {}
        by_lga = {}
        high_severity_count = 0
        
        for inc in incidents:
            # Status counts
            status = inc["status"]
            by_status[status] = by_status.get(status, 0) + 1
            
            # Category counts
            category = inc["category"]
            by_category[category] = by_category.get(category, 0) + 1
            
            # LGA counts
            lga = inc["lga"]
            by_lga[lga] = by_lga.get(lga, 0) + 1
            
            # High severity count
            if inc["enriched"]["severity_score"] >= 70:
                high_severity_count += 1
        
        return {
            "total_incidents": len(incidents),
            "by_status": by_status,
            "by_category": by_category,
            "by_lga": by_lga,
            "high_severity_count": high_severity_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating stats: {str(e)}")

def save_incident_locally(incident_data: Dict[str, Any]):
    """
    Save incident to local JSON file for demo purposes.
    """
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

def load_incidents_from_local() -> List[Dict[str, Any]]:
    """
    Load incidents from local JSON file for demo purposes.
    """
    storage_file = os.path.join(os.path.dirname(__file__), "..", "data", "incidents.json")
    
    if not os.path.exists(storage_file):
        return []
    
    try:
        with open(storage_file, 'r') as f:
            incidents = json.load(f)
        return incidents
    except:
        return []

def group_incidents_by_category(incidents: List[Dict[str, Any]]) -> Dict[str, int]:
    """
    Group incidents by category and return counts.
    """
    counts = {}
    for incident in incidents:
        category = incident.get("category", "unknown")
        counts[category] = counts.get(category, 0) + 1
    return counts

def format_incident_summary(incident: Dict[str, Any]) -> str:
    """
    Format incident summary for display.
    """
    return f"{incident['incident_id']} | {incident['crop']} | {incident['category']} | Severity: {incident['enriched']['severity_score']} | Status: {incident['status']}"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
