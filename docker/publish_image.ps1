param(
    [Parameter(Mandatory=$true)]
    [string]$DockerHubUsername
)

# Validate input
if ([string]::IsNullOrWhiteSpace($DockerHubUsername)) {
    Write-Error "Error: DockerHub username cannot be empty"
    Write-Error "Usage: .\publish_image.ps1 -DockerHubUsername your-dockerhub-username"
    exit 1
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Docker Image Publication to DockerHub" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Publishing Docker image to DockerHub..." -ForegroundColor Cyan
Write-Host "Username: $DockerHubUsername" -ForegroundColor Yellow

# We assume the local image is named 'stilnovo-app'
# Tag the image with DockerHub username
Write-Host "Tagging image: stilnovo-app -> $DockerHubUsername/stilnovo-app:latest" -ForegroundColor Cyan
docker tag stilnovo-app "$DockerHubUsername/stilnovo-app:latest"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to tag image. Make sure silnovo-app image exists locally."
    Write-Error "Did you run create_image.ps1 first?"
    exit 1
}

# Step 2: Push image to DockerHub
Write-Host ""
Write-Host "Step 2: Pushing image to DockerHub..." -ForegroundColor Cyan
Write-Host "  This may take a few minutes depending on image size" -ForegroundColor Gray

docker push "$DockerHubUsername/stilnovo-app:latest"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "Publication Successful" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Image available at:" -ForegroundColor Cyan
    Write-Host "  https://hub.docker.com/r/$DockerHubUsername/stilnovo-app" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Publish docker-compose: .\publish_docker-compose.ps1 -DockerHubUsername $DockerHubUsername" -ForegroundColor Green
    Write-Host "  2. Deploy to VM:" -ForegroundColor Green
    Write-Host "     docker-compose -e DOCKER_HUB_USER=$DockerHubUsername -e DDL_AUTO=create up -d" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Error "Push failed. Make sure you are logged in to DockerHub: docker login"
    exit 1
}
