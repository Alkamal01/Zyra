import requests
import json
from uagents_core.contrib.protocols.chat import (
    chat_protocol_spec,
    ChatMessage,
    ChatAcknowledgement,
    TextContent,
    StartSessionContent,
)
from uagents import Agent, Context, Protocol
from datetime import datetime, timezone, timedelta
from uuid import uuid4
import os
from typing import Dict, Any

# Import our existing models and utilities
from models import FarmerReport, EnrichmentResult, ChainWriteAck, OperatorQuery, AgentResponse
from utils import (
    enrich_incident, generate_recommendation, should_raise_resource_request,
    get_resource_request_type, create_audit_event, load_seed_data,
    group_incidents_by_category, format_incident_summary
)
from icp_client import icp_client

# ASI:One API settings
ASI1_API_KEY=os.getenv("ASI1_API_KEY", "")  # Set your ASI1 key
ASI1_BASE_URL = "https://api.asi1.ai/v1"
ASI1_HEADERS = {
    "Authorization": f"Bearer {ASI1_API_KEY}",
    "Content-Type": "application/json"
}

# ICP Canister settings
CANISTER_ID = os.getenv("CANISTER_ID", "uxrrr-q7777-77774-qaaaq-cai")
BASE_URL = os.getenv("ICP_BASE_URL", "http://127.0.0.1:4943")

# Function definitions for ASI:One function calling
tools = [
    {
        "type": "function",
        "function": {
            "name": "report_agricultural_incident",
            "description": "Report an agricultural incident or problem from a farmer.",
            "parameters": {
                "type": "object",
                "properties": {
                    "farmer_id": {
                        "type": "string",
                        "description": "The farmer's unique identifier."
                    },
                    "lga": {
                        "type": "string",
                        "description": "Local Government Area where the incident occurred."
                    },
                    "state": {
                        "type": "string",
                        "description": "State where the incident occurred."
                    },
                    "crop": {
                        "type": "string",
                        "description": "The crop affected (maize, rice, cassava, yam, sorghum, millet, cowpea, groundnut, cotton, cocoa)."
                    },
                    "category": {
                        "type": "string",
                        "description": "The type of incident (pest_infestation, disease_outbreak, weather_damage, soil_issues, water_shortage, equipment_failure, market_access, storage_problems, labor_shortage, other)."
                    },
                    "description": {
                        "type": "string",
                        "description": "Detailed description of the incident or problem."
                    },
                    "latitude": {
                        "type": "number",
                        "description": "Geographic latitude of the incident location."
                    },
                    "longitude": {
                        "type": "number",
                        "description": "Geographic longitude of the incident location."
                    }
                },
                "required": ["farmer_id", "lga", "state", "crop", "category", "description", "latitude", "longitude"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "query_incidents_by_lga",
            "description": "Query agricultural incidents by Local Government Area (LGA).",
            "parameters": {
                "type": "object",
                "properties": {
                    "lga": {
                        "type": "string",
                        "description": "The Local Government Area to query incidents for."
                    }
                },
                "required": ["lga"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_incident_details",
            "description": "Get detailed information about a specific incident.",
            "parameters": {
                "type": "object",
                "properties": {
                    "incident_id": {
                        "type": "string",
                        "description": "The unique identifier of the incident."
                    }
                },
                "required": ["incident_id"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "add_recommendation_to_incident",
            "description": "Add a recommendation to an existing incident.",
            "parameters": {
                "type": "object",
                "properties": {
                    "incident_id": {
                        "type": "string",
                        "description": "The unique identifier of the incident."
                    },
                    "recommendation": {
                        "type": "string",
                        "description": "The recommendation text to add."
                    }
                },
                "required": ["incident_id", "recommendation"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_incident_status",
            "description": "Update the status of an incident (received, processing, recommended, resolved, closed).",
            "parameters": {
                "type": "object",
                "properties": {
                    "incident_id": {
                        "type": "string",
                        "description": "The unique identifier of the incident."
                    },
                    "status": {
                        "type": "string",
                        "description": "The new status for the incident."
                    }
                },
                "required": ["incident_id", "status"],
                "additionalProperties": False
            },
            "strict": True
        }
    }
]

async def call_agricultural_function(func_name: str, args: dict):
    """Execute agricultural functions based on ASI:One function calls."""
    try:
        if func_name == "report_agricultural_incident":
            # Create FarmerReport object
            from models import FarmerReport, Geo, CropType, CategoryType
            
            farmer_report = FarmerReport(
                farmer_id=args["farmer_id"],
                lga=args["lga"],
                state=args["state"],
                geo=Geo(lat=args["latitude"], lon=args["longitude"]),
                crop=CropType(args["crop"]),
                category=CategoryType(args["category"]),
                description=args["description"]
            )
            
            # Process the report
            result = await process_farmer_report(farmer_report)
            return result
            
        elif func_name == "query_incidents_by_lga":
            # Create OperatorQuery object
            operator_query = OperatorQuery(lga=args["lga"])
            result = await process_operator_query(operator_query)
            return result
            
        elif func_name == "get_incident_details":
            # Get incident from ICP canister
            incident = icp_client.get_incident(args["incident_id"])
            if incident:
                return {
                    "success": True,
                    "incident": {
                        "incident_id": incident.incident_id,
                        "farmer_id": incident.farmer_id,
                        "lga": incident.lga,
                        "state": incident.state,
                        "crop": incident.crop.value,
                        "category": incident.category.value,
                        "description": incident.description,
                        "status": incident.status.value,
                        "severity_score": incident.enriched.severity_score,
                        "recommendations": [
                            {
                                "step": rec.step,
                                "source": rec.source,
                                "created_at": rec.created_at
                            } for rec in incident.recommendations
                        ]
                    }
                }
            else:
                return {"success": False, "message": "Incident not found"}
                
        elif func_name == "add_recommendation_to_incident":
            # Add recommendation to incident
            from models import Recommendation
            recommendation = Recommendation(
                step=args["recommendation"],
                source="agent_recommendation",
                created_at=datetime.utcnow().isoformat() + "Z"
            )
            result = icp_client.add_recommendation(args["incident_id"], recommendation)
            return {"success": True, "message": "Recommendation added successfully"}
            
        elif func_name == "update_incident_status":
            # Update incident status
            from models import StatusType
            status = StatusType(args["status"])
            result = icp_client.set_status(args["incident_id"], status)
            return {"success": True, "message": f"Status updated to {args['status']}"}
            
        else:
            raise ValueError(f"Unsupported function call: {func_name}")
            
    except Exception as e:
        return {"success": False, "error": str(e)}

async def process_farmer_report(farmer_report: FarmerReport):
    """Process a farmer report and store it on-chain."""
    try:
        # Step 1: Enrich the incident
        enrichment = enrich_incident(
            farmer_report.category, farmer_report.crop, 
            farmer_report.geo.lat, farmer_report.geo.lon, 
            farmer_report.description
        )
        
        # Step 2: Create incident object
        now = datetime.utcnow().isoformat() + "Z"
        
        from models import Incident, Geo, Enriched, StatusType, ResourceRequest, Audit
        
        incident_obj = Incident(
            incident_id="",  # Will be assigned by canister
            farmer_id=farmer_report.farmer_id,
            lga=farmer_report.lga,
            state=farmer_report.state,
            geo=Geo(lat=farmer_report.geo.lat, lon=farmer_report.geo.lon),
            crop=farmer_report.crop,
            category=farmer_report.category,
            description=farmer_report.description,
            reported_at=now,
            enriched=enrichment,
            status=StatusType.RECEIVED,
            recommendations=[],
            resource_request=ResourceRequest(),
            audit=[]
        )
        
        # Step 3: Store on ICP canister
        incident_id = icp_client.create_incident(incident_obj)
        
        # Step 4: Generate recommendation
        recommendation = generate_recommendation(
            farmer_report.category, farmer_report.crop, enrichment.severity_score
        )
        
        # Step 5: Check if resource request needed
        resource_info = ""
        if should_raise_resource_request(enrichment.severity_score, farmer_report.category):
            resource_type = get_resource_request_type(farmer_report.category, farmer_report.crop)
            resource_info = f" A resource request has been raised for {resource_type}."
        
        return {
            "success": True,
            "incident_id": incident_id,
            "severity_score": enrichment.severity_score,
            "recommendation": recommendation.step,
            "resource_info": resource_info,
            "message": f"Incident recorded successfully. Severity: {enrichment.severity_score}/100. {resource_info}"
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}

async def process_operator_query(operator_query: OperatorQuery):
    """Process an operator query for incidents by LGA."""
    try:
        # Load incidents from ICP canister
        icp_incidents = icp_client.list_incidents_by_lga(operator_query.lga)
        
        if not icp_incidents:
            return {
                "success": True,
                "message": f"No incidents found for {operator_query.lga}",
                "incidents": [],
                "summary": {"total": 0}
            }
        
        # Convert to dict format
        incidents = []
        for incident in icp_incidents:
            incidents.append({
                "incident_id": incident.incident_id,
                "farmer_id": incident.farmer_id,
                "crop": incident.crop.value,
                "category": incident.category.value,
                "severity_score": incident.enriched.severity_score,
                "status": incident.status.value
            })
        
        # Group by category
        category_counts = group_incidents_by_category(incidents)
        
        # Get high severity count
        high_severity_count = len([inc for inc in incidents if inc["severity_score"] >= 70])
        
        summary = {
            "lga": operator_query.lga,
            "total_incidents": len(incidents),
            "category_breakdown": category_counts,
            "high_severity_count": high_severity_count
        }
        
        return {
            "success": True,
            "message": f"Found {len(incidents)} incidents in {operator_query.lga}. High severity: {high_severity_count}",
            "incidents": incidents,
            "summary": summary
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}

async def process_query(query: str, ctx: Context) -> str:
    """Process natural language queries using ASI:One."""
    try:
        # Step 1: Initial call to ASI:1 with user query and tools
        initial_message = {
            "role": "user",
            "content": query
        }
        payload = {
            "model": "asi1-mini",
            "messages": [initial_message],
            "tools": tools,
            "temperature": 0.7,
            "max_tokens": 1024
        }
        
        response = requests.post(
            f"{ASI1_BASE_URL}/chat/completions",
            headers=ASI1_HEADERS,
            json=payload
        )
        response.raise_for_status()
        response_json = response.json()

        # Step 2: Parse tool calls from response
        tool_calls = response_json["choices"][0]["message"].get("tool_calls", [])
        messages_history = [initial_message, response_json["choices"][0]["message"]]

        if not tool_calls:
            return "I couldn't determine what agricultural information you're looking for. Please try rephrasing your question or ask about reporting incidents, querying by location, or getting incident details."

        # Step 3: Execute tools and format results
        for tool_call in tool_calls:
            func_name = tool_call["function"]["name"]
            arguments = json.loads(tool_call["function"]["arguments"])
            tool_call_id = tool_call["id"]

            ctx.logger.info(f"Executing {func_name} with arguments: {arguments}")

            try:
                result = await call_agricultural_function(func_name, arguments)
                content_to_send = json.dumps(result)
            except Exception as e:
                error_content = {
                    "error": f"Tool execution failed: {str(e)}",
                    "status": "failed"
                }
                content_to_send = json.dumps(error_content)

            tool_result_message = {
                "role": "tool",
                "tool_call_id": tool_call_id,
                "content": content_to_send
            }
            messages_history.append(tool_result_message)

        # Step 4: Send results back to ASI:1 for final answer
        final_payload = {
            "model": "asi1-mini",
            "messages": messages_history,
            "temperature": 0.7,
            "max_tokens": 1024
        }
        final_response = requests.post(
            f"{ASI1_BASE_URL}/chat/completions",
            headers=ASI1_HEADERS,
            json=final_payload
        )
        final_response.raise_for_status()
        final_response_json = final_response.json()

        # Step 5: Return the model's final answer
        return final_response_json["choices"][0]["message"]["content"]

    except Exception as e:
        ctx.logger.error(f"Error processing query: {str(e)}")
        return f"An error occurred while processing your request: {str(e)}"

# Create the agent
agent = Agent(
    name='zyra-agricultural-agent',
    port=8001,
    mailbox=True
)

# Create chat protocol
chat_proto = Protocol(spec=chat_protocol_spec)

@chat_proto.on_message(model=ChatMessage)
async def handle_chat_message(ctx: Context, sender: str, msg: ChatMessage):
    """Handle incoming chat messages using ASI:One for natural language processing."""
    try:
        ack = ChatAcknowledgement(
            timestamp=datetime.now(timezone.utc),
            acknowledged_msg_id=msg.msg_id
        )
        await ctx.send(sender, ack)

        for item in msg.content:
            if isinstance(item, StartSessionContent):
                ctx.logger.info(f"Got a start session message from {sender}")
                # Send welcome message
                welcome_response = ChatMessage(
                    timestamp=datetime.now(timezone.utc),
                    msg_id=uuid4(),
                    content=[TextContent(type="text", text="Hello! I'm Zyra, your agricultural extension agent. I can help you report incidents, query data by location, and manage agricultural issues. How can I assist you today?")]
                )
                await ctx.send(sender, welcome_response)
                continue
            elif isinstance(item, TextContent):
                ctx.logger.info(f"Got a message from {sender}: {item.text}")
                response_text = await process_query(item.text, ctx)
                ctx.logger.info(f"Response text: {response_text}")
                response = ChatMessage(
                    timestamp=datetime.now(timezone.utc),
                    msg_id=uuid4(),
                    content=[TextContent(type="text", text=response_text)]
                )
                await ctx.send(sender, response)
            else:
                ctx.logger.info(f"Got unexpected content from {sender}")
    except Exception as e:
        ctx.logger.error(f"Error handling chat message: {str(e)}")
        error_response = ChatMessage(
            timestamp=datetime.now(timezone.utc),
            msg_id=uuid4(),
            content=[TextContent(type="text", text=f"An error occurred: {str(e)}")]
        )
        await ctx.send(sender, error_response)

@chat_proto.on_message(model=ChatAcknowledgement)
async def handle_chat_acknowledgement(ctx: Context, sender: str, msg: ChatAcknowledgement):
    """Handle chat acknowledgements."""
    ctx.logger.info(f"Received acknowledgement from {sender} for message {msg.acknowledged_msg_id}")
    if msg.metadata:
        ctx.logger.info(f"Metadata: {msg.metadata}")

# Include the chat protocol in the agent
agent.include(chat_proto)

if __name__ == "__main__":
    print("🌱 Starting Zyra Agricultural Extension Agent with ASI:One Integration")
    print("=" * 70)
    print(f"Agent Name: {agent.name}")
    print(f"Agent Address: {agent.address}")
    print(f"Port: 8001")
    print(f"Mailbox: Enabled")
    print(f"ASI:One Integration: {'Enabled' if ASI1_API_KEY != 'your_asi1_api_key' else 'Disabled (set ASI1_API_KEY env var)'}")
    print(f"ICP Canister ID: {CANISTER_ID}")
    print("=" * 70)
    print("Agent inspector available at: https://agentverse.ai/inspect/")
    print("=" * 70)
    
    agent.run()
