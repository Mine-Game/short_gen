@echo off
echo Creating .env file...
echo # Database > .env
echo DATABASE_URL="file:./dev.db" >> .env
echo. >> .env
echo # NextAuth.js >> .env
echo NEXTAUTH_URL="http://localhost:3000" >> .env
echo NEXTAUTH_SECRET="your-super-secret-key-here-make-it-long-and-random-12345" >> .env
echo. >> .env
echo # Email (Gmail SMTP) >> .env
echo EMAIL_SERVER_HOST="smtp.gmail.com" >> .env
echo EMAIL_SERVER_PORT=587 >> .env
echo EMAIL_SERVER_USER="your-email@gmail.com" >> .env
echo EMAIL_SERVER_PASSWORD="your-app-password" >> .env
echo EMAIL_FROM="your-email@gmail.com" >> .env
echo. >> .env
echo # Дополнительные настройки >> .env
echo NODE_ENV="development" >> .env
echo .env file created successfully!
pause
