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
Write-Host "" -ForegroundColor Yellow

# Push the docker-compose services
# Requires DOCKER_HUB_USER environment variable to be set
$env:DOCKER_HUB_USER = $DockerHubUsername

Write-Host "Publishing services from docker-compose.yml..." -ForegroundColor Cyan
docker compose push

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Docker Compose services successfully published" -ForegroundColor Green
    Write-Host "Services available in: $DockerHubUsername" -ForegroundColor Green
    Write-Host "" -ForegroundColor Green
    Write-Host "To deploy on a remote server, use:" -ForegroundColor Cyan
    Write-Host "  `$env:DOCKER_HUB_USER = '$DockerHubUsername'" -ForegroundColor Green
    Write-Host "  docker compose up -d" -ForegroundColor Green
} else {
    Write-Error "Failed to publish compose file."
    Write-Error "Ensure you are logged in to DockerHub: docker login"
    exit 1
}
