@echo off
echo Cleaning Laravel caches...
cd backend
call php artisan cache:clear
call php artisan config:clear
call php artisan view:clear
call php artisan route:clear
call php artisan optimize:clear
cd ..
echo Building frontend...
call npm run build
echo Done!
