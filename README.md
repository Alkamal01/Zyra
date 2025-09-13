# 🌱 Zyra - Autonomous Agricultural Extension Agent

![tag:innovationlab](https://img.shields.io/badge/innovationlab-3D8BD3)
![Groq AI](https://img.shields.io/badge/Groq%20AI-LPU%20Powered-purple)
![ICP](https://img.shields.io/badge/Internet%20Computer-ICP%20Blockchain-green)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![Rust](https://img.shields.io/badge/Rust-Canister%20Development-orange)
![FastAPI](https://img.shields.io/badge/FastAPI-API%20Backend-green)

> **High-performance agricultural extension platform powered by Groq AI's LPUs for ultra-fast incident analysis and recommendations, connected to Internet Computer (ICP) for fully on-chain agricultural services in Nigeria.**

## 🚀 Project Overview

Zyra is an innovative high-performance agricultural extension platform designed specifically for Nigeria's agricultural sector. The system leverages **Groq AI's LPUs** for ultra-fast processing and **Internet Computer (ICP) blockchain** to provide end-to-end agricultural support services with real-time AI analysis.

### 🌟 Key Features

- **⚡ Ultra-Fast AI Processing**: Groq LPUs provide 10-100x faster analysis than traditional GPUs
- **🤖 Real-time AI Analysis**: Instant incident analysis with detailed recommendations
- **💬 Natural Language Chat**: Interactive AI assistant for agricultural queries
- **🔗 Blockchain Storage**: Immutable incident records on ICP canister
- **🌍 Geographic Intelligence**: LGA-based querying and resource allocation
- **📱 Modern Web Interface**: Next.js frontend with real-time dashboard
- **🔒 Audit Trail**: Complete immutable history of all operations
- **📊 Enhanced Analytics**: Rich data visualization and insights
- **🎯 Smart Recommendations**: AI-powered action plans and preventive measures

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js UI    │    │  Groq AI        │    │  ICP Canister   │
│   (Frontend)    │◄──►│  (LPUs)         │◄──►│  (Blockchain)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│  FastAPI        │◄─────────────┘
                        │  (Backend)      │
                        └─────────────────┘
```

## ⚡ Groq AI Integration

### Performance Benefits

- **10-100x Faster Processing**: Groq's LPUs deliver ultra-fast AI inference
- **Low Latency**: Sub-second response times for real-time analysis
- **Cost Efficient**: Pay-per-use model with generous free tier
- **Scalable**: Automatically scales with usage demands

### AI Capabilities

- **Incident Analysis**: Real-time severity assessment and risk evaluation
- **Smart Recommendations**: Detailed action plans and preventive measures
- **Natural Language Processing**: Interactive chat for user queries
- **Context Awareness**: Understands Nigerian agricultural context

## 🤖 Legacy Fetch.ai Integration

> **Note**: The system has been migrated from Fetch.ai uAgents to Groq AI for better performance and reliability. The original Fetch.ai integration is preserved for reference.

### Agent Details

- **Agent Name**: `Zyra Agricultural Extension Agent`
- **Agent Address**: `agent1q0dglz2vh4v0nh7latyrkthdd5hrrc87hk9r3nj00ayc7fpmquz255c5vs4`
- **Agent Category**: Innovation Lab
- **Agent Type**: Autonomous Agricultural Extension with Natural Language Processing
- **Agentverse URL**: https://agentverse.ai/inspect/?uri=http%3A//127.0.0.1%3A8001&address=agent1q0dglz2vh4v0nh7latyrkthdd5hrrc87hk9r3nj00ayc7fpmquz255c5vs4

### Agent Capabilities

Our uAgents autonomously handle:

1. **Natural Language Processing** 🌟 **NEW**
   - ASI:One integration for natural language understanding
   - Function calling with intelligent tool selection
   - Multi-turn conversations with context awareness
   - Human-friendly responses and error handling

2. **Farmer Report Processing**
   - Incident validation and enrichment
   - Severity assessment and tagging
   - Automatic recommendation generation
   - Resource request triggering for high-severity cases

3. **Operator Query Handling**
   - LGA-based incident retrieval
   - Geographic analysis and reporting
   - Status tracking and updates
   - Audit trail maintenance

4. **Autonomous Decision Making**
   - Weather-based recommendations
   - Crop-specific action plans
   - Priority-based resource allocation
   - Real-time status updates

5. **Chat Protocol Integration** 🌟 **NEW**
   - Session management and persistence
   - Message acknowledgments
   - Welcome messages and onboarding
   - Agentverse compatibility

### Agent Protocols

```python
# Chat Protocol (Enhanced) 🌟 NEW
@chat_proto.on_message(model=ChatMessage)
async def handle_chat_message(ctx: Context, sender: str, msg: ChatMessage):
    # Natural language processing via ASI:One
    # Function calling with tool selection
    # Multi-turn conversation handling

# Farmer Report Protocol
@agent.on_message(model=FarmerReport, replies=AgentResponse)
async def farmer_report_handler(ctx: Context, msg: FarmerReport):
    # Autonomous processing: validate → enrich → store → recommend → respond

# Operator Query Protocol  
@agent.on_message(model=OperatorQuery, replies=AgentResponse)
async def operator_query_handler(ctx: Context, msg: OperatorQuery):
    # Autonomous querying: retrieve → analyze → format → respond
```

### ASI:One Function Calling

The agent supports natural language queries that map to specific functions:

- **`report_agricultural_incident`**: Report incidents with natural language
- **`query_incidents_by_lga`**: Query incidents by location
- **`get_incident_details`**: Get detailed incident information
- **`add_recommendation_to_incident`**: Add recommendations to incidents
- **`update_incident_status`**: Update incident status

### Example Natural Language Queries

```
"I need to report a pest infestation in my maize farm in Kano Municipal"
"Show me all incidents in Lagos Island"
"What's the status of agricultural problems in Kano?"
"Give me details about incident inc-20241201120000"
"Add a recommendation to incident ABC123"
```

## 🔗 Internet Computer (ICP) Integration

### Canister Details

- **Canister ID**: `uxrrr-q7777-77774-qaaaq-cai`
- **Network**: Local (ready for mainnet deployment)
- **Language**: Rust
- **Interface**: Candid
- **Status**: ✅ Deployed and operational

### On-chain Operations

```rust
// Core canister methods
create_incident(incident: Incident) -> String
get_incident(incident_id: String) -> Option<Incident>
list_incidents_by_lga(lga: String) -> Vec<Incident>
add_recommendation(incident_id: String, recommendation: Recommendation)
set_status(incident_id: String, status: String)
raise_resource_request(incident_id: String, request_type: String, notes: String)
```

### Blockchain Features

- **Immutable Storage**: All incidents stored permanently on ICP
- **Audit Trail**: Complete history of all operations
- **Geographic Queries**: LGA-based incident retrieval
- **Resource Management**: On-chain resource request tracking

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Features**: Real-time dashboard, responsive design

### Backend
- **Framework**: FastAPI
- **Agents**: Fetch.ai uAgent framework with ASI:One integration
- **Database**: ICP canister (blockchain storage)
- **Language**: Python 3.11
- **Natural Language**: ASI:One API for function calling

### Blockchain
- **Platform**: Internet Computer (ICP)
- **Language**: Rust
- **Interface**: Candid
- **Storage**: On-chain immutable records

## 🚀 Quick Start

### Groq AI Setup (Recommended) ⚡ NEW

For the fastest and most efficient experience:

1. **Get Groq API Key**
   ```bash
   # Visit https://console.groq.com and get your API key
   # Create a .env file in the api/ directory
   echo "GROQ_API_KEY=your_groq_api_key_here" > api/.env
   ```

2. **Run the Demo**
   ```bash
   # Make the startup script executable
   chmod +x start_groq_demo.sh
   
   # Run the complete demo
   ./start_groq_demo.sh
   ```

3. **Access the Platform**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

4. **Test AI Features**
   - Try the AI Chat on the dashboard
   - Submit a report with real-time AI analysis
   - Explore the enhanced analytics

### Manual Setup

If you prefer manual setup:

1. **Backend Setup**
   ```bash
   cd api
   pip install -r requirements.txt
   python app.py
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Test Integration**
   ```bash
   python test_groq_integration.py
   ```

### Enhanced Agent Features 🌟

The enhanced agent includes:

- **🗣️ Natural Language Processing**: Understands human-like queries
- **🔧 Function Calling**: Automatically routes requests to appropriate functions
- **💬 Chat Protocol**: Seamless integration with Agentverse
- **🔄 Multi-turn Conversations**: Maintains context across sessions
- **🎯 Intent Recognition**: Understands user intent from natural language
- **📝 Smart Responses**: Generates human-friendly, actionable responses

### Standard Agent Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- dfx (ICP development kit)
- Rust toolchain

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/zyra-agricultural-agent.git
   cd zyra-agricultural-agent
   ```

2. **Setup Python environment**
   ```bash
   cd agent
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Setup ICP canister**
   ```bash
   cd ../icp
   dfx start --background
   dfx deploy
   ```

4. **Setup frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

5. **Start backend**
   ```bash
   cd ../api
   python app.py
   ```

### Testing

```bash
# Test ICP integration
cd agent
python test_icp_integration.py

# Test uAgent functionality
python main.py
```

## 📊 Demo Walkthrough

### 1. Farmer Report Submission
- Farmer submits incident report via web interface
- uAgent automatically processes and enriches the report
- Incident stored immutably on ICP blockchain
- AI generates crop-specific recommendations

### 2. Autonomous Processing
- Weather data integration
- Severity assessment and tagging
- Geographic analysis
- Resource allocation decisions

### 3. Operator Queries
- Query incidents by LGA
- Retrieve from blockchain
- Generate reports and analytics
- Track resource requests

## 🌍 Real-world Impact

### Agricultural Challenges Addressed

1. **Timely Response**: Autonomous agents provide instant support
2. **Geographic Coverage**: LGA-based service delivery
3. **Resource Optimization**: Intelligent resource allocation
4. **Audit Transparency**: Immutable blockchain records
5. **Scalability**: Decentralized infrastructure

### Nigerian Agricultural Context

- **Target Region**: Nigeria (Kano, Lagos, etc.)
- **Crop Focus**: Maize, Rice, Cassava, Yam
- **Issues Addressed**: Pests, diseases, floods, input needs
- **Stakeholders**: Farmers, extension officers, government agencies

## 🔧 Development

### Project Structure

```
zyra-agricultural-agent/
├── agent/                 # Fetch.ai uAgents
│   ├── protocols.py      # Agent protocols and handlers
│   ├── models.py         # Data models
│   ├── utils.py          # Utility functions
│   ├── icp_client.py     # ICP canister client
│   └── main.py           # Agent entry point
├── icp/                  # Internet Computer canister
│   ├── src/              # Rust source code
│   ├── dfx.json          # DFX configuration
│   └── Cargo.toml        # Rust dependencies
├── api/                  # FastAPI backend
│   └── app.py            # API endpoints
├── frontend/             # Next.js frontend
│   ├── app/              # App router
│   ├── components/       # React components
│   └── package.json      # Node dependencies
└── README.md             # This file
```

### Key Components

- **Autonomous Agents**: Handle farmer reports and operator queries
- **Blockchain Storage**: ICP canister for immutable data
- **Web Interface**: Modern dashboard for stakeholders
- **API Layer**: RESTful endpoints for integration

## 🚀 Deployment

### Agentverse Deployment

Our agents are ready for deployment on Fetch.ai's Agentverse:

1. **Agent Registration**: Register on Agentverse platform
2. **Protocol Deployment**: Deploy agent protocols
3. **ICP Integration**: Connect to mainnet ICP canister
4. **Service Activation**: Enable autonomous operation

### Production Deployment

1. **ICP Mainnet**: Deploy canister to mainnet
2. **Agentverse**: Deploy agents to marketplace
3. **Frontend**: Deploy to production hosting
4. **Monitoring**: Setup monitoring and analytics

## 🏆 Hackathon Journey

### Challenges Faced During Development

#### 1. **ICP Canister Deployment Challenges**
- **Issue**: Initial `dfx.json` parsing errors due to version mismatches
- **Solution**: Updated to `dfx` version 0.29.0 and fixed JSON configuration
- **Learning**: Proper version alignment is crucial for ICP development

#### 2. **Rust Compilation Issues**
- **Issue**: `wasm-bindgen` conflicts with `uuid` crate in ICP environment
- **Solution**: Removed `uuid` dependency and used `ic_cdk::api::time` for timestamps
- **Learning**: ICP runtime has specific constraints for WebAssembly modules

#### 3. **Candid Format Serialization**
- **Issue**: Complex data structure serialization for canister calls
- **Solution**: Implemented custom Candid format conversion in Python client
- **Learning**: Proper Candid interface design is essential for smooth integration

#### 4. **Python Dependency Conflicts**
- **Issue**: `grpcio` and `cosmpy` version conflicts with `uagents`
- **Solution**: Removed explicit `grpcio` requirement and let `uagents` manage dependencies
- **Learning**: Careful dependency management is critical for uAgent integration

#### 5. **Frontend-Backend Integration**
- **Issue**: API endpoint integration and real-time data flow
- **Solution**: Implemented comprehensive error handling and fallback mechanisms
- **Learning**: Robust error handling ensures system reliability

### Technical Achievements

- ✅ **Full ICP Integration**: Successfully deployed and tested Rust canister
- ✅ **Autonomous Agents**: Implemented working uAgent protocols
- ✅ **Blockchain Storage**: All incidents stored immutably on ICP
- ✅ **Real-time Processing**: End-to-end autonomous workflow
- ✅ **Modern UI**: Responsive Next.js frontend with real-time updates

## 📈 Future Plans

### Post-Hackathon Development Roadmap

#### Phase 1: Production Deployment (Q1 2024)
- **ICP Mainnet Deployment**: Deploy canister to mainnet with proper cycles management
- **Agentverse Integration**: Deploy agents to Fetch.ai's Agentverse marketplace
- **Production Monitoring**: Implement comprehensive logging and monitoring
- **Security Audit**: Conduct security review of smart contracts and agent protocols

#### Phase 2: Enhanced Features (Q2 2024)
- **Machine Learning Integration**: 
  - Weather prediction models for crop recommendations
  - Pest outbreak prediction using historical data
  - Yield optimization algorithms
- **IoT Sensor Integration**: 
  - Soil moisture sensors
  - Weather stations
  - Crop health monitoring devices
- **Mobile Application**: 
  - React Native app for farmers
  - Offline capability for remote areas
  - Push notifications for urgent alerts

#### Phase 3: Scale and Expand (Q3-Q4 2024)
- **Multi-Region Support**: 
  - Expand beyond Nigeria to other African countries
  - Local language support (Hausa, Yoruba, Igbo)
  - Regional agricultural expertise integration
- **Advanced Analytics**: 
  - Predictive analytics for resource allocation
  - Economic impact assessment
  - Policy recommendation engine
- **Partnership Integration**: 
  - Government agricultural agencies
  - NGO partnerships
  - Financial institutions for credit scoring

#### Phase 4: Ecosystem Development (2025)
- **Decentralized Marketplace**: 
  - Direct farmer-to-buyer connections
  - Fair pricing mechanisms
  - Quality certification on blockchain
- **Token Economics**: 
  - Zyra token for ecosystem participation
  - Incentivized reporting and validation
  - Governance mechanisms
- **Research Platform**: 
  - Agricultural research data sharing
  - Academic collaboration tools
  - Open data initiatives

### Long-term Vision

**Goal**: Transform African agriculture through autonomous AI agents and blockchain technology

**Impact Targets**:
- **1 Million Farmers**: Onboard by 2025
- **50% Yield Improvement**: Average increase in crop yields
- **$500M Economic Impact**: Direct economic benefit to farmers
- **Carbon Reduction**: Sustainable farming practices adoption

## 🔧 ICP Features Used

### Core ICP Technologies

#### 1. **Rust Canisters**
- **Purpose**: Smart contract for agricultural incident management
- **Features**: 
  - Immutable data storage
  - Geographic querying capabilities
  - Audit trail maintenance
  - Resource request tracking

#### 2. **Candid Interface**
- **Purpose**: Type-safe communication between frontend and canister
- **Implementation**: 
  ```candid
  type Incident = record {
    incident_id: text;
    farmer_id: text;
    lga: text;
    geo: Geo;
    crop: text;
    category: text;
    description: text;
    enriched: Enriched;
    status: text;
    recommendations: vec Recommendation;
    resource_request: ResourceRequest;
    audit: vec Audit;
  };
  ```

#### 3. **On-chain Storage**
- **Purpose**: Permanent, immutable storage of agricultural incidents
- **Benefits**:
  - Data integrity and transparency
  - Audit trail for compliance
  - Decentralized access control
  - Tamper-proof records

#### 4. **Geographic Queries**
- **Purpose**: LGA-based incident retrieval and analysis
- **Implementation**: Efficient spatial data querying on blockchain

### ICP Integration Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   uAgent        │    │   ICP Canister  │
│   (Next.js)     │◄──►│   (Python)      │◄──►│   (Rust)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│   FastAPI       │◄─────────────┘
                        │   (Bridge)      │
                        └─────────────────┘
```

## 🤖 Fetch.ai Features Used

### uAgent Framework Components

#### 1. **Autonomous Agent Protocols**
```python
# Enhanced Chat Protocol with ASI:One
@chat_proto.on_message(model=ChatMessage)
async def handle_chat_message(ctx: Context, sender: str, msg: ChatMessage):
    # Natural language processing via ASI:One
    # Function calling with tool selection
    # Multi-turn conversation handling

# Traditional Protocol
@agent.on_message(model=FarmerReport, replies=AgentResponse)
async def farmer_report_handler(ctx: Context, msg: FarmerReport):
    # Autonomous processing pipeline
    # 1. Validate input
    # 2. Enrich with weather and severity data
    # 3. Store on ICP blockchain
    # 4. Generate recommendations
    # 5. Trigger resource requests if needed
    # 6. Send response to farmer
```

#### 2. **Message Schemas**
- **ChatMessage**: Natural language conversation messages
- **ChatAcknowledgement**: Message delivery confirmations
- **FarmerReport**: Structured incident reports from farmers
- **OperatorQuery**: Geographic and status-based queries
- **AgentResponse**: Standardized response format
- **EnrichmentResult**: Weather and severity analysis

#### 3. **Autonomous Decision Making**
- **Natural Language Understanding**: ASI:One-powered intent recognition
- **Function Calling**: Intelligent tool selection and execution
- **Intelligent Enrichment**: Weather data integration and severity assessment
- **Recommendation Engine**: Crop-specific action plan generation
- **Resource Allocation**: Automatic triggering of resource requests
- **Status Management**: Real-time status updates and tracking

#### 4. **Agent Communication**
- **Chat Protocol**: Natural language conversation flow
- **Protocol-based**: Type-safe message passing
- **Asynchronous**: Non-blocking operation handling
- **Context-aware**: Rich context for decision making
- **Error Handling**: Robust error recovery mechanisms
- **Agentverse Integration**: Seamless marketplace connectivity

### ASI:One Integration Features 🌟

#### 1. **Natural Language Processing**
- **Intent Recognition**: Understands user intent from natural language
- **Function Calling**: Automatically maps queries to appropriate functions
- **Parameter Extraction**: Extracts structured data from natural language
- **Context Awareness**: Maintains conversation context across turns

#### 2. **Function Calling Capabilities**
- **Tool Selection**: Intelligent selection of appropriate functions
- **Parameter Validation**: Ensures correct parameter types and values
- **Error Handling**: Graceful handling of malformed requests
- **Response Generation**: Human-friendly response formatting

#### 3. **Conversation Management**
- **Multi-turn Dialogues**: Maintains context across conversation sessions
- **Session Persistence**: Remembers conversation history
- **Welcome Messages**: Friendly onboarding experience
- **Error Recovery**: Handles misunderstandings gracefully

### uAgent Capabilities Demonstrated

#### 1. **Autonomous Processing**
- **Input Validation**: Automatic validation of farmer reports
- **Data Enrichment**: Weather integration and severity scoring
- **Recommendation Generation**: AI-powered crop-specific advice
- **Resource Management**: Intelligent resource allocation

#### 2. **Geographic Intelligence**
- **LGA-based Queries**: Efficient geographic data retrieval
- **Spatial Analysis**: Location-based incident analysis
- **Regional Insights**: Area-specific agricultural patterns

#### 3. **Real-time Operations**
- **Instant Processing**: Sub-second response times
- **Live Updates**: Real-time status changes
- **Concurrent Handling**: Multiple simultaneous requests

### Integration with ICP

#### 1. **Blockchain Storage**
- **On-chain Persistence**: All incidents stored on ICP
- **Immutable Records**: Tamper-proof audit trail
- **Decentralized Access**: Permissionless data access

#### 2. **Smart Contract Interaction**
- **Canister Calls**: Direct interaction with ICP canisters
- **Candid Serialization**: Type-safe data exchange
- **Error Handling**: Robust blockchain operation handling

#### 3. **Decentralized Workflow**
- **Autonomous Agents**: Independent decision making
- **Blockchain Verification**: Immutable record keeping
- **Transparent Operations**: Public audit trail

## 🤝 Contributing

We welcome contributions to improve Zyra:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Fetch.ai**: For the uAgent framework
- **Internet Computer**: For blockchain infrastructure
- **Nigerian Agricultural Community**: For domain expertise
- **Open Source Community**: For tools and libraries

## 📞 Contact

- **Project Lead**: [Kamal Aliyu]
- **Email**: [amalaliyu212@gmail.com]
- **GitHub**: [Alkamal01]
- **Twitter**: [@kaftandev]

---

**Built with ❤️ for Nigeria's agricultural future**

![Fetch.ai](https://img.shields.io/badge/Fetch.ai-uAgent-blue)
![ICP](https://img.shields.io/badge/Internet_Computer-ICP-orange)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![Rust](https://img.shields.io/badge/Rust-Canister-orange)



