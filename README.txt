# Proyecto: Optimización de Bodega con Algoritmo Genético (GA)

Aplicación web que ejecuta un Algoritmo Genético para seleccionar y acomodar artículos (p. ej., neveras, TVs, ventiladores) dentro de un área limitada, maximizando la ganancia y mostrando: (1) distribución 2D de artículos en un canvas, (2) curva de convergencia del fitness y (3) resumen de resultados (área usada, costo, beneficio, ganancia, cantidades).

## Stack
- Backend: Python 3.10+, FastAPI, Uvicorn
- Frontend: React + Vite (Node.js 18–20; npm)
- Comunicación: REST (JSON) con CORS habilitado

## Requisitos previos
- Git
- Python 3.10+ con pip y venv
  - Linux: `sudo apt-get install python3 python3-venv python3-pip`
- Node.js 18 o 20 y npm
  - Ver versiones: `node -v && npm -v`
  - Si ves errores raros de npm: `npm i -g npm@latest`

## Estructura sugerida
```
.
├─ backend/
│  ├─ app/
│  │  ├─ main.py            # FastAPI (entrypoint)
│  │  ├─ ga_core.py         # lógica GA (fitness, cruce, mutación, etc.)
│  │  ├─ schemas.py         # modelos Pydantic (request/response)
│  │  ├─ services/          # utilidades auxiliares
│  │  └─ __init__.py
│  ├─ tests/
│  ├─ requirements.txt
│  └─ .env.example
├─ frontend/
│  ├─ index.html
│  ├─ src/
│  │  ├─ main.jsx
│  │  ├─ api/client.js
│  │  ├─ components/
│  │  │  ├─ Catalogo.jsx
│  │  │  ├─ CanvasDistribucion.jsx
│  │  │  └─ GraficaConvergencia.jsx
│  │  └─ styles.css
│  ├─ package.json
│  └─ .env.example
└─ README.md
```

## Variables de entorno
### Backend — `backend/.env`
```
APP_HOST=0.0.0.0
APP_PORT=8000
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
AREA_MAX=50
```

### Frontend — `frontend/.env`
```
VITE_API_URL=http://localhost:8000
```

## Instalación y ejecución local
### 1) Backend (FastAPI)
a) Crear y activar venv  
Linux/macOS:
```
cd backend
python3 -m venv .venv
source .venv/bin/activate
```
Windows (PowerShell):
```
cd backend
py -3.10 -m venv .venv
.\.venv\Scripts\Activate.ps1
```
b) Instalar dependencias:
```
pip install -r requirements.txt
```
Ejemplo mínimo de `requirements.txt`:
```
fastapi
uvicorn[standard]
pydantic
numpy
```
c) Configurar `.env`:
```
cp .env.example .env   # en Windows copia manual
```
d) Ejecutar:
```
uvicorn app.main:app --reload --host ${APP_HOST:-0.0.0.0} --port ${APP_PORT:-8000}
```
- API: http://localhost:8000  
- Docs OpenAPI: http://localhost:8000/docs  
- Healthcheck: `GET /health`

### 2) Frontend (React + Vite)
a) Instalar dependencias:
```
cd frontend
npm install
```
b) Configurar `.env` (o copiar `.env.example`):
```
VITE_API_URL=http://localhost:8000
```
c) Ejecutar en desarrollo:
```
npm run dev
```
- App: http://localhost:5173  
d) Build de producción (opcional):
```
npm run build
npm run preview
```

## API — Endpoints principales
### `GET /health`
Devuelve estado simple del servicio.

### `POST /api/ga/run`
Ejecuta el GA con el catálogo y parámetros recibidos.

Request (ejemplo):
```json
{
  "catalogo": [
    { "id": 1, "nombre": "Nevera", "area": 3.5, "costo": 1200, "beneficio": 1800, "max_unidades": 5, "seleccionado": true },
    { "id": 2, "nombre": "TV", "area": 1.2, "costo": 500, "beneficio": 850, "max_unidades": 8, "seleccionado": true }
  ],
  "parametros": {
    "tam_poblacion": 100,
    "num_generaciones": 50,
    "prob_cruce": 0.6,
    "prob_mutacion": 0.15,
    "seleccion": "torneo",
    "elitismo": 2,
    "area_max": 50
  }
}
```

Response (ejemplo):
```json
{
  "mejor_fitness": 123.45,
  "mejor_solucion": [
    { "id": 1, "cantidad": 2, "x": 0.0, "y": 0.0, "w": 1.5, "h": 2.3, "rot": 0 },
    { "id": 2, "cantidad": 3, "x": 2.0, "y": 1.0, "w": 1.2, "h": 1.0, "rot": 90 }
  ],
  "historial_fitness": [85.2, 96.1, 110.7, 123.45],
  "resumen": {
    "area_usada": 48.7,
    "area_disponible": 50.0,
    "costo_total": 3200,
    "beneficio_total": 4550,
    "ganancia": 1350,
    "unidades_totales": 5
  }
}
```

Notas de la distribución 2D:
- El frontend interpreta `x,y` como coordenadas del canvas (normalizadas o en metros), `w,h` como dimensiones proyectadas y `rot` como rotación en grados (opcional).
- Si el GA no optimiza posiciones, puede devolver solo cantidades por artículo; el frontend puede simular una disposición simple o mostrar solo métricas.

## Función objetivo, restricciones y supuestos
Función objetivo (maximizar ganancia):
```
max Ganancia = Σ_i (beneficio_i - costo_i) * cantidad_i
```
Restricciones:
1) Capacidad de área:
```
Σ_i area_i * cantidad_i ≤ AREA_MAX
```
2) Disponibilidad:
```
0 ≤ cantidad_i ≤ max_unidades_i,  cantidad_i ∈ ℤ
```
3) Selección opcional: artículos con `seleccionado=false` no se incluyen.

Supuestos:
- El área de cada artículo aproxima el espacio requerido; no hay solapamiento, o este lo controla el GA.
- Beneficio y costo son unitarios y comparables (misma moneda).
- La convergencia del GA se evalúa por la mejor aptitud por generación.

## Scripts útiles
Backend:
```
black app
pytest -q
```
Frontend:
```
npm run lint
npm run format
npm run build
npm run preview
```
Correr ambos (dos terminales):
- Backend: `uvicorn app.main:app --reload --port 8000`
- Frontend: `npm run dev`

## Solución de problemas (FAQ)
1) Linux: `bash: python: command not found`  
Instala Python y usa `python3`:
```
sudo apt-get update
sudo apt-get install -y python3 python3-venv python3-pip
python3 -m venv .venv
```
2) Rutas con espacios (Linux/macOS)  
Usa comillas:
```
cd ~/Documents/U-9/"PR ALGORITMO GENETICOS"/"AG Python"/PROYECTO_BODEGA
```
3) npm error `cb.apply is not a function` u otros  
Actualiza npm:
```
npm i -g npm@latest
```
4) CORS bloquea solicitudes  
Incluye `http://localhost:5173` en `CORS_ORIGINS` del backend y verifica `VITE_API_URL` en frontend.
5) Puerto ocupado  
Cambia el puerto en backend (`APP_PORT`) o frontend:
```
npm run dev -- --port 5174
```
6) `.env` del frontend no funciona  
En Vite, las variables deben empezar por `VITE_`. Tras cambiar `.env`, reinicia `npm run dev`.
7) No aparecen posiciones en canvas  
Si la API no devuelve `x,y,w,h,rot`, el frontend puede mostrar solo métricas o hacer un layout heurístico. Verifica el contrato JSON.

## Git, .gitignore y publicación
.gitignore recomendado (raíz):
```
# Python
.venv/
__pycache__/
*.pyc

# Node/React
node_modules/
dist/
.vite/

# OS/IDE
.DS_Store
Thumbs.db
.vscode/
```
Publicar en GitHub (repo remoto vacío recomendado):
```
cd /ruta/a/tu/proyecto
git init
git branch -M main
git add .
git commit -m "init: proyecto GA backend+frontend"
git remote add origin https://github.com/<usuario>/<repo>.git
git push -u origin main
```
Si el remoto ya tenía un README inicial:
```
git pull --rebase origin main
# resuelve conflictos
git push
```

## Notas de uso / evaluación
- Incluye capturas en `docs/` (UI, canvas, curva) si lo exige la entrega y enlázalas aquí.
- Para reproducibilidad, fija versiones en `requirements.txt` y `package.json` si se requiere.
- Añade ejemplos de entrada/salida del endpoint en `docs/` si deseas mayor documentación.

## Licencia
Elige una licencia (p. ej., MIT). Crea `LICENSE` en la raíz o selecciónala en GitHub.

## Autores
- Iván Andrés Orozco Villarraga — 2025
- Maira Alejandra Muñoz Ramírez — 2025
