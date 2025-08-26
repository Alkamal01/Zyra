use candid::{CandidType, Deserialize};
use serde::{Deserialize as SerdeDeserialize, Serialize as SerdeSerialize};
use std::collections::HashMap;

#[derive(CandidType, Deserialize, Clone, SerdeSerialize)]
pub struct Geo {
    pub lat: f64,
    pub lon: f64,
}

#[derive(CandidType, Deserialize, Clone, SerdeSerialize)]
pub struct Recommendation {
    pub step: String,
    pub source: String,
    pub created_at: String,
}

#[derive(CandidType, Deserialize, Clone, SerdeSerialize)]
pub struct Audit {
    pub event: String,
    pub at: String,
}

#[derive(CandidType, Deserialize, Clone, SerdeSerialize)]
pub struct Enriched {
    pub weather_hint: String,
    pub severity_score: u16,
    pub tags: Vec<String>,
}

#[derive(CandidType, Deserialize, Clone, SerdeSerialize)]
pub struct ResourceRequest {
    pub requested: bool,
    pub type_: String,
    pub notes: String,
    pub created_at: Option<String>,
}

#[derive(CandidType, Deserialize, Clone, SerdeSerialize)]
pub struct Incident {
    pub incident_id: String,
    pub farmer_id: String,
    pub lga: String,
    pub state: String,
    pub geo: Geo,
    pub crop: String,
    pub category: String,
    pub description: String,
    pub reported_at: String,
    pub enriched: Enriched,
    pub status: String,
    pub recommendations: Vec<Recommendation>,
    pub resource_request: ResourceRequest,
    pub audit: Vec<Audit>,
}

// Storage structure
#[derive(Default)]
pub struct Storage {
    pub incidents: HashMap<String, Incident>,
    pub next_id: u64,
}

impl Storage {
    pub fn new() -> Self {
        Self {
            incidents: HashMap::new(),
            next_id: 1,
        }
    }

    pub fn generate_incident_id(&mut self) -> String {
        let id = format!("inc-{:06}", self.next_id);
        self.next_id += 1;
        id
    }

    pub fn add_incident(&mut self, incident: Incident) -> String {
        let incident_id = incident.incident_id.clone();
        self.incidents.insert(incident_id.clone(), incident);
        incident_id
    }

    pub fn get_incident(&self, incident_id: &str) -> Option<&Incident> {
        self.incidents.get(incident_id)
    }

    pub fn get_incidents_by_lga(&self, lga: &str) -> Vec<&Incident> {
        self.incidents
            .values()
            .filter(|incident| incident.lga == lga)
            .collect()
    }

    pub fn update_incident(&mut self, incident_id: &str, incident: Incident) -> bool {
        if self.incidents.contains_key(incident_id) {
            self.incidents.insert(incident_id.to_string(), incident);
            true
        } else {
            false
        }
    }
}
