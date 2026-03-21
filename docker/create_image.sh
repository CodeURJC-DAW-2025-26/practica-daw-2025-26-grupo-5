#!/bin/bash
# ============================================================
# Script: Build Docker Image from Source
# ============================================================
# Builds a Docker image using the Dockerfile in the current directory
# Compiles Maven project, creates optimized multi-stage image
#
# Prerequisites:
#   - Docker installed and running
#   - Dockerfile present in docker/ folder
#   - Backend source code in backend/ folder (relative to docker)
#
# Usage:
#   ./create_image.sh image-name:tag
#
# Example:
#   ./create_image.sh mystilnovo:latest
#   ./create_image.sh myregistry.azurecr.io/stilnovo:v1
#
# Arguments:
#   $ImageName: Desired image name with optional tag (e.g., myuser/app:v1.0)
# ============================================================

param(
    [Parameter(Mandatory = $true)]
    [string]$ImageName
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker no esta instalado o no esta en PATH."
}

$root = Split-Path -Parent $PSScriptRoot
$dockerfilePath = Join-Path $PSScriptRoot "Dockerfile"

Write-Host "Construyendo imagen '$ImageName' desde codigo fuente..."
docker build -f $dockerfilePath -t $ImageName $root

Write-Host "Imagen creada correctamente: $ImageName"
