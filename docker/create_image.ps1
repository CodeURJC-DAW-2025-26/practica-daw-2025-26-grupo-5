param(
    [Parameter(Mandatory=$true)]
    [string]$ImageName
)

# ============================================================
# Script: Create Docker Image from Source Code
# Purpose: Build multi-stage Docker image locally
# Usage: .\create_image.ps1 -ImageName stilnovo-app:latest
# ============================================================

# Validate input parameter
if ([string]::IsNullOrWhiteSpace($ImageName)) {
    Write-Error "Error: Image name cannot be empty"
    Write-Error "Usage: .\create_image.ps1 -ImageName stilnovo-app:latest"
    exit 1
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Docker Image Build Process" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Building Docker image..." -ForegroundColor Cyan
Write-Host "Image name: $ImageName" -ForegroundColor Yellow

# Build image using provided name
# The Dockerfile is in the current directory
# The context path (..) includes the entire project (backend, docker, etc)
Write-Host ""
Write-Host "Building from Dockerfile in current directory..." -ForegroundColor Cyan
Write-Host "Context: Parent directory (includes backend source)" -ForegroundColor Gray
Write-Host ""

docker build -t "$ImageName" -f Dockerfile ..

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "Image '$ImageName' built successfully" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Verify image: docker images" -ForegroundColor Green
    Write-Host "2. Test locally: docker run $ImageName" -ForegroundColor Green
    Write-Host "3. Publish: .\publish_image.ps1 -DockerHubUsername username" -ForegroundColor Green
} else {
    Write-Error "============================================================"
    Write-Error "Error building image. Check Dockerfile and source code."
    Write-Error "============================================================"
    exit 1
}
