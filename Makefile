.PHONY: setup clean icp-start icp-stop icp-deploy agent-run web-run cli-run demo-seed demo-query-lga demo-list-incidents test help

# Default target
help:
	@echo "Zyra - Autonomous Agricultural Extension Agent"
	@echo ""
	@echo "Available commands:"
	@echo "  setup              - Initial project setup"
	@echo "  clean              - Clean build artifacts"
	@echo "  icp-start          - Start ICP local replica"
	@echo "  icp-stop           - Stop ICP local replica"
	@echo "  icp-deploy         - Deploy canister to local replica"
	@echo "  agent-run          - Run the uAgent"
	@echo "  web-run            - Start FastAPI web server"
	@echo "  cli-run            - Run CLI interface"
	@echo "  demo-seed          - Process sample incidents"
	@echo "  demo-query-lga     - Query incidents by LGA"
	@echo "  demo-list-incidents - List all incidents"
	@echo "  test               - Run acceptance tests"

# Project setup
setup:
	@echo "Setting up Zyra project..."
	@mkdir -p agent api web data scripts demo icp/src
	@echo "Creating virtual environment..."
	python3 -m venv venv
	@echo "Installing Python dependencies..."
	. venv/bin/activate && pip install -r agent/requirements.txt
	@echo "Setup complete! Run 'source venv/bin/activate' to activate virtual environment"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf .dfx
	rm -rf target
	rm -rf __pycache__
	rm -rf agent/__pycache__
	rm -rf api/__pycache__
	find . -name "*.pyc" -delete
	@echo "Clean complete"

# ICP Local Replica Management
icp-start:
	@echo "Starting ICP local replica..."
	dfx start --background --clean
	@echo "ICP replica started"

icp-stop:
	@echo "Stopping ICP local replica..."
	dfx stop
	@echo "ICP replica stopped"

# Deploy canister
icp-deploy:
	@echo "Deploying canister to local replica..."
	cd icp && dfx deploy
	@echo "Canister deployed successfully"
	@echo "Canister ID: $$(cd icp && dfx canister id agriassist)"

# Run uAgent
agent-run:
	@echo "Starting Zyra uAgent..."
	cd agent && python main.py

# Run FastAPI web server
web-run:
	@echo "Starting FastAPI web server..."
	cd api && python app.py

# Run CLI interface
cli-run:
	@echo "Starting CLI interface..."
	cd scripts && python cli.py

# Demo commands
demo-seed:
	@echo "Processing sample incidents..."
	cd scripts && python load_seed.py

demo-query-lga:
	@echo "Querying incidents for Kano Municipal..."
	cd scripts && python query_lga.py "Kano Municipal"

demo-list-incidents:
	@echo "Listing all incidents..."
	cd scripts && python list_incidents.py

# Run acceptance tests
test:
	@echo "Running acceptance tests..."
	cd scripts && python test_acceptance.py
	@echo "All tests passed!"

# Development helpers
logs:
	@echo "Showing agent logs..."
	tail -f logs/agent.log

status:
	@echo "Checking system status..."
	@echo "ICP Replica: $$(dfx ping 2>/dev/null && echo "Running" || echo "Stopped")"
	@echo "Canister: $$(cd icp && dfx canister status agriassist 2>/dev/null || echo "Not deployed")"
	@echo "Agent: $$(ps aux | grep "python main.py" | grep -v grep >/dev/null && echo "Running" || echo "Stopped")"
