from uagents import Protocol
from uagents.setup import fund_agent_if_low
from models import FarmerReport, EnrichmentResult, ChainWriteAck, OperatorQuery, AgentResponse
from utils import (
    enrich_incident, generate_recommendation, should_raise_resource_request,
    get_resource_request_type, create_audit_event, load_seed_data,
    group_incidents_by_category, format_incident_summary
)
from datetime import datetime
import json
import os
from typing import Dict, Any
from icp_client import icp_client

# Create protocol for agricultural extension
agri_protocol = Protocol()

@agri_protocol.on_message(model=FarmerReport, replies={AgentResponse})
async def handle_farmer_report(ctx, sender: str, msg: FarmerReport):
    """
    Handle incoming farmer reports, enrich them, and store on-chain.
    """
    try:
        ctx.logger.info(f"Received farmer report from {msg.farmer_id} in {msg.lga}")
        
        # Step 1: Enrich the incident
        enrichment = enrich_incident(
            msg.category, msg.crop, msg.geo.lat, msg.geo.lon, msg.description
        )
        
        ctx.logger.info(f"Enriched incident - Weather: {enrichment.weather_hint}, Severity: {enrichment.severity_score}")
        
        # Step 2: Create incident object
        now = datetime.utcnow().isoformat() + "Z"
        
        incident_data = {
            "incident_id": "",  # Will be assigned by canister
            "farmer_id": msg.farmer_id,
            "lga": msg.lga,
            "state": msg.state,
            "geo": {"lat": msg.geo.lat, "lon": msg.geo.lon},
            "crop": msg.crop.value,
            "category": msg.category.value,
            "description": msg.description,
            "reported_at": now,
            "enriched": {
                "weather_hint": enrichment.weather_hint.value,
                "severity_score": enrichment.severity_score,
                "tags": enrichment.tags
            },
            "status": "received",
            "recommendations": [],
            "resource_request": {
                "requested": False,
                "type": "none",
                "notes": "",
                "created_at": None
            },
            "audit": []
        }
        
        # Step 3: Store on-chain using ICP canister
        try:
            # Create Incident object for canister
            from models import Incident, Geo, Enriched, StatusType, ResourceRequest, Audit
            
            incident_obj = Incident(
                incident_id="",  # Will be assigned by canister
                farmer_id=msg.farmer_id,
                lga=msg.lga,
                state=msg.state,
                geo=Geo(lat=msg.geo.lat, lon=msg.geo.lon),
                crop=msg.crop,
                category=msg.category,
                description=msg.description,
                reported_at=now,
                enriched=enrichment,
                status=StatusType.RECEIVED,
                recommendations=[],
                resource_request=ResourceRequest(),
                audit=[]
            )
            
            # Store on ICP canister
            incident_id = icp_client.create_incident(incident_obj)
            if incident_id:
                incident_data["incident_id"] = incident_id
                ctx.logger.info(f"Stored incident on ICP canister: {incident_id}")
            else:
                # Fallback to local storage if canister fails
                incident_id = f"inc-{datetime.now().strftime('%Y%m%d%H%M%S')}"
                incident_data["incident_id"] = incident_id
                ctx.logger.warning(f"ICP canister failed, using local storage: {incident_id}")
        except Exception as e:
            # Fallback to local storage
            incident_id = f"inc-{datetime.now().strftime('%Y%m%d%H%M%S')}"
            incident_data["incident_id"] = incident_id
            ctx.logger.error(f"Error storing on ICP canister: {e}, using local storage: {incident_id}")
        
        # Step 4: Generate recommendation
        recommendation = generate_recommendation(
            msg.category, msg.crop, enrichment.severity_score
        )
        
        incident_data["recommendations"].append({
            "step": recommendation.step,
            "source": recommendation.source,
            "created_at": recommendation.created_at
        })
        
        # Step 5: Check if resource request needed
        if should_raise_resource_request(enrichment.severity_score, msg.category):
            resource_type = get_resource_request_type(msg.category, msg.crop)
            incident_data["resource_request"] = {
                "requested": True,
                "type": resource_type,
                "notes": f"High severity {msg.category.value} incident requiring {resource_type}",
                "created_at": now
            }
            ctx.logger.info(f"Raised resource request: {resource_type}")
        
        # Step 6: Update status
        incident_data["status"] = "recommended"
        
        # Step 7: Add audit events
        incident_data["audit"] = [
            {"event": "created", "at": now},
            {"event": "enriched", "at": now},
            {"event": "recommendation_added", "at": now}
        ]
        
        if incident_data["resource_request"]["requested"]:
            incident_data["audit"].append({"event": "resource_requested", "at": now})
        
        incident_data["audit"].append({"event": "status_updated_to_recommended", "at": now})
        
        # Step 8: Save to local storage for demo
        save_incident_locally(incident_data)
        
        # Step 9: Send response to farmer
        response_message = f"Thank you for your report. Your incident has been recorded (ID: {incident_id}). "
        response_message += f"Severity level: {enrichment.severity_score}/100. "
        response_message += f"Recommendation: {recommendation.step}"
        
        if incident_data["resource_request"]["requested"]:
            response_message += f" A resource request has been raised for {resource_type}."
        
        await ctx.send(sender, AgentResponse(
            success=True,
            message=response_message,
            data={"incident_id": incident_id, "severity": enrichment.severity_score}
        ))
        
    except Exception as e:
        ctx.logger.error(f"Error processing farmer report: {e}")
        await ctx.send(sender, AgentResponse(
            success=False,
            message=f"Error processing your report: {str(e)}"
        ))

@agri_protocol.on_message(model=OperatorQuery, replies={AgentResponse})
async def handle_operator_query(ctx, sender: str, msg: OperatorQuery):
    """
    Handle operator queries for incidents by LGA.
    """
    try:
        ctx.logger.info(f"Operator query for LGA: {msg.lga}")
        
        # Try to load incidents from ICP canister first
        try:
            icp_incidents = icp_client.list_incidents_by_lga(msg.lga)
            if icp_incidents:
                # Convert to dict format for compatibility
                incidents = []
                for incident in icp_incidents:
                    incidents.append({
                        "incident_id": incident.incident_id,
                        "farmer_id": incident.farmer_id,
                        "lga": incident.lga,
                        "state": incident.state,
                        "geo": {"lat": incident.geo.lat, "lon": incident.geo.lon},
                        "crop": incident.crop.value,
                        "category": incident.category.value,
                        "description": incident.description,
                        "reported_at": incident.reported_at,
                        "enriched": {
                            "weather_hint": incident.enriched.weather_hint.value,
                            "severity_score": incident.enriched.severity_score,
                            "tags": incident.enriched.tags
                        },
                        "status": incident.status.value,
                        "recommendations": [
                            {
                                "step": rec.step,
                                "source": rec.source,
                                "created_at": rec.created_at
                            } for rec in incident.recommendations
                        ],
                        "resource_request": {
                            "requested": incident.resource_request.requested,
                            "type": incident.resource_request.type_,
                            "notes": incident.resource_request.notes,
                            "created_at": incident.resource_request.created_at
                        },
                        "audit": [
                            {
                                "event": audit.event,
                                "at": audit.at
                            } for audit in incident.audit
                        ]
                    })
                ctx.logger.info(f"Loaded {len(incidents)} incidents from ICP canister")
            else:
                # Fallback to local storage
                incidents = load_incidents_from_local()
                ctx.logger.info("No incidents found in ICP canister, using local storage")
        except Exception as e:
            # Fallback to local storage
            incidents = load_incidents_from_local()
            ctx.logger.error(f"Error loading from ICP canister: {e}, using local storage")
        
        # Filter by LGA (in case we're using local storage)
        lga_incidents = [inc for inc in incidents if inc["lga"] == msg.lga]
        
        if not lga_incidents:
            await ctx.send(sender, AgentResponse(
                success=True,
                message=f"No incidents found for {msg.lga}",
                data={"incidents": [], "summary": {}}
            ))
            return
        
        # Group by category
        category_counts = group_incidents_by_category(lga_incidents)
        
        # Get top 3 high severity incidents
        high_severity = sorted(
            [inc for inc in lga_incidents if inc["enriched"]["severity_score"] >= 70],
            key=lambda x: x["enriched"]["severity_score"],
            reverse=True
        )[:3]
        
        # Format response
        summary = {
            "lga": msg.lga,
            "total_incidents": len(lga_incidents),
            "category_breakdown": category_counts,
            "high_severity_count": len([inc for inc in lga_incidents if inc["enriched"]["severity_score"] >= 70]),
            "top_high_severity": [format_incident_summary(inc) for inc in high_severity]
        }
        
        response_message = f"Found {len(lga_incidents)} incidents in {msg.lga}. "
        response_message += f"Categories: {', '.join([f'{cat}: {count}' for cat, count in category_counts.items()])}. "
        
        if high_severity:
            response_message += f"High severity incidents: {len(high_severity)} requiring immediate attention."
        
        await ctx.send(sender, AgentResponse(
            success=True,
            message=response_message,
            data={"incidents": lga_incidents, "summary": summary}
        ))
        
    except Exception as e:
        ctx.logger.error(f"Error processing operator query: {e}")
        await ctx.send(sender, AgentResponse(
            success=False,
            message=f"Error processing query: {str(e)}"
        ))

def save_incident_locally(incident_data: Dict[str, Any]):
    """
    Save incident to local JSON file for demo purposes.
    In production, this would be handled by the ICP canister.
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

def load_incidents_from_local() -> list:
    """
    Load incidents from local JSON file for demo purposes.
    """
    storage_file = os.path.join(os.path.dirname(__file__), "..", "data", "incidents.json")
    
    if os.path.exists(storage_file):
        try:
            with open(storage_file, 'r') as f:
                return json.load(f)
        except:
            return []
    return []
