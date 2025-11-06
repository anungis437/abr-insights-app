@echo off
echo.
echo ============================================================
echo   ABR Insights - Database Migration Helper
echo ============================================================
echo.
echo Due to Supabase security restrictions, DDL statements
echo (CREATE TABLE) cannot be executed via API.
echo.
echo Please follow these steps:
echo.
echo 1. Open your browser to:
echo    https://app.supabase.com/project/nuywgvbkgdvngrysqdul/sql/new
echo.
echo 2. Copy the SQL from:
echo    %~dp0create_tables.sql
echo.
echo 3. Paste into SQL Editor and click "Run"
echo.
echo 4. Return here and press any key to verify...
echo.
pause

echo.
echo Verifying tables...
npx tsx --env-file=.env.local ingestion\src\debug\setup-tables.ts

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo   SUCCESS! Running storage integration test...
    echo ============================================================
    echo.
    npx tsx --env-file=.env.local ingestion\src\debug\test-storage-integration.ts
) else (
    echo.
    echo Tables not found. Please try again.
    echo.
)
