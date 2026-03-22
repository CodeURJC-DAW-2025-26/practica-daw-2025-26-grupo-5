#!/bin/bash

# Check if Docker Hub username is provided
if [ -z "$1" ]
then
    echo "Error. Execution mode: ./publish_image.sh <docker_hub_username>"
    exit 1
fi

# Check if the Docker image exists locally
if [[ "$(docker images -q lcdd_daw 2> /dev/null)" == "" ]]
then
    echo "Error: Docker image 'lcdd_daw' not found locally."
    echo "Please run ./create_image.sh first."
    exit 1
fi

# Tag the Docker image
docker tag lcdd_daw $1/lcdd_daw:latest

# Publish Docker image
docker push $1/lcdd_daw:latest

# Error check
if [ $? -eq 0 ]
then
    echo "Docker image published successfully."
else
    echo "There was an error publishing the Docker image."
fi