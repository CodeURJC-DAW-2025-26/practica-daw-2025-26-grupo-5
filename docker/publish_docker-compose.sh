#!/bin/bash
if [ -z "$1" ]; then
    echo "Usage: ./publish_docker-compose.sh <docker_hub_username>"
    exit 1
fi

# Pushing the docker-compose.yml as an OCI artifact 
# Note: Ensure you have the 'docker compose' version that supports push/publish
docker compose push $1/stilnovo-app-compose:latest

if [ $? -eq 0 ]; then
    echo "Compose file published as OCI artifact."
else
    echo "Failed to publish compose file."
fi