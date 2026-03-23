#!/bin/bash

# ============================================================
# Script: Publish Docker Compose Configuration
# Purpose: Push docker-compose services to DockerHub
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

echo -e "${CYAN}============================================================${NC}"
echo -e "${CYAN}Docker Compose Publication to DockerHub${NC}"
echo -e "${CYAN}============================================================${NC}"
echo ""

echo -e "${CYAN}Publishing docker-compose services...${NC}"
echo -e "Username: ${YELLOW}$DOCKER_HUB_USER_INPUT${NC}"
echo ""

# Export the environment variable so docker-compose.yml can use it
# This replaces the $env:DOCKER_HUB_USER from PowerShell
export DOCKER_HUB_USER=$DOCKER_HUB_USER_INPUT

echo -e "${CYAN}Pushing services to DockerHub...${NC}"
echo -e "  ${YELLOW}This publishes all services defined in docker-compose.yml${NC}"
echo ""

docker compose push

# Check the exit status of the last command
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}============================================================${NC}"
    echo -e "${GREEN}Publication Successful${NC}"
    echo -e "${GREEN}============================================================${NC}"
    echo ""
    echo -e "${CYAN}Docker Compose services published:${NC}"
    echo -e "  ${GREEN}User: $DOCKER_HUB_USER_INPUT${NC}"
    echo ""
    echo -e "${CYAN}Next steps:${NC}"
    echo -e "  1. Deploy on VM: ${GREEN}export DOCKER_HUB_USER='$DOCKER_HUB_USER_INPUT'${NC}"
    echo -e "  2. Pull and run: ${GREEN}docker compose up -d${NC}"
    echo -e "  3. Monitor: ${GREEN}docker compose logs -f${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}============================================================${NC}"
    echo -e "${RED}Publication Failed${NC}"
    echo -e "${RED}============================================================${NC}"
    echo ""
    echo -e "${YELLOW}Possible causes:${NC}"
    echo -e "  1. Not logged in: Run ${GREEN}docker login${NC}"
    echo -e "  2. Old Docker Compose: Need v2.34.0 or newer"
    echo -e "  3. Network issue: Check your internet connection"
    echo ""
    exit 1
fi