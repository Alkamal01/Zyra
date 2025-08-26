from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class CropType(str, Enum):
    MAIZE = "maize"
    RICE = "rice"
    CASSAVA = "cassava"
    TOMATO = "tomato"
    SORGHUM = "sorghum"
    OTHER = "other"

class CategoryType(str, Enum):
    PEST = "pest"
    DISEASE = "disease"
    FLOOD = "flood"
    DROUGHT = "drought"
    INPUT_NEED = "input_need"
    OTHER = "other"

class WeatherHint(str, Enum):
    SUNNY = "sunny"
    RAINY = "rainy"
    HUMID = "humid"
    DRY = "dry"
    UNKNOWN = "unknown"

class StatusType(str, Enum):
    RECEIVED = "received"
    RECOMMENDED = "recommended"
    DISPATCHED = "dispatched"
    CLOSED = "closed"

class ResourceType(str, Enum):
    AGROCHEMICAL = "agrochemical"
    SEED = "seed"
    TRAINING = "training"
    IRRIGATION = "irrigation"
    NONE = "none"

class Geo(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)

class Recommendation(BaseModel):
    step: str
    source: str
    created_at: str

class Audit(BaseModel):
    event: str
    at: str

class Enriched(BaseModel):
    weather_hint: WeatherHint
    severity_score: int = Field(..., ge=0, le=100)
    tags: List[str]

class ResourceRequest(BaseModel):
    requested: bool = False
    type_: str = Field(default=ResourceType.NONE, alias="type")
    notes: str = ""
    created_at: Optional[str] = None

class Incident(BaseModel):
    incident_id: str = ""
    farmer_id: str
    lga: str
    state: str
    geo: Geo
    crop: CropType
    category: CategoryType
    description: str
    reported_at: str
    enriched: Enriched
    status: StatusType = StatusType.RECEIVED
    recommendations: List[Recommendation] = []
    resource_request: ResourceRequest = ResourceRequest()
    audit: List[Audit] = []

    class Config:
        validate_by_name = True

# uAgent Message Models
class FarmerReport(BaseModel):
    farmer_id: str
    lga: str
    state: str
    geo: Geo
    crop: CropType
    category: CategoryType
    description: str

class EnrichmentResult(BaseModel):
    weather_hint: WeatherHint
    severity_score: int
    tags: List[str]

class ChainWriteAck(BaseModel):
    incident_id: str
    written_at: str

class OperatorQuery(BaseModel):
    lga: str

class AgentResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

# Demo and utility models
class SeedIncident(BaseModel):
    farmer_id: str
    lga: str
    state: str
    geo: Geo
    crop: CropType
    category: CategoryType
    description: str

class Farmer(BaseModel):
    farmer_id: str
    name: str
    phone: str
    lga: str
    state: str
    lat: float
    lon: float
    primary_crop: CropType
