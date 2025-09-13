#!/usr/bin/env python3
"""
Test script for Groq AI integration.
Run this to verify the Groq AI service is working correctly.
"""

import os
import sys
import asyncio
from dotenv import load_dotenv

# Add api directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'api'))

from ai_service import ai_service

async def test_groq_integration():
    """Test the Groq AI integration."""
    print("🧪 Testing Groq AI Integration")
    print("=" * 50)
    
    # Load environment variables
    load_dotenv()
    
    # Check if API key is set
    if not os.getenv("GROQ_API_KEY"):
        print("❌ GROQ_API_KEY not found in environment variables")
        print("Please set your Groq API key in the .env file")
        return False
    
    print("✅ Groq API key found")
    
    try:
        # Test 1: Analyze incident
        print("\n🔍 Test 1: Analyzing agricultural incident...")
        analysis = await ai_service.analyze_incident(
            category="pest",
            crop="maize",
            description="Yellow spots on leaves, wilting, and stunted growth",
            lat=12.002,
            lon=8.523
        )
        
        print(f"✅ Analysis completed")
        print(f"   Severity Score: {analysis.get('severity_score', 'N/A')}")
        print(f"   Weather Hint: {analysis.get('weather_hint', 'N/A')}")
        print(f"   Urgency Level: {analysis.get('urgency_level', 'N/A')}")
        print(f"   Tags: {', '.join(analysis.get('tags', []))}")
        
        # Test 2: Generate recommendations
        print("\n💡 Test 2: Generating recommendations...")
        recommendations = await ai_service.generate_recommendation(
            category="pest",
            crop="maize",
            severity_score=analysis.get('severity_score', 50),
            analysis=analysis
        )
        
        print(f"✅ Recommendations generated")
        print(f"   Immediate Actions: {len(recommendations.get('immediate_actions', []))} items")
        print(f"   Preventive Measures: {len(recommendations.get('preventive_measures', []))} items")
        print(f"   Timeline: {recommendations.get('timeline', 'N/A')}")
        
        # Test 3: Process natural language query
        print("\n💬 Test 3: Processing natural language query...")
        query_response = await ai_service.process_natural_language_query(
            "I need to report a pest infestation in my maize farm"
        )
        
        print(f"✅ Query processed")
        print(f"   Query Type: {query_response.get('query_type', 'N/A')}")
        print(f"   Action Required: {query_response.get('action_required', 'N/A')}")
        print(f"   Response: {query_response.get('response', 'N/A')[:100]}...")
        
        print("\n🎉 All tests passed! Groq AI integration is working correctly.")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        print("Please check your Groq API key and internet connection.")
        return False

async def main():
    """Main test function."""
    success = await test_groq_integration()
    
    if success:
        print("\n✅ Groq AI integration is ready to use!")
        print("\nNext steps:")
        print("1. Start the backend: cd api && python app.py")
        print("2. Start the frontend: cd frontend && npm run dev")
        print("3. Visit http://localhost:3000 to see the new AI features")
    else:
        print("\n❌ Please fix the issues above before proceeding.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())

