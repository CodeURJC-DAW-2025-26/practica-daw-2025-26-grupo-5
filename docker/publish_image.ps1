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
