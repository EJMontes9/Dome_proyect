# Script para levantar Moodle en Docker (Windows PowerShell)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Levantando Moodle en Docker..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Verificar que Docker está corriendo
$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker no está corriendo. Por favor inicia Docker Desktop." -ForegroundColor Red
    exit 1
}

# Cambiar al directorio del script
Set-Location $PSScriptRoot

# Levantar los contenedores
Write-Host "`nIniciando contenedores..." -ForegroundColor Yellow
docker compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudieron iniciar los contenedores." -ForegroundColor Red
    exit 1
}

Write-Host "`nEsperando a que Moodle este listo..." -ForegroundColor Yellow
Write-Host "(Esto puede tomar 2-3 minutos en la primera ejecucion)" -ForegroundColor Gray

# Esperar a que Moodle responda
$maxAttempts = 30
$attempt = 0
$ready = $false

while (-not $ready -and $attempt -lt $maxAttempts) {
    $attempt++
    Write-Host "  Intento $attempt/$maxAttempts..." -ForegroundColor Gray

    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8090" -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $ready = $true
        }
    } catch {
        Start-Sleep -Seconds 10
    }
}

if ($ready) {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  Moodle esta listo!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "`nURL: http://localhost:8090" -ForegroundColor White
    Write-Host "Usuario: admin" -ForegroundColor White
    Write-Host "Contrasena: Admin123!" -ForegroundColor White
    Write-Host "`nPasos siguientes:" -ForegroundColor Yellow
    Write-Host "1. Ir a Administracion > Plugins > Servicios web" -ForegroundColor Gray
    Write-Host "2. Habilitar servicios web" -ForegroundColor Gray
    Write-Host "3. Habilitar protocolo REST" -ForegroundColor Gray
    Write-Host "4. Crear servicio externo con las funciones requeridas" -ForegroundColor Gray
    Write-Host "5. Generar token para el usuario admin" -ForegroundColor Gray
} else {
    Write-Host "`nMoodle aun se esta iniciando. Intenta acceder en unos minutos." -ForegroundColor Yellow
    Write-Host "URL: http://localhost:8090" -ForegroundColor White
}
