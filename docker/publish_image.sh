#!/bin/bash

# ============================================================
# Script: Publish Docker Image to DockerHub
# Purpose: Tag and push local image to remote repository
# Usage: ./publish_image.sh <DockerHubUsername>
# ============================================================

# Terminal Colors
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

DOCKER_USER=$1

# Validate input parameter
if [ -z "$DOCKER_USER" ]; then
    echo -e "${RED}Error: DockerHub username cannot be empty${NC}"
    echo "Usage: ./publish_image.sh your-dockerhub-username"
    exit 1
fi

echo -e "${CYAN}============================================================${NC}"
echo -e "${CYAN}Docker Image Publication to DockerHub${NC}"
echo -e "${CYAN}============================================================${NC}"
echo ""

echo -e "${CYAN}Publishing Docker image to DockerHub...${NC}"
echo -e "Username: ${YELLOW}$DOCKER_USER${NC}"
echo ""

# STEP 1: Tag the image
# We assume the local image built with create_image.sh is named 'stilnovo-app'
echo -e "${CYAN}Step 1: Tagging image: stilnovo-app -> $DOCKER_USER/stilnovo-app:latest${NC}"
docker tag stilnovo-app "$DOCKER_USER/stilnovo-app:latest"

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to tag image. Make sure 'stilnovo-app' image exists locally.${NC}"
    echo "Did you run ./create_image.sh first?"
    exit 1
fi

# STEP 2: Push image to DockerHub
echo ""
echo -e "${CYAN}Step 2: Pushing image to DockerHub...${NC}"
echo -e "  ${YELLOW}This may take a few minutes depending on image size and connection${NC}"
echo ""

docker push "$DOCKER_USER/stilnovo-app:latest"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}============================================================${NC}"
    echo -e "${GREEN}Publication Successful${NC}"
    echo -e "${GREEN}============================================================${NC}"
    echo ""
    echo -e "${CYAN}Image available at:${NC}"
    echo -e "  ${GREEN}https://hub.docker.com/r/$DOCKER_USER/stilnovo-app${NC}"
    echo ""
    echo -e "${CYAN}Next steps:${NC}"
    echo -e "  1. Publish docker-compose: ${GREEN}./publish_docker-compose.sh $DOCKER_USER${NC}"
    echo -e "  2. Deploy to VM:${NC}"
    echo -e "     ${YELLOW}export DOCKER_HUB_USER=$DOCKER_USER${NC}"
    echo -e "     ${YELLOW}docker compose -e DDL_AUTO=update up -d${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}============================================================${NC}"
    echo -e "${RED}Push Failed${NC}"
    echo -e "${RED}============================================================${NC}"
    echo ""
    echo -e "${YELLOW}Possible causes:${NC}"
    echo -e "  1. Not logged in: Run ${GREEN}docker login${NC}"
    echo -e "  2. Image doesn't exist: Run ${GREEN}./create_image.sh stilnovo-app:latest${NC}"
    echo -e "  3. Network issue: Check your internet connection"
    echo ""
    exit 1
fi