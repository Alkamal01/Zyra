"""
AI Service using Groq AI for agricultural incident processing.
Replaces FetchAI uAgent functionality with direct Groq API calls.
"""

import os
import json
from typing import Dict, Any, List, Optional
from datetime import datetime
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class GroqAIService:
    """AI service using Groq for agricultural incident processing."""
    
    def __init__(self):
        """Initialize Groq client."""
        api_key = os.getenv("GROQ_API_KEY")
        if api_key and api_key != "your_groq_api_key_here":
            self.client = Groq(api_key=api_key)
            self.model = "llama-3.1-8b-instant"  # Fast and efficient model for agricultural tasks
            self.groq_available = True
        else:
            self.client = None
            self.model = None
            self.groq_available = False
            print("⚠️  Groq API key not found. Using fallback analysis mode.")
        
    async def analyze_incident(self, 
                             category: str, 
                             crop: str, 
                             description: str, 
                             lat: float, 
                             lon: float) -> Dict[str, Any]:
        """
        Analyze agricultural incident using Groq AI.
        
        Args:
            category: Type of agricultural issue (pest, disease, flood, etc.)
            crop: Type of crop affected
            description: Detailed description of the issue
            lat: Latitude of the location
            lon: Longitude of the location
            
        Returns:
            Dictionary containing analysis results
        """
        try:
            if not self.groq_available:
                return self._get_fallback_analysis(category, crop)
                
            # Create analysis prompt
            prompt = self._create_analysis_prompt(category, crop, description, lat, lon)
            
            # Call Groq API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert agricultural extension agent specializing in Nigerian agriculture. Analyze agricultural incidents and provide detailed recommendations."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            # Parse response
            analysis_text = response.choices[0].message.content
            analysis = self._parse_analysis_response(analysis_text)
            
            return analysis
            
        except Exception as e:
            print(f"Error in Groq AI analysis: {e}")
            # Return fallback analysis
            return self._get_fallback_analysis(category, crop)
    
    async def generate_recommendation(self, 
                                    category: str, 
                                    crop: str, 
                                    severity_score: int,
                                    analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate specific recommendations using Groq AI.
        
        Args:
            category: Type of agricultural issue
            crop: Type of crop affected
            severity_score: Severity score (0-100)
            analysis: Previous analysis results
            
        Returns:
            Dictionary containing recommendations
        """
        try:
            if not self.groq_available:
                return self._get_fallback_recommendation(category, crop, severity_score)
                
            prompt = self._create_recommendation_prompt(category, crop, severity_score, analysis)
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert agricultural extension agent. Provide specific, actionable recommendations for agricultural issues in Nigeria."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.2,
                max_tokens=800
            )
            
            recommendation_text = response.choices[0].message.content
            recommendation = self._parse_recommendation_response(recommendation_text)
            
            return recommendation
            
        except Exception as e:
            print(f"Error generating recommendation: {e}")
            return self._get_fallback_recommendation(category, crop, severity_score)
    
    async def process_natural_language_query(self, query: str) -> Dict[str, Any]:
        """
        Process natural language queries using Groq AI.
        
        Args:
            query: Natural language query from user
            
        Returns:
            Dictionary containing query response
        """
        try:
            if not self.groq_available:
                return {
                    "query_type": "help",
                    "parameters": {},
                    "response": "I'm currently in fallback mode. Please use the report form to submit agricultural issues.",
                    "action_required": "report_incident"
                }
                
            prompt = f"""
            Process this agricultural query and determine the appropriate action:
            
            Query: "{query}"
            
            Determine:
            1. Query type (report_incident, query_incidents, get_help, etc.)
            2. Extracted parameters (if any)
            3. Suggested response
            
            Respond in JSON format with:
            {{
                "query_type": "type",
                "parameters": {{}},
                "response": "suggested response",
                "action_required": "action needed"
            }}
            """
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an AI assistant for agricultural extension services. Process queries and determine appropriate actions."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.1,
                max_tokens=500
            )
            
            response_text = response.choices[0].message.content
            return self._parse_query_response(response_text)
            
        except Exception as e:
            print(f"Error processing query: {e}")
            return {
                "query_type": "unknown",
                "parameters": {},
                "response": "I'm sorry, I couldn't process your query. Please try again.",
                "action_required": "none"
            }
    
    def _create_analysis_prompt(self, category: str, crop: str, description: str, lat: float, lon: float) -> str:
        """Create prompt for incident analysis."""
        return f"""
        Analyze this agricultural incident in Nigeria:
        
        Category: {category}
        Crop: {crop}
        Description: {description}
        Location: {lat}, {lon}
        
        Provide analysis in JSON format:
        {{
            "severity_score": 0-100,
            "weather_hint": "weather condition that might be relevant",
            "tags": ["tag1", "tag2", "tag3"],
            "risk_factors": ["factor1", "factor2"],
            "urgency_level": "low/medium/high",
            "affected_area_estimate": "small/medium/large",
            "potential_spread": "low/medium/high"
        }}
        
        Consider:
        - Nigerian agricultural context
        - Seasonal factors
        - Common issues for {crop}
        - Severity of {category} problems
        - Geographic location implications
        """
    
    def _create_recommendation_prompt(self, category: str, crop: str, severity_score: int, analysis: Dict[str, Any]) -> str:
        """Create prompt for generating recommendations."""
        return f"""
        Generate specific recommendations for this agricultural issue:
        
        Category: {category}
        Crop: {crop}
        Severity: {severity_score}/100
        Analysis: {json.dumps(analysis, indent=2)}
        
        Provide recommendations in JSON format:
        {{
            "immediate_actions": ["action1", "action2"],
            "preventive_measures": ["measure1", "measure2"],
            "monitoring_steps": ["step1", "step2"],
            "resource_needs": ["resource1", "resource2"],
            "timeline": "expected resolution time",
            "follow_up_required": true/false
        }}
        
        Focus on:
        - Practical, implementable solutions
        - Nigerian agricultural practices
        - Cost-effective approaches
        - Local resource availability
        """
    
    def _parse_analysis_response(self, response_text: str) -> Dict[str, Any]:
        """Parse Groq AI analysis response."""
        try:
            # Try to extract JSON from response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = response_text[start_idx:end_idx]
                return json.loads(json_str)
            else:
                # Fallback parsing
                return self._extract_analysis_from_text(response_text)
                
        except Exception as e:
            print(f"Error parsing analysis response: {e}")
            return self._get_fallback_analysis("unknown", "unknown")
    
    def _parse_recommendation_response(self, response_text: str) -> Dict[str, Any]:
        """Parse Groq AI recommendation response."""
        try:
            # Try to extract JSON from response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = response_text[start_idx:end_idx]
                return json.loads(json_str)
            else:
                # Fallback parsing
                return self._extract_recommendation_from_text(response_text)
                
        except Exception as e:
            print(f"Error parsing recommendation response: {e}")
            return self._get_fallback_recommendation("unknown", "unknown", 50)
    
    def _parse_query_response(self, response_text: str) -> Dict[str, Any]:
        """Parse Groq AI query response."""
        try:
            # Try to extract JSON from response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = response_text[start_idx:end_idx]
                return json.loads(json_str)
            else:
                return {
                    "query_type": "unknown",
                    "parameters": {},
                    "response": response_text,
                    "action_required": "none"
                }
                
        except Exception as e:
            print(f"Error parsing query response: {e}")
            return {
                "query_type": "unknown",
                "parameters": {},
                "response": "I couldn't process your request. Please try again.",
                "action_required": "none"
            }
    
    def _extract_analysis_from_text(self, text: str) -> Dict[str, Any]:
        """Extract analysis data from text response."""
        # Simple text parsing as fallback
        severity_score = 50  # Default
        if "high" in text.lower():
            severity_score = 80
        elif "medium" in text.lower():
            severity_score = 60
        elif "low" in text.lower():
            severity_score = 30
            
        return {
            "severity_score": severity_score,
            "weather_hint": "Unknown weather conditions",
            "tags": ["agricultural_issue"],
            "risk_factors": ["Unknown risk factors"],
            "urgency_level": "medium",
            "affected_area_estimate": "medium",
            "potential_spread": "medium"
        }
    
    def _extract_recommendation_from_text(self, text: str) -> Dict[str, Any]:
        """Extract recommendation data from text response."""
        return {
            "immediate_actions": ["Contact local extension officer", "Monitor affected area"],
            "preventive_measures": ["Regular field inspection", "Proper crop rotation"],
            "monitoring_steps": ["Check daily for changes", "Document progress"],
            "resource_needs": ["Extension officer consultation", "Agricultural inputs"],
            "timeline": "1-2 weeks",
            "follow_up_required": True
        }
    
    def _get_fallback_analysis(self, category: str, crop: str) -> Dict[str, Any]:
        """Get fallback analysis when AI fails."""
        severity_map = {
            "pest": 70,
            "disease": 75,
            "flood": 85,
            "drought": 80,
            "input_need": 40,
            "other": 50
        }
        
        return {
            "severity_score": severity_map.get(category, 50),
            "weather_hint": "Weather conditions unknown",
            "tags": [category, crop, "agricultural_issue"],
            "risk_factors": ["Unknown environmental factors"],
            "urgency_level": "medium",
            "affected_area_estimate": "medium",
            "potential_spread": "medium"
        }
    
    def _get_fallback_recommendation(self, category: str, crop: str, severity_score: int) -> Dict[str, Any]:
        """Get fallback recommendation when AI fails."""
        return {
            "immediate_actions": [
                "Contact your local agricultural extension officer",
                "Take photos of the affected area",
                "Isolate affected plants if possible"
            ],
            "preventive_measures": [
                "Implement proper crop rotation",
                "Use certified seeds",
                "Maintain good field hygiene"
            ],
            "monitoring_steps": [
                "Check affected area daily",
                "Document changes with photos",
                "Record weather conditions"
            ],
            "resource_needs": [
                "Extension officer consultation",
                "Appropriate agricultural inputs",
                "Monitoring equipment"
            ],
            "timeline": "1-2 weeks for initial assessment",
            "follow_up_required": True
        }

# Global instance
ai_service = GroqAIService()
