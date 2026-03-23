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
    Write-Host "Image Build Successful" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Image Details:" -ForegroundColor Cyan
    Write-Host "  Name: $ImageName" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Verify image: docker images | grep stilnovo" -ForegroundColor Green
    Write-Host "  2. Test locally: docker run -p 8443:8443 $ImageName" -ForegroundColor Green
    Write-Host "  3. Publish to DockerHub: .\publish_image.ps1 -DockerHubUsername your-username" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host "Build Failed" -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host ""
    Write-Error "Check the following:"
    Write-Error "  1. Dockerfile syntax and paths"
    Write-Error "  2. Backend source code compilation"
    Write-Error "  3. Maven/Java dependencies"
    Write-Error "  4. Docker daemon is running"
    Write-Host ""
    exit 1
}
