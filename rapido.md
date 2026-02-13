# Guia Rapida - Levantar el Proyecto

## Requisitos previos
- Docker Desktop abierto y corriendo
- Python 3.11+ instalado
- Node.js 18+ instalado
- Expo Go instalado en el celular (App Store / Play Store)

---

## Levantar todo (3 terminales)

### Terminal 1 - Docker (Moodle + Base de Datos)
```powershell
cd D:\Developer\Dome_proyect\docker
docker-compose up -d
```
Verificar que esten corriendo:
```powershell
docker ps
```
Esperar ~2-3 minutos la primera vez. Moodle disponible en http://localhost:8080

### Terminal 2 - Backend FastAPI
```powershell
cd D:\Developer\Dome_proyect\backend
.\venv\Scripts\Activate
uvicorn app.main:app --reload --host 0.0.0.0
```
Debe mostrar `Application startup complete`. API en http://localhost:8000/docs

### Terminal 3 - App Movil (Expo)
```powershell
cd D:\Developer\Dome_proyect\mobile
npx expo start --tunnel
```
Escanear el codigo QR con Expo Go en el celular.

---

## Detener todo (orden inverso)

1. **Terminal 3:** `Ctrl+C` (detiene Expo)
2. **Terminal 2:** `Ctrl+C` (detiene Backend)
3. **Terminal 1:**
```powershell
cd D:\Developer\Dome_proyect\docker
docker-compose down
```

---

## Resumen

| Orden | Servicio         | Puerto | Comando principal                                |
|-------|------------------|--------|--------------------------------------------------|
| 1     | MariaDB + Moodle | 8080   | `docker-compose up -d`                           |
| 2     | Backend API      | 8000   | `uvicorn app.main:app --reload --host 0.0.0.0`   |
| 3     | App Movil        | 8081   | `npx expo start --tunnel`                        |

## Credenciales Moodle
- **Usuario:** admin
- **Contrasena:** Admin123!

## Acceso desde celular
- Descargar **Expo Go** en el celular
- Escanear el QR que aparece en la Terminal 3
- El modo `--tunnel` permite conectarse sin estar en la misma red Wi-Fi
