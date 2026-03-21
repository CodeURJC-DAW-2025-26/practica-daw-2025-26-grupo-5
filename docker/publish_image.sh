#!/bin/bash
# ============================================================
# Script: Publish Built Image to DockerHub
# ============================================================
# Tags a local Docker image and pushes it to DockerHub
# for public sharing or deployment
#
# Prerequisites:
#   - Docker installed and running
#   - Logged into DockerHub (docker login)
#   - Local image already built (run create_image.sh first)
#
# Usage:
#   ./publish_image.sh local-image:tag user/remote-image:tag
#
# Example:
#   ./publish_image.sh mylocalimage:latest myuser/stilnovo:latest
#
# Arguments:
#   $1: Local image name with tag
#   $2: DockerHub image name (format: username/imagename:tag)
# ============================================================

param(
    [Parameter(Mandatory = $true)]
    [string]$LocalImage,

    [Parameter(Mandatory = $true)]
    [string]$DockerHubImage
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker no esta instalado o no esta en PATH."
}

Write-Host "Etiquetando '$LocalImage' como '$DockerHubImage'..."
docker tag $LocalImage $DockerHubImage

Write-Host "Publicando '$DockerHubImage' en Docker Hub..."
docker push $DockerHubImage

Write-Host "Imagen publicada correctamente: $DockerHubImage"
