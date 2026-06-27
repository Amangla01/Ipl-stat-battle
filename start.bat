@echo off
echo ========================================
echo   IPL STAT BATTLE - STARTUP
echo ========================================
echo.

echo [1/3] Installing server dependencies...
cd server
call npm install
echo.

echo [2/3] Installing client dependencies...
cd ..\client
call npm install
echo.

echo [3/3] Seeding IPL player data...
cd ..\server
call npm run seed
echo.

echo ========================================
echo   Ready! Now start the servers:
echo   1. Terminal 1: cd server && npm run dev
echo   2. Terminal 2: cd client && npm run dev
echo   3. Open: http://localhost:5173
echo ========================================
pause
