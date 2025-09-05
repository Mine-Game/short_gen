Write-Host "Выполняю миграцию базы данных..." -ForegroundColor Green
npx prisma db push
Write-Host "Миграция завершена!" -ForegroundColor Green
Read-Host "Нажмите Enter для продолжения"
