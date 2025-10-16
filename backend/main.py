# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from ga_core import run_ga, GAParams

app = FastAPI(title="GA Bodega Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Item(BaseModel):
    id: int
    nombre: str
    area: float
    ganancia: float
    stock: int

class Params(BaseModel):
    tam_poblacion: int
    num_generaciones: int
    prob_cruce: float
    prob_mutacion: float
    torneo_k: int
    elitismo: int
    tipo_seleccion: str
    usar_reparacion: bool
    modo_objetivo: str
    alfa: float
    beta: float
    semilla: int = 42

class RequestGA(BaseModel):
    catalogo: List[Item]
    ids_activos: List[int]
    area_maxima: float
    agrupar: bool
    params: Params

@app.post("/run")
def run_ga_endpoint(req: RequestGA) -> Dict[str, Any]:
    params = GAParams(**req.params.dict())
    catalogo_dicts = [it.dict() for it in req.catalogo]
    result = run_ga(catalogo_dicts, params, req.area_maxima, set(req.ids_activos))
    # Nota: el frontend reconstruirá los gráficos localmente
    return result

@app.get("/health")
def health():
    return {"status": "ok"}
