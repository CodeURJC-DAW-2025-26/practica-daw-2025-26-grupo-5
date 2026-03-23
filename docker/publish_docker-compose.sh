#!/bin/bash

# ============================================================
# Script: Publish Docker Compose Services
# Purpose: Push services defined in docker-compose.yml to DockerHub
# Usage: ./publish_docker_compose.sh <DockerHubUsername>
# ============================================================

# Terminal Colors
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

DOCKER_HUB_USER_INPUT=$1

# Validate input
if [ -z "$DOCKER_HUB_USER_INPUT" ]; then
    echo -e "${RED}Error: DockerHub username cannot be empty${NC}"
    echo "Usage: ./publish_docker_compose.sh your-dockerhub-username"
    exit 1
fi

echo -e "${CYAN}Publishing docker-compose.yml services...${NC}"
echo -e "Username: ${YELLOW}$DOCKER_HUB_USER_INPUT${NC}"
echo ""

# Export the environment variable so docker-compose.yml can use it
# This replaces the $env:DOCKER_HUB_USER from PowerShell
export DOCKER_HUB_USER=$DOCKER_HUB_USER_INPUT

echo -e "${CYAN}Pushing services to DockerHub...${NC}"
docker compose push

# Check the exit status of the last command
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Docker Compose services successfully published${NC}"
    echo -e "${GREEN}Services available under user: $DOCKER_HUB_USER_INPUT${NC}"
    echo ""
    echo -e "${CYAN}To deploy on a remote server, use:${NC}"
    echo -e "  ${YELLOW}export DOCKER_HUB_USER='$DOCKER_HUB_USER_INPUT'${NC}"
    echo -e "  ${GREEN}docker compose up -d${NC}"
else
    echo -e "${RED}Error: Failed to publish compose services.${NC}"
    echo -e "Ensure you are logged in to DockerHub: ${YELLOW}docker login${NC}"
    exit 1
fi