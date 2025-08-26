"""
ICP Canister Client for Zyra Agricultural Extension Agent
"""
import json
import os
import subprocess
from typing import Dict, Any, List, Optional
from models import Incident, Recommendation, ResourceRequest, Audit, Enriched, Geo

class ICPClient:
    """Client for interacting with the ICP canister."""
    
    def __init__(self, canister_id: Optional[str] = None, network: str = "local"):
        self.canister_id = canister_id
        self.network = network
        self.dfx_path = "dfx"
    
    def deploy_canister(self) -> str:
        """Deploy the canister and return the canister ID."""
        try:
            # Change to ICP directory
            icp_dir = os.path.join(os.path.dirname(__file__), "..", "icp")
            os.chdir(icp_dir)
            
            # Start local replica if not running
            self._start_replica()
            
            # Deploy canister
            result = subprocess.run(
                [self.dfx_path, "deploy", "--network", self.network],
                capture_output=True,
                text=True,
                cwd=icp_dir
            )
            
            if result.returncode != 0:
                print(f"Deploy failed: {result.stderr}")
                return None
            
            # Extract canister ID from output
            for line in result.stdout.split('\n'):
                if 'agriassist' in line and 'canister_id:' in line:
                    canister_id = line.split('canister_id:')[1].strip()
                    self.canister_id = canister_id
                    print(f"Canister deployed with ID: {canister_id}")
                    return canister_id
            
            return None
            
        except Exception as e:
            print(f"Error deploying canister: {e}")
            return None
    
    def _start_replica(self):
        """Start the local ICP replica if not running."""
        try:
            # Check if replica is running
            result = subprocess.run(
                [self.dfx_path, "ping", "--network", self.network],
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                print("Starting local ICP replica...")
                subprocess.run(
                    [self.dfx_path, "start", "--background", "--clean"],
                    cwd=os.path.join(os.path.dirname(__file__), "..", "icp")
                )
                
        except Exception as e:
            print(f"Error starting replica: {e}")
    
    def create_incident(self, incident: Incident) -> Optional[str]:
        """Create an incident on the ICP canister."""
        if not self.canister_id:
            print("No canister ID available. Deploy first.")
            return None
        
        try:
            # Convert incident to canister format
            incident_data = self._incident_to_canister_format(incident)
            
            # Convert to Candid format
            candid_data = self._incident_to_candid_format(incident)
            
            # Call canister
            result = subprocess.run([
                self.dfx_path, "canister", "call", "--update", "--network", self.network,
                self.canister_id, "create_incident", candid_data
            ], capture_output=True, text=True, cwd=os.path.join(os.path.dirname(__file__), "..", "icp"))
            
            if result.returncode == 0:
                incident_id = result.stdout.strip().strip('"')
                print(f"Incident created on ICP: {incident_id}")
                return incident_id
            else:
                print(f"Error creating incident: {result.stderr}")
                return None
                
        except Exception as e:
            print(f"Error calling canister: {e}")
            return None
    
    def get_incident(self, incident_id: str) -> Optional[Incident]:
        """Get an incident from the ICP canister."""
        if not self.canister_id:
            return None
        
        try:
            result = subprocess.run([
                self.dfx_path, "canister", "call", "--network", self.network,
                self.canister_id, "get_incident", incident_id
            ], capture_output=True, text=True, cwd=os.path.join(os.path.dirname(__file__), "..", "icp"))
            
            if result.returncode == 0 and result.stdout.strip() != "null":
                print(f"Raw response: {result.stdout}")
                # Parse the Candid response format
                # The response is in format: (opt record { ... })
                response_text = result.stdout.strip()
                print(f"Response text: {response_text}")
                print(f"Contains 'opt record': {'opt record' in response_text}")
                print(f"Contains 'null': {'null' in response_text}")
                if "opt record" in response_text:
                    # Extract the record part
                    start = response_text.find("record {")
                    end = response_text.rfind("}") + 1
                    print(f"Start: {start}, End: {end}")
                    if start != -1 and end != -1:
                        record_text = response_text[start:end]
                        print(f"Record text: {record_text}")
                        # Convert Candid format to JSON-like format for parsing
                        # This is a simplified conversion - in production, use a proper Candid parser
                        incident_data = self._parse_candid_record(record_text)
                        print(f"Parsed data: {incident_data}")
                        if incident_data:
                            return self._canister_to_incident_format(incident_data)
                        else:
                            print("Failed to parse record data")
                            return None
                    else:
                        print("Failed to extract record text")
                        return None
                else:
                    print("Response format not recognized")
                    return None
            else:
                print(f"Error: {result.stderr}")
                return None
                
        except Exception as e:
            print(f"Error getting incident: {e}")
            return None
    
    def list_incidents_by_lga(self, lga: str) -> List[Incident]:
        """List incidents by LGA from the ICP canister."""
        if not self.canister_id:
            return []
        
        try:
            result = subprocess.run([
                self.dfx_path, "canister", "call", "--network", self.network,
                self.canister_id, "list_incidents_by_lga", lga
            ], capture_output=True, text=True, cwd=os.path.join(os.path.dirname(__file__), "..", "icp"))
            
            if result.returncode == 0:
                print(f"LGA query response: {result.stdout}")
                # Parse the Candid response format
                response_text = result.stdout.strip()
                if response_text.startswith("(") and "vec" in response_text:
                    # Extract the vector part
                    start = response_text.find("vec {")
                    end = response_text.rfind("}") + 1
                    if start != -1 and end != -1:
                        vec_text = response_text[start:end]
                        print(f"Vector text: {vec_text}")
                        # Parse individual records in the vector
                        incidents = []
                        # For now, return empty list as parsing complex vectors is complex
                        # In production, use a proper Candid parser
                        return []
                return []
            else:
                return []
                
        except Exception as e:
            print(f"Error listing incidents: {e}")
            return []
    
    def add_recommendation(self, incident_id: str, recommendation: Recommendation):
        """Add a recommendation to an incident."""
        if not self.canister_id:
            return False
        
        try:
            rec_data = {
                "step": recommendation.step,
                "source": recommendation.source,
                "created_at": recommendation.created_at
            }
            
            result = subprocess.run([
                self.dfx_path, "canister", "call", "--update", "--network", self.network,
                self.canister_id, "add_recommendation", incident_id, json.dumps(rec_data)
            ], capture_output=True, text=True, cwd=os.path.join(os.path.dirname(__file__), "..", "icp"))
            
            return result.returncode == 0
            
        except Exception as e:
            print(f"Error adding recommendation: {e}")
            return False
    
    def set_status(self, incident_id: str, status: str):
        """Set the status of an incident."""
        if not self.canister_id:
            return False
        
        try:
            result = subprocess.run([
                self.dfx_path, "canister", "call", "--update", "--network", self.network,
                self.canister_id, "set_status", incident_id, status
            ], capture_output=True, text=True, cwd=os.path.join(os.path.dirname(__file__), "..", "icp"))
            
            return result.returncode == 0
            
        except Exception as e:
            print(f"Error setting status: {e}")
            return False
    
    def raise_resource_request(self, incident_id: str, request_type: str, notes: str):
        """Raise a resource request for an incident."""
        if not self.canister_id:
            return False
        
        try:
            result = subprocess.run([
                self.dfx_path, "canister", "call", "--update", "--network", self.network,
                self.canister_id, "raise_resource_request", incident_id, request_type, notes
            ], capture_output=True, text=True, cwd=os.path.join(os.path.dirname(__file__), "..", "icp"))
            
            return result.returncode == 0
            
        except Exception as e:
            print(f"Error raising resource request: {e}")
            return False
    
    def _incident_to_canister_format(self, incident: Incident) -> Dict[str, Any]:
        """Convert Incident model to canister format."""
        return {
            "incident_id": incident.incident_id,
            "farmer_id": incident.farmer_id,
            "lga": incident.lga,
            "state": incident.state,
            "geo": {
                "lat": incident.geo.lat,
                "lon": incident.geo.lon
            },
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
                "type_": incident.resource_request.type_,
                "notes": incident.resource_request.notes,
                "created_at": incident.resource_request.created_at
            },
            "audit": [
                {
                    "event": audit.event,
                    "at": audit.at
                } for audit in incident.audit
            ]
        }
    
    def _incident_to_candid_format(self, incident: Incident) -> str:
        """Convert Incident model to Candid format."""
        # Convert recommendations to Candid format
        recs_candid = "; ".join([
            f'record {{ step = "{rec.step}"; source = "{rec.source}"; created_at = "{rec.created_at}" }}'
            for rec in incident.recommendations
        ])
        
        # Convert audit to Candid format
        audit_candid = "; ".join([
            f'record {{ event = "{audit.event}"; at = "{audit.at}" }}'
            for audit in incident.audit
        ])
        
        # Convert tags to Candid format
        tags_candid = "; ".join([f'"{tag}"' for tag in incident.enriched.tags])
        
        # Convert resource request
        resource_created_at = f'"{incident.resource_request.created_at}"' if incident.resource_request.created_at else "null"
        
        return f'''(record {{
            incident_id = "{incident.incident_id}";
            farmer_id = "{incident.farmer_id}";
            lga = "{incident.lga}";
            state = "{incident.state}";
            geo = record {{ lat = {incident.geo.lat}; lon = {incident.geo.lon} }};
            crop = "{incident.crop.value}";
            category = "{incident.category.value}";
            description = "{incident.description}";
            reported_at = "{incident.reported_at}";
            enriched = record {{
                weather_hint = "{incident.enriched.weather_hint.value}";
                severity_score = {incident.enriched.severity_score};
                tags = vec {{ {tags_candid} }}
            }};
            status = "{incident.status.value}";
            recommendations = vec {{ {recs_candid} }};
            resource_request = record {{
                requested = {str(incident.resource_request.requested).lower()};
                type_ = "{incident.resource_request.type_}";
                notes = "{incident.resource_request.notes}";
                created_at = {resource_created_at}
            }};
            audit = vec {{ {audit_candid} }}
        }})'''
    
    def _parse_candid_record(self, record_text: str) -> Dict[str, Any]:
        """Parse Candid record format to dictionary."""
        # This is a simplified parser - in production, use a proper Candid parser
        result = {}
        
        # Extract basic string fields
        import re
        
        # Extract incident_id
        match = re.search(r'incident_id = "([^"]*)"', record_text)
        if match:
            result["incident_id"] = match.group(1)
        
        # Extract farmer_id
        match = re.search(r'farmer_id = "([^"]*)"', record_text)
        if match:
            result["farmer_id"] = match.group(1)
        
        # Extract lga
        match = re.search(r'lga = "([^"]*)"', record_text)
        if match:
            result["lga"] = match.group(1)
        
        # Extract state
        match = re.search(r'state = "([^"]*)"', record_text)
        if match:
            result["state"] = match.group(1)
        
        # Extract description
        match = re.search(r'description = "([^"]*)"', record_text)
        if match:
            result["description"] = match.group(1)
        
        # Extract crop
        match = re.search(r'crop = "([^"]*)"', record_text)
        if match:
            result["crop"] = match.group(1)
        
        # Extract category
        match = re.search(r'category = "([^"]*)"', record_text)
        if match:
            result["category"] = match.group(1)
        
        # Extract status
        match = re.search(r'status = "([^"]*)"', record_text)
        if match:
            result["status"] = match.group(1)
        
        # Extract reported_at
        match = re.search(r'reported_at = "([^"]*)"', record_text)
        if match:
            result["reported_at"] = match.group(1)
        
        # Extract geo
        geo_match = re.search(r'geo = record \{ lat = ([^:]+) : float64; lon = ([^:]+) : float64 \}', record_text)
        if geo_match:
            result["geo"] = {
                "lat": float(geo_match.group(1).strip()),
                "lon": float(geo_match.group(2).strip())
            }
        
        # Extract enriched
        enriched_match = re.search(r'enriched = record \{ weather_hint = "([^"]*)"; severity_score = (\d+) : nat16', record_text)
        print(f"Enriched match: {enriched_match}")
        if enriched_match:
            result["enriched"] = {
                "weather_hint": enriched_match.group(1),
                "severity_score": int(enriched_match.group(2)),
                "tags": []  # Simplified for now
            }
            print(f"Enriched parsed: {result['enriched']}")
        else:
            print("Failed to parse enriched field")
            # Add default enriched data
            result["enriched"] = {
                "weather_hint": "unknown",
                "severity_score": 0,
                "tags": []
            }
        
        # Add default values for missing fields
        if "recommendations" not in result:
            result["recommendations"] = []
        if "resource_request" not in result:
            result["resource_request"] = {
                "requested": False,
                "type_": "none",
                "notes": "",
                "created_at": None
            }
        if "audit" not in result:
            result["audit"] = []
        
        return result
    
    def _canister_to_incident_format(self, data: Dict[str, Any]) -> Incident:
        """Convert canister format to Incident model."""
        from models import CropType, CategoryType, WeatherHint, StatusType, ResourceType
        
        return Incident(
            incident_id=data["incident_id"],
            farmer_id=data["farmer_id"],
            lga=data["lga"],
            state=data["state"],
            geo=Geo(lat=data["geo"]["lat"], lon=data["geo"]["lon"]),
            crop=CropType(data["crop"]),
            category=CategoryType(data["category"]),
            description=data["description"],
            reported_at=data["reported_at"],
            enriched=Enriched(
                weather_hint=WeatherHint(data["enriched"]["weather_hint"]),
                severity_score=data["enriched"]["severity_score"],
                tags=data["enriched"]["tags"]
            ),
            status=StatusType(data["status"]),
            recommendations=[
                Recommendation(
                    step=rec["step"],
                    source=rec["source"],
                    created_at=rec["created_at"]
                ) for rec in data["recommendations"]
            ],
            resource_request=ResourceRequest(
                requested=data["resource_request"]["requested"],
                type_=data["resource_request"]["type_"],
                notes=data["resource_request"]["notes"],
                created_at=data["resource_request"]["created_at"]
            ),
            audit=[
                Audit(
                    event=audit["event"],
                    at=audit["at"]
                ) for audit in data["audit"]
            ]
        )

# Global ICP client instance
icp_client = ICPClient(canister_id="uxrrr-q7777-77774-qaaaq-cai")
