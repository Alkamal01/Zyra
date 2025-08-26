use candid::{CandidType, Deserialize};
use ic_cdk::api::time;
use ic_cdk_macros::*;
use std::collections::HashMap;

mod types;
use types::*;

// Global storage
static mut STORAGE: Option<Storage> = None;

fn get_storage() -> &'static mut Storage {
    unsafe {
        if STORAGE.is_none() {
            STORAGE = Some(Storage::new());
        }
        STORAGE.as_mut().unwrap()
    }
}

#[init]
fn init() {
    let storage = get_storage();
    ic_cdk::println!("AgriAssist canister initialized");
}

#[update]
fn create_incident(incident: Incident) -> String {
    let storage = get_storage();
    
    // Generate incident ID if not provided
    let mut incident = incident;
    if incident.incident_id.is_empty() {
        incident.incident_id = storage.generate_incident_id();
    }
    
    // Add creation audit event
    let now = format!("{}", time());
    incident.audit.push(Audit {
        event: "created".to_string(),
        at: now.clone(),
    });
    
    // Set initial status if not set
    if incident.status.is_empty() {
        incident.status = "received".to_string();
    }
    
    let incident_id = storage.add_incident(incident);
    ic_cdk::println!("Created incident: {}", incident_id);
    incident_id
}

#[query]
fn get_incident(incident_id: String) -> Option<Incident> {
    let storage = get_storage();
    storage.get_incident(&incident_id).cloned()
}

#[query]
fn list_incidents_by_lga(lga: String) -> Vec<Incident> {
    let storage = get_storage();
    storage
        .get_incidents_by_lga(&lga)
        .into_iter()
        .cloned()
        .collect()
}

#[update]
fn add_recommendation(incident_id: String, recommendation: Recommendation) {
    let storage = get_storage();
    
    if let Some(mut incident) = storage.get_incident(&incident_id).cloned() {
        incident.recommendations.push(recommendation);
        
        // Add audit event
        let now = format!("{}", time());
        incident.audit.push(Audit {
            event: "recommendation_added".to_string(),
            at: now,
        });
        
        storage.update_incident(&incident_id, incident);
        ic_cdk::println!("Added recommendation to incident: {}", incident_id);
    }
}

#[update]
fn set_status(incident_id: String, status: String) {
    let storage = get_storage();
    
    if let Some(mut incident) = storage.get_incident(&incident_id).cloned() {
        incident.status = status.clone();
        
        // Add audit event
        let now = format!("{}", time());
        incident.audit.push(Audit {
            event: format!("status_updated_to_{}", status),
            at: now,
        });
        
        storage.update_incident(&incident_id, incident);
        ic_cdk::println!("Updated status for incident {} to: {}", incident_id, status);
    }
}

#[update]
fn raise_resource_request(incident_id: String, request_type: String, notes: String) {
    let storage = get_storage();
    
    if let Some(mut incident) = storage.get_incident(&incident_id).cloned() {
        let now = format!("{}", time());
        
        incident.resource_request = ResourceRequest {
            requested: true,
            type_: request_type.clone(),
            notes: notes.clone(),
            created_at: Some(now.clone()),
        };
        
        // Add audit event
        incident.audit.push(Audit {
            event: "resource_requested".to_string(),
            at: now,
        });
        
        storage.update_incident(&incident_id, incident);
        ic_cdk::println!("Raised resource request for incident {}: {} - {}", incident_id, request_type, notes);
    }
}

// Additional helper methods for demo and testing
#[query]
fn get_all_incidents() -> Vec<Incident> {
    let storage = get_storage();
    storage.incidents.values().cloned().collect()
}

#[query]
fn get_incident_count() -> u64 {
    let storage = get_storage();
    storage.incidents.len() as u64
}

#[query]
fn get_incidents_by_status(status: String) -> Vec<Incident> {
    let storage = get_storage();
    storage
        .incidents
        .values()
        .filter(|incident| incident.status == status)
        .cloned()
        .collect()
}

#[query]
fn get_high_severity_incidents() -> Vec<Incident> {
    let storage = get_storage();
    storage
        .incidents
        .values()
        .filter(|incident| incident.enriched.severity_score >= 70)
        .cloned()
        .collect()
}
