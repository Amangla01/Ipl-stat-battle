# IPL Stat Battle - Dev Server Launcher (PowerShell)
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "   IPL STAT BATTLE - DEV MODE" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# Start server in background
Write-Host "`n[1/2] Starting server on port 3001..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$PSScriptRoot\server'; npm run dev`"" -WindowStyle Normal

Start-Sleep -Seconds 2

# Start client in background
Write-Host "[2/2] Starting client on port 5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$PSScriptRoot\client'; npm run dev`"" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Game running at: http://localhost:5173" -ForegroundColor Green
Write-Host "  Server API:       http://localhost:3001/api/health" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Open browser
Start-Process "http://localhost:5173"
