# Zyra Demo Script

## Overview
This demo showcases Zyra, an autonomous agricultural extension agent that processes farmer reports, enriches them with location and weather data, calculates severity scores, and stores everything on-chain with the Internet Computer.

## Demo Duration: 3-5 minutes

## Prerequisites
- Python 3.11+ installed
- Rust and Cargo installed
- dfx (Internet Computer SDK) installed
- All dependencies installed via `make setup`

## Demo Steps

### Step 1: Start the System (30 seconds)
```bash
# Terminal 1: Start ICP local replica
make icp-start

# Terminal 2: Deploy the canister
make icp-deploy

# Terminal 3: Start the FastAPI server
make web-run

# Terminal 4: Start the uAgent (optional for full demo)
make agent-run
```

**Demo Script:**
"Let me start by launching the Zyra system. I'm starting the Internet Computer local replica, deploying our agricultural extension canister, and launching the web interface."

### Step 2: Show the Web Interface (1 minute)
Open browser to `http://localhost:8000`

**Demo Script:**
"Here's the Zyra web interface. It provides a clean, modern UI for farmers and extension officers to interact with the system. The dashboard shows real-time statistics, and we have dedicated tabs for submitting reports and querying incidents by Local Government Area."

**Actions:**
- Show the dashboard with statistics
- Navigate to the "Submit Report" tab
- Explain the form fields (farmer ID, LGA, crop, category, etc.)

### Step 3: Process Sample Incidents (1-2 minutes)
```bash
# Terminal 5: Run the demo script
make demo-seed
```

**Demo Script:**
"Now let's process some sample farmer reports. These represent real scenarios from Nigerian farmers - pest outbreaks, crop diseases, flooding, and input needs. Watch as Zyra automatically enriches each report with weather data, calculates severity scores, and generates crop-specific recommendations."

**Expected Output:**
```
🌱 Processing sample incident data...
📊 Found 4 seed incidents

📝 Processing incident 1/4: F001 - pest
✅ Processed - ID: inc-20241201123456, Severity: 75/100

📝 Processing incident 2/4: F002 - disease
✅ Processed - ID: inc-20241201123457, Severity: 60/100

📝 Processing incident 3/4: F003 - flood
✅ Processed - ID: inc-20241201123458, Severity: 90/100

📝 Processing incident 4/4: F004 - input_need
✅ Processed - ID: inc-20241201123459, Severity: 40/100

✅ Demo sequence completed!
```

**Demo Script:**
"Notice how the flood incident in Makurdi received a high severity score of 90, automatically triggering a resource request for irrigation equipment. The maize pest incident also scored high at 75, requiring immediate attention."

### Step 4: Query by LGA (1 minute)
```bash
# Terminal 6: Query incidents for Kano Municipal
make demo-query-lga
```

**Demo Script:**
"Now let's see how extension officers can query incidents by Local Government Area. This is crucial for coordinating responses and resource allocation."

**Expected Output:**
```
🔍 Demo: Operator query for Kano Municipal
✅ Operator query processed

📊 Found 1 incidents for Kano Municipal:
  • inc-20241201123456 | maize | pest | Severity: 75
```

**Demo Script:**
"Perfect! We can see that Kano Municipal has one high-severity pest incident affecting maize. The system automatically categorized it and calculated the severity based on the crop type, weather conditions, and description."

### Step 5: Show On-Chain Data (30 seconds)
```bash
# Terminal 7: List all incidents
make demo-list-incidents
```

**Demo Script:**
"Let's examine the stored incident data. Each incident is stored immutably on the Internet Computer with a complete audit trail, including enrichment data, recommendations, and resource requests."

**Expected Output:**
```
📋 All Incidents (4):
  • inc-20241201123456 | F001 | Kano Municipal | maize | pest | Severity: 75
  • inc-20241201123457 | F002 | Iseyin | cassava | disease | Severity: 60
  • inc-20241201123458 | F003 | Makurdi | rice | flood | Severity: 90
  • inc-20241201123459 | F004 | Gusau | tomato | input_need | Severity: 40
```

### Step 6: Live Web Demo (1 minute)
**Demo Script:**
"Let me show you the live web interface in action. I'll submit a new farmer report and show you the real-time processing."

**Actions:**
1. Go to "Submit Report" tab
2. Fill out a sample report:
   - Farmer ID: F005
   - LGA: Abuja Municipal
   - State: FCT
   - Crop: rice
   - Category: disease
   - Description: "Brown spots on leaves, spreading quickly"
   - Coordinates: 9.0820, 7.3986
3. Submit the report
4. Show the response with severity score and recommendation
5. Navigate to "All Incidents" to show the new incident

### Step 7: Highlight Key Features (30 seconds)
**Demo Script:**
"Let me highlight the key autonomous features of Zyra:

1. **Automatic Enrichment**: Each report is enriched with weather data and severity scoring
2. **Smart Recommendations**: Crop-specific, localized action plans are generated automatically
3. **Resource Coordination**: High-severity incidents automatically trigger resource requests
4. **On-Chain Persistence**: All data is stored immutably on the Internet Computer
5. **LGA-Based Queries**: Extension officers can efficiently coordinate responses by location

This demonstrates true end-to-end autonomy from farmer intake to on-chain persistence and recommendation generation."

## Demo Wrap-up
**Demo Script:**
"Zyra represents the future of agricultural extension - an autonomous agent that can process thousands of farmer reports, provide immediate guidance, and coordinate resources efficiently. The system is designed to scale across Nigeria's diverse agricultural landscape while maintaining data integrity through blockchain technology.

Thank you for your attention. Are there any questions about the system's capabilities or implementation?"

## Troubleshooting
- If the ICP replica fails to start, ensure dfx is properly installed
- If the web interface doesn't load, check that the FastAPI server is running on port 8000
- If sample data doesn't process, verify the data files exist in the `data/` directory

## Demo Files
- `data/seed_incidents.json` - Sample farmer reports
- `data/farmers.csv` - Farmer database
- `data/incidents.json` - Generated incident data (created during demo)
