import json
import os
from datetime import datetime
from typing import List, Dict, Any
from models import (
    EnrichmentResult, WeatherHint, CategoryType, CropType,
    Recommendation, ResourceRequest, Audit, Incident
)

def get_weather_hint(lat: float, lon: float, description: str) -> WeatherHint:
    """
    Stub weather function for demo purposes.
    In production, this would call a real weather API.
    """
    description_lower = description.lower()
    
    # Simple rules based on location and description
    if 6 <= lat <= 14 and "rain" in description_lower:
        return WeatherHint.RAINY
    elif "humid" in description_lower or "mold" in description_lower:
        return WeatherHint.HUMID
    elif "dry" in description_lower or "drought" in description_lower:
        return WeatherHint.DRY
    elif "sunny" in description_lower or "hot" in description_lower:
        return WeatherHint.SUNNY
    else:
        return WeatherHint.UNKNOWN

def calculate_severity_score(category: CategoryType, crop: CropType, 
                           weather_hint: WeatherHint, description: str) -> int:
    """
    Calculate severity score based on category, crop, weather, and description.
    Returns a score from 0-100.
    """
    base_score = 0
    
    # Base scores by category
    if category == CategoryType.PEST:
        base_score = 50
    elif category == CategoryType.DISEASE:
        base_score = 50
    elif category == CategoryType.FLOOD:
        base_score = 70
    elif category == CategoryType.DROUGHT:
        base_score = 60
    elif category == CategoryType.INPUT_NEED:
        base_score = 40
    else:
        base_score = 30
    
    # Priority crops get +10
    priority_crops = [CropType.MAIZE, CropType.RICE, CropType.CASSAVA]
    if crop in priority_crops:
        base_score += 10
    
    # Weather risk factors
    if weather_hint == WeatherHint.HUMID and category == CategoryType.DISEASE:
        base_score += 10
    elif weather_hint == WeatherHint.RAINY and category == CategoryType.FLOOD:
        base_score += 10
    elif weather_hint == WeatherHint.DRY and category == CategoryType.DROUGHT:
        base_score += 10
    
    # Description-based adjustments
    description_lower = description.lower()
    if "fast spread" in description_lower or "rapid" in description_lower:
        base_score += 15
    if "severe" in description_lower or "critical" in description_lower:
        base_score += 20
    if "young" in description_lower or "seedling" in description_lower:
        base_score += 5
    
    # Cap at 100
    return min(base_score, 100)

def generate_tags(category: CategoryType, crop: CropType) -> List[str]:
    """
    Generate relevant tags based on category and crop.
    """
    tags = []
    
    if category == CategoryType.PEST:
        if crop == CropType.MAIZE:
            tags.append("fall_armyworm")
        else:
            tags.append("pest_alert")
    
    elif category == CategoryType.DISEASE:
        if crop == CropType.CASSAVA:
            tags.append("cassava_mosaic")
        else:
            tags.append("disease_alert")
    
    elif category == CategoryType.FLOOD:
        tags.append("flood_risk")
    
    elif category == CategoryType.DROUGHT:
        tags.append("drought_alert")
    
    elif category == CategoryType.INPUT_NEED:
        tags.append("input_request")
    
    # Add crop-specific tags
    tags.append(f"{crop.value}_crop")
    
    return tags

def enrich_incident(category: CategoryType, crop: CropType, 
                   lat: float, lon: float, description: str) -> EnrichmentResult:
    """
    Enrich incident with weather, severity, and tags.
    """
    weather_hint = get_weather_hint(lat, lon, description)
    severity_score = calculate_severity_score(category, crop, weather_hint, description)
    tags = generate_tags(category, crop)
    
    return EnrichmentResult(
        weather_hint=weather_hint,
        severity_score=severity_score,
        tags=tags
    )

def generate_recommendation(category: CategoryType, crop: CropType, severity_score: int) -> Recommendation:
    """
    Generate crop-specific recommendation based on category and severity.
    """
    now = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
    
    # Base recommendations by category and crop
    recommendations = {
        (CategoryType.PEST, CropType.MAIZE): [
            "Scout daily, apply recommended Bt pesticide per label, remove heavily infested plants",
            "Use pheromone traps, apply neem-based products, rotate crops"
        ],
        (CategoryType.PEST, CropType.RICE): [
            "Apply recommended insecticide, maintain field hygiene, use resistant varieties",
            "Monitor regularly, apply biological controls, avoid over-fertilization"
        ],
        (CategoryType.PEST, CropType.CASSAVA): [
            "Apply systemic insecticide, remove affected parts, use clean planting material",
            "Practice crop rotation, maintain field borders, use resistant varieties"
        ],
        (CategoryType.PEST, CropType.TOMATO): [
            "Apply appropriate pesticide, use yellow sticky traps, maintain spacing",
            "Remove affected plants, apply neem oil, use floating row covers"
        ],
        (CategoryType.DISEASE, CropType.MAIZE): [
            "Remove infected plants, apply fungicide, use resistant varieties",
            "Practice crop rotation, maintain field hygiene, avoid overhead irrigation"
        ],
        (CategoryType.DISEASE, CropType.RICE): [
            "Apply fungicide, remove infected plants, use certified seeds",
            "Maintain proper spacing, avoid waterlogging, use resistant varieties"
        ],
        (CategoryType.DISEASE, CropType.CASSAVA): [
            "Use disease-free cuttings, remove infected leaves, consider tolerant varieties",
            "Practice crop rotation, maintain field hygiene, use resistant varieties"
        ],
        (CategoryType.DISEASE, CropType.TOMATO): [
            "Apply fungicide, remove affected leaves, improve air circulation",
            "Use resistant varieties, avoid overhead irrigation, maintain spacing"
        ],
        (CategoryType.FLOOD, CropType.MAIZE): [
            "Open drainage channels, delay planting for 48 hours, avoid nitrogen top-dressing",
            "Improve field drainage, consider raised beds, monitor for diseases"
        ],
        (CategoryType.FLOOD, CropType.RICE): [
            "Open drainage channels, delay new planting for 72 hours, avoid nitrogen top-dressing",
            "Maintain proper water level, use flood-tolerant varieties, monitor for pests"
        ],
        (CategoryType.FLOOD, CropType.CASSAVA): [
            "Improve drainage, delay harvesting, monitor for root rot",
            "Consider raised beds, use tolerant varieties, avoid waterlogging"
        ],
        (CategoryType.FLOOD, CropType.TOMATO): [
            "Improve drainage immediately, delay planting, monitor for diseases",
            "Use raised beds, consider container gardening, avoid waterlogging"
        ],
        (CategoryType.DROUGHT, CropType.MAIZE): [
            "Apply mulch, use drought-tolerant varieties, consider irrigation",
            "Practice conservation tillage, use organic matter, monitor soil moisture"
        ],
        (CategoryType.DROUGHT, CropType.RICE): [
            "Maintain water level, use drought-tolerant varieties, consider alternate wetting",
            "Use mulch, practice conservation tillage, monitor water availability"
        ],
        (CategoryType.DROUGHT, CropType.CASSAVA): [
            "Apply mulch, use drought-tolerant varieties, consider irrigation",
            "Practice conservation tillage, use organic matter, monitor soil moisture"
        ],
        (CategoryType.DROUGHT, CropType.TOMATO): [
            "Apply mulch, use drought-tolerant varieties, consider drip irrigation",
            "Use shade cloth, practice conservation tillage, monitor soil moisture"
        ],
        (CategoryType.INPUT_NEED, CropType.MAIZE): [
            "Register for input support, recommended seed variety list attached",
            "Contact extension officer, consider improved varieties, plan for next season"
        ],
        (CategoryType.INPUT_NEED, CropType.RICE): [
            "Register for input support, recommended seed variety list attached",
            "Contact extension officer, consider improved varieties, plan for next season"
        ],
        (CategoryType.INPUT_NEED, CropType.CASSAVA): [
            "Register for input support, recommended cutting variety list attached",
            "Contact extension officer, consider improved varieties, plan for next season"
        ],
        (CategoryType.INPUT_NEED, CropType.TOMATO): [
            "Register for input support, recommended seed variety list attached",
            "Contact extension officer, consider improved varieties, plan for next season"
        ]
    }
    
    # Get recommendation for this category-crop combination
    key = (category, crop)
    if key in recommendations:
        # Choose recommendation based on severity
        if severity_score >= 70:
            # High severity - use urgent recommendation
            recommendation_text = "URGENT: " + recommendations[key][0] + " (High severity incident - immediate action required)"
        else:
            # Lower severity - use standard recommendation
            recommendation_text = recommendations[key][0]
    else:
        # Default recommendation
        recommendation_text = f"Contact extension officer for {category.value} management in {crop.value}"
    
    return Recommendation(
        step=recommendation_text,
        source="extension_manual_stub",
        created_at=now
    )

def should_raise_resource_request(severity_score: int, category: CategoryType) -> bool:
    """
    Determine if a resource request should be raised.
    """
    return severity_score >= 70

def get_resource_request_type(category: CategoryType, crop: CropType) -> str:
    """
    Determine the type of resource request based on category and crop.
    """
    if category == CategoryType.PEST:
        return "agrochemical"
    elif category == CategoryType.DISEASE:
        return "agrochemical"
    elif category == CategoryType.FLOOD:
        return "irrigation"
    elif category == CategoryType.DROUGHT:
        return "irrigation"
    elif category == CategoryType.INPUT_NEED:
        return "seed"
    else:
        return "training"

def create_audit_event(event: str) -> Audit:
    """Create an audit event with current timestamp."""
    now = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
    return Audit(event=event, at=now)

def load_seed_data() -> List[Dict[str, Any]]:
    """
    Load seed incident data from JSON file.
    """
    seed_path = os.path.join(os.path.dirname(__file__), "..", "data", "seed_incidents.json")
    try:
        with open(seed_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Warning: Seed data file not found at {seed_path}")
        return []

def format_incident_summary(incident: Dict[str, Any]) -> str:
    """
    Format incident for display in summaries.
    """
    return f"{incident['incident_id']} | {incident['crop']} | {incident['category']} | Severity: {incident['enriched']['severity_score']} | Status: {incident['status']}"

def group_incidents_by_category(incidents: List[Dict[str, Any]]) -> Dict[str, int]:
    """Group incidents by category and return counts."""
    counts = {}
    for incident in incidents:
        category = incident["category"]
        counts[category] = counts.get(category, 0) + 1
    return counts
