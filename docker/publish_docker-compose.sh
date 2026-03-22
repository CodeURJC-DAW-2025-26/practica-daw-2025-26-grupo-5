#!/bin/bash

# Check if Docker Hub username is provided
if [ -z "$1" ]
then
    echo "Error. Execution mode: ./publish_docker-compose.sh <docker_hub_username>"
    exit 1
fi

# Publish docker_compose
docker compose publish $1/lcdd_daw-compose:latest

# Error check
if [ $? -eq 0 ]
then
    echo "docker_compose published successfully."
else
    echo "There was an error publishing the docker_compose."
fi