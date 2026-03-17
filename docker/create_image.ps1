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
