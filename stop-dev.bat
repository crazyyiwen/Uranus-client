@echo off
echo Stopping dev server on port 5173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    echo Killing process %%a...
    taskkill /F /PID %%a
)
echo Dev server stopped.
