#!/bin/bash

# ============================================================
# Script: Publish Docker Compose Configuration
# Purpose: Push docker-compose.yml as OCI artifact to DockerHub
# Usage: ./publish_docker-compose.sh <DockerHubUsername>
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
    echo "Usage: ./publish_docker-compose.sh your-dockerhub-username"
    exit 1
fi

echo -e "${CYAN}============================================================${NC}"
echo -e "${CYAN}Docker Compose Publication to DockerHub (OCI Artifact)${NC}"
echo -e "${CYAN}============================================================${NC}"
echo ""

# Define the artifact tag (following your teammate's structure)
IMAGE_TAG="$DOCKER_HUB_USER_INPUT/stilnovo-compose:latest"

echo -e "${CYAN}Publishing to: ${YELLOW}$IMAGE_TAG${NC}"
echo -e "  This publishes the config as an OCI artifact to DockerHub"
echo ""

# Export variables for interpolation if needed
export DOCKER_HUB_USERNAME=$DOCKER_HUB_USER_INPUT
export DOCKER_HUB_USER=$DOCKER_HUB_USER_INPUT

# THE FIX: Use 'publish' instead of 'push'
docker compose publish "$IMAGE_TAG"

# Check the exit status
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}============================================================${NC}"
    echo -e "${GREEN}Publication Successful${NC}"
    echo -e "${GREEN}============================================================${NC}"
    echo ""
    echo -e "${CYAN}Docker Compose artifact published to:${NC}"
    echo -e "  ${GREEN}$IMAGE_TAG${NC}"
    echo ""
    echo -e "${CYAN}Next steps:${NC}"
    echo -e "  1. On VM, run: ${GREEN}docker compose pull $IMAGE_TAG${NC}"
    echo -e "  2. Then run: ${GREEN}docker compose up -d${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}============================================================${NC}"
    echo -e "${RED}Publication Failed${NC}"
    echo -e "${RED}============================================================${NC}"
    echo ""
    echo -e "${YELLOW}Possible causes:${NC}"
    echo -e "  1. Not logged in: Run ${GREEN}docker login${NC}"
    echo -e "  2. Old Docker version: You need Docker Compose v2.34.0+ for 'publish'${NC}"
    exit 1
fi