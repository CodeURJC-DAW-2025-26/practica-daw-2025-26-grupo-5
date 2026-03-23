param(
    [Parameter(Mandatory=$true)]
    [string]$DockerHubUsername
)

if ([string]::IsNullOrWhiteSpace($DockerHubUsername)) {
    Write-Error "Error: DockerHub username cannot be empty"
    exit 1
}

Write-Host "Publishing docker-compose.yml as OCI artifact..." -ForegroundColor Cyan

# Use the new docker compose publish command
$ImageTag = "$($DockerHubUsername)/stilnovo-compose:latest"

# NOTE: docker compose publish requires you to be logged in.
docker compose publish $ImageTag

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Docker Compose file successfully published as OCI artifact to $ImageTag" -ForegroundColor Green
} else {
    Write-Error "Failed to publish compose file. Ensure you are logged in (docker login) and have Docker Compose v2.34.0+"
    exit 1
}