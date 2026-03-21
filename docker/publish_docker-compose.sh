param(
    [Parameter(Mandatory = $true)]
    [string]$DockerHubImage
)

$ErrorActionPreference = "Stop"

$composeFile = Join-Path $PSScriptRoot "docker_compose.yml"

if (-not (Test-Path $composeFile)) {
    throw "No se encuentra docker_compose.yml en $PSScriptRoot"
}

if (-not (Get-Command oras -ErrorAction SilentlyContinue)) {
    Write-Error @"
El comando 'oras' no esta instalado.
Instala oras desde https://oras.land/docs/installation

Ejemplo rapido (Windows con Scoop):
    scoop install oras

O descarga el binario directamente desde:
    https://github.com/oras-project/oras/releases
"@
    exit 1
}

Write-Host "Publicando docker_compose.yml como OCI Artifact en '$DockerHubImage'..."

oras push $DockerHubImage `
    --artifact-type "application/vnd.docker.compose.project" `
    "${composeFile}:application/vnd.docker.compose.file"

Write-Host ""
Write-Host "Publicado correctamente: $DockerHubImage"
Write-Host ""
Write-Host "Para ejecutar la aplicacion completa en cualquier maquina:"
Write-Host "  docker compose -f oci://$DockerHubImage up"
Write-Host ""
Write-Host "Para el primer arranque (crea esquema y datos de ejemplo):"
Write-Host "  DDL_AUTO=create docker compose -f oci://$DockerHubImage up"

    Copy-Item (Join-Path $PSScriptRoot "docker_compose.yml") (Join-Path $tempDir "docker-compose.yml")

    @"
FROM alpine:3.20
WORKDIR /bundle
COPY docker-compose.yml /bundle/docker-compose.yml
CMD ["cat", "/bundle/docker-compose.yml"]
"@ | Set-Content -Path (Join-Path $tempDir "Dockerfile") -Encoding UTF8

    Write-Host "Construyendo imagen con docker-compose.yml..."
    docker build -t $DockerHubImage $tempDir

    Write-Host "Publicando imagen '$DockerHubImage' en Docker Hub..."
    docker push $DockerHubImage

    Write-Host "docker_compose.yml publicado dentro de la imagen: $DockerHubImage"
}
finally {
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}
