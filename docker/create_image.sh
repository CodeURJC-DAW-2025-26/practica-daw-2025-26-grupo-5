#!/bin/bash

# Build Docker image
docker build -t lcdd_daw -f Dockerfile ..

# Error check
if [ $? -eq 0 ]
then
    echo "Docker image built successfully."
else
    echo "There was an error building the Docker image."
    exit 1
fi