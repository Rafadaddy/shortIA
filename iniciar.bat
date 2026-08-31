@echo off
echo ========================================================
echo        INICIANDO LABSIA CLON (GENERADOR DE VIDEOS)      
echo ========================================================
echo.

:: Moverse a la carpeta donde está este archivo (dinámico)
cd /d "%~dp0"

:: Comprobar si node_modules existe, si no, instalar dependencias
if not exist "node_modules\" (
    echo [1/3] Instalando dependencias por primera vez... (esto puede tardar unos minutos)
    call npm install
) else (
    echo [1/3] Dependencias ya instaladas.
)

:: Comprobar si existe el archivo .env.local
if not exist ".env.local" (
    echo [2/3] ADVERTENCIA: No se encontro el archivo .env.local
    echo Por favor, crea un archivo .env.local en c:\PROGRAMAS\short IA
    echo y agrega tu GROQ_API_KEY="tu_clave_aqui"
    echo.
) else (
    echo [2/3] Archivo .env.local encontrado.
)

echo [3/3] Iniciando el servidor local...
echo.
echo ========================================================
echo IMPORTANTE: No cierres esta ventana negra. 
echo La aplicacion estara viva mientras esta ventana este abierta.
echo ========================================================
echo.

:: Abrir el navegador automaticamente
start http://localhost:3000

:: Iniciar Next.js
call npm run dev
