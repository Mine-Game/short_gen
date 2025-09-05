@echo off
echo Applying Prisma migration...
echo.
echo Step 1: Generating Prisma client...
call npx prisma generate
echo.
echo Step 2: Pushing schema to database...
call npx prisma db push
echo.
echo Step 3: Restoring UTM functionality...
call node restore-utm-functionality.js
echo.
echo Migration completed! Please restart your development server.
pause
