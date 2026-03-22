#!/bin/bash
if [ -z "$1" ]; then
    echo "Usage: ./publish_image.sh <docker_hub_username>"
    exit 1
fi

# We assume the local image is named 'stilnovo-app' [cite: 624]
docker tag stilnovo-app $1/stilnovo-app:latest
docker push $1/stilnovo-app:latest

if [ $? -eq 0 ]; then
    echo "Image pushed to $1/stilnovo-app:latest"
else
    echo "Push failed."
fi