param(
    [Parameter(Mandatory=$true)]
    [string]$DockerHubUsername
)

# Validate input
if ([string]::IsNullOrWhiteSpace($DockerHubUsername)) {
    Write-Error "Error: DockerHub username cannot be empty"
    Write-Error "Usage: .\publish_docker-compose.ps1 -DockerHubUsername your-dockerhub-username"
    exit 1
}

Write-Host "Publishing docker-compose.yml as OCI artifact..." -ForegroundColor Cyan
Write-Host "Username: $DockerHubUsername" -ForegroundColor Yellow
Write-Host "Note: Ensure you have Docker Compose v2.0+ installed with OCI artifact support" -ForegroundColor Yellow

# Push the docker-compose file as an OCI artifact
# This requires Docker Compose v2 with push/publish support
Write-Host "Publishing: $DockerHubUsername/stilnovo-app-compose:latest" -ForegroundColor Cyan
docker compose push "$DockerHubUsername/stilnovo-app-compose:latest"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Docker Compose file successfully published as OCI artifact" -ForegroundColor Green
    Write-Host "Repository: $DockerHubUsername/stilnovo-app-compose:latest" -ForegroundColor Green
    Write-Host "" -ForegroundColor Green
    Write-Host "To deploy on a remote server, use:" -ForegroundColor Cyan
    Write-Host "  Set-Item -Path Env:DOCKER_HUB_USER -Value '$DockerHubUsername'" -ForegroundColor Green
    Write-Host "  docker-compose up -d" -ForegroundColor Green
} else {
    Write-Error "Failed to publish compose file."
    Write-Error "Ensure you are logged in to DockerHub: docker login"
    exit 1
}
