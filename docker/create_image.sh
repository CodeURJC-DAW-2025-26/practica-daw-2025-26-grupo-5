#!/bin/bash
# Check if image name is provided 
if [ -z "$1" ]; then
    echo "Usage: ./create_image.sh <image_name>"
    exit 1
fi

# Build image using the provided name 
docker build -t $1 -f Dockerfile ..

if [ $? -eq 0 ]; then
    echo "Image '$1' built successfully."
else
    echo "Error building image."
    exit 1
fi