param(
    [Parameter(Mandatory=$true)]
    [string]$DockerHubUsername
)

# ============================================================
# Script: Publish Docker Compose Configuration
# Purpose: Push docker-compose.yml as OCI artifact to DockerHub
# Usage: .\publish_docker-compose.ps1 -DockerHubUsername your-username
# ============================================================

# Validate input parameter
if ([string]::IsNullOrWhiteSpace($DockerHubUsername)) {
    Write-Error "Error: DockerHub username cannot be empty"
    Write-Error "Usage: .\publish_docker-compose.ps1 -DockerHubUsername your-dockerhub-username"
    exit 1
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Docker Compose Publication to DockerHub" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Publishing docker-compose.yml as OCI artifact..." -ForegroundColor Cyan
Write-Host "Username: $DockerHubUsername" -ForegroundColor Yellow
Write-Host ""

# Construct the image tag for the compose file
$ImageTag = "$DockerHubUsername/stilnovo-compose:latest"

Write-Host "Publishing to: $ImageTag" -ForegroundColor Cyan
Write-Host "  This publishes the config as an OCI artifact to DockerHub" -ForegroundColor Gray
Write-Host ""

# Use the docker compose publish command
# NOTE: Requires you to be logged in with 'docker login'
docker compose publish $ImageTag

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "Publication Successful" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Docker Compose artifact published to:" -ForegroundColor Cyan
    Write-Host "  $ImageTag" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Deploy on VM: docker-compose pull && docker-compose up -d" -ForegroundColor Green
    Write-Host "  2. Monitor: docker-compose logs -f" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Error "============================================================"
    Write-Error "Publication Failed"
    Write-Error "============================================================"
    Write-Error ""
    Write-Error "Possible causes:"
    Write-Error "  1. Not logged in to DockerHub: Run 'docker login' first"
    Write-Error "  2. Docker Compose version too old: Need v2.34.0 or newer"
    Write-Error "  3. Network connectivity issue: Check your internet connection"
    Write-Error ""
    exit 1
}