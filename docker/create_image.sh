#!/bin/bash

# ============================================================
# Script: Create Docker Image from Source Code
# Purpose: Build multi-stage Docker image for AMD64 (Intel)
# Usage: ./create_image.sh stilnovo-app:latest
# ============================================================

# Terminal Colors
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

IMAGE_NAME=$1

# Validate input parameter
if [ -z "$IMAGE_NAME" ]; then
    echo -e "${RED}Error: Image name cannot be empty${NC}"
    echo "Usage: ./create_image.sh stilnovo-app:latest"
    exit 1
fi

echo -e "${CYAN}============================================================${NC}"
echo -e "${CYAN}Docker Image Build Process (macOS Edition)${NC}"
echo -e "${CYAN}============================================================${NC}"
echo ""

echo -e "${CYAN}Building Docker image...${NC}"
echo -e "Image name: ${YELLOW}$IMAGE_NAME${NC}"
echo ""

echo -e "${CYAN}Building from Dockerfile in current directory...${NC}"
echo "Context: Parent directory (includes backend source)"
echo ""

# Build image using provided name
# CRITICAL: We use --platform linux/amd64 to ensure the image 
# is compatible with the university's Intel/AMD servers.
docker build --platform linux/amd64 -t "$IMAGE_NAME" -f Dockerfile ..

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}============================================================${NC}"
    echo -e "${GREEN}Image '$IMAGE_NAME' built successfully${NC}"
    echo -e "${GREEN}============================================================${NC}"
    echo ""
    echo -e "${CYAN}Image Details:${NC}"
    echo -e "  Name: ${GREEN}$IMAGE_NAME${NC}"
    echo ""
    echo -e "${CYAN}Next steps:${NC}"
    echo -e "  1. Verify image: ${GREEN}docker images | grep stilnovo${NC}"
    echo -e "  2. Test locally: ${GREEN}docker run -p 8443:8443 $IMAGE_NAME${NC}"
    echo -e "  3. Publish to DockerHub: ${GREEN}./publish_image.sh your-username${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}============================================================${NC}"
    echo -e "${RED}Build Failed${NC}"
    echo -e "${RED}============================================================${NC}"
    echo ""
    echo -e "${YELLOW}Check the following:${NC}"
    echo -e "  1. Dockerfile syntax and paths"
    echo -e "  2. Backend source code compilation"
    echo -e "  3. Maven/Java dependencies"
    echo -e "  4. Docker daemon is running"
    echo ""
    exit 1
fi