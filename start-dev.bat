@echo off
echo Starting development server...
npx prisma generate
npx prisma db push
npm run dev
