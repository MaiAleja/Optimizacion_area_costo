# -*- coding: utf-8 -*-
"""
Módulo central del Algoritmo Genético para optimización de área en bodega.
Versión adaptada para backend (FastAPI) — sin GUI ni gráficas directas.

Incluye:
 - Definición de parámetros GA (GAParams)
 - Funciones de evaluación, selección, cruce y mutación
 - Función principal run_ga() que devuelve resultados en formato JSON serializable
"""

import math
import random
from dataclasses import dataclass, asdict
from copy import deepcopy
from typing import Any, Dict, List, Tuple, Optional

# =========================
# Parámetros y configuración
# =========================
GRID_W = 50
GRID_H = 50
GRID_CELLS = GRID_W * GRID_H

@dataclass
class GAParams:
    tam_poblacion: int = 100
    num_generaciones: int = 60
    prob_cruce: float = 0.6
    prob_mutacion: float = 0.15
    torneo_k: int = 3
    elitismo: int = 2
    tipo_seleccion: str = "torneo"     # "torneo" | "ruleta"
    usar_reparacion: bool = True
    penalizacion: float = 1000.0
    modo_objetivo: str = "ganancia"    # "ganancia" | "cantidad_prioritaria" | "mixto"
    alfa: float = 1.0
    beta: float = 0.0
    semilla: int = 42


# =========================
# Funciones auxiliares
# =========================
def filtrar_catalogo(catalogo: List[Dict[str, Any]], ids_activos: Optional[set]) -> List[Dict[str, Any]]:
    if not ids_activos:
        return catalogo[:]
    return [it for it in catalogo if it["id"] in ids_activos]


def area_ganancia_cantidad(ind: List[int], catalogo: List[Dict[str, Any]]):
    """Calcula área total, ganancia total y cantidad total."""
    a = g = 0.0
    c = 0
    for q, it in zip(ind, catalogo):
        a += q * float(it["area"])
        g += q * float(it["ganancia"])
        c += int(q)
    return a, g, c


def fitness(ind: List[int], catalogo: List[Dict[str, Any]], params: GAParams, area_maxima: float) -> float:
    """Evalúa la calidad (fitness) de un individuo."""
    a, g, c = area_ganancia_cantidad(ind, catalogo)
    if params.modo_objetivo == "ganancia":
        fit = g
    elif params.modo_objetivo == "cantidad_prioritaria":
        fit = c * 10_000 + g
    else:
        fit = params.alfa * g + params.beta * c

    if a > area_maxima and not params.usar_reparacion:
        fit -= params.penalizacion * (a - area_maxima)
    return fit


def crear_individuo(catalogo: List[Dict[str, Any]]) -> List[int]:
    """Crea un individuo aleatorio respetando stock máximo."""
    return [random.randint(0, int(it["stock"])) for it in catalogo]


def reparar(ind: List[int], catalogo: List[Dict[str, Any]], area_maxima: float) -> List[int]:
    """Si el área total excede el límite, reduce unidades empezando por las más grandes."""
    def total_area(indv):
        return sum(q * float(it["area"]) for q, it in zip(indv, catalogo))
    ind = ind[:]
    while total_area(ind) > area_maxima:
        indices = [i for i, q in enumerate(ind) if q > 0]
        if not indices:
            break
        i = max(indices, key=lambda j: float(catalogo[j]["area"]))
        ind[i] -= 1
    return ind


def seleccionar_torneo(poblacion, fitnesses, k):
    candidatos = random.sample(range(len(poblacion)), k)
    best_i = max(candidatos, key=lambda i: fitnesses[i])
    return deepcopy(poblacion[best_i])


def seleccionar_ruleta(poblacion, fitnesses, params: GAParams):
    min_fit = min(fitnesses)
    shift = -min_fit + 1e-9 if min_fit <= 0 else 0.0
    pesos = [f + shift for f in fitnesses]
    total = sum(pesos)
    if total <= 0:
        return seleccionar_torneo(poblacion, fitnesses, params.torneo_k)
    r = random.uniform(0, total)
    acum = 0.0
    for ind, w in zip(poblacion, pesos):
        acum += w
        if acum >= r:
            return deepcopy(ind)
    return deepcopy(poblacion[-1])


def seleccionar(poblacion, fitnesses, params: GAParams):
    if params.tipo_seleccion.lower().startswith("ru"):
        return seleccionar_ruleta(poblacion, fitnesses, params)
    return seleccionar_torneo(poblacion, fitnesses, params.torneo_k)


def cruzar_uniforme(a: List[int], b: List[int], prob_gen: float = 0.5) -> Tuple[List[int], List[int]]:
    h1, h2 = a.copy(), b.copy()
    for i in range(len(a)):
        if random.random() < prob_gen:
            h1[i], h2[i] = h2[i], h1[i]
    return h1, h2


def mutar(ind: List[int], prob_mut: float, catalogo: List[Dict[str, Any]]) -> List[int]:
    for i in range(len(ind)):
        if random.random() < prob_mut:
            if random.random() < 0.5:
                ind[i] = max(0, ind[i] - 1)
            else:
                ind[i] = min(int(catalogo[i]["stock"]), ind[i] + 1)
    return ind


# =========================
# Función principal GA
# =========================
def run_ga(
    catalogo: List[Dict[str, Any]],
    params: GAParams,
    area_maxima: float,
    ids_activos: Optional[set] = None,
) -> Dict[str, Any]:
    """Ejecuta el algoritmo genético y devuelve un dict con resultados."""
    random.seed(params.semilla)
    catalogo_eff = filtrar_catalogo(catalogo, ids_activos)
    if not catalogo_eff:
        raise ValueError("No hay artículos activos.")

    poblacion = [crear_individuo(catalogo_eff) for _ in range(params.tam_poblacion)]
    if params.usar_reparacion:
        poblacion = [reparar(ind, catalogo_eff, area_maxima) for ind in poblacion]
    fitnesses = [fitness(ind, catalogo_eff, params, area_maxima) for ind in poblacion]

    hist_mejor, hist_promedio = [], []
    mejor_global = None
    mejor_fit = float("-inf")

    for _ in range(params.num_generaciones):
        pares = sorted(zip(poblacion, fitnesses), key=lambda x: x[1], reverse=True)
        top_ind, top_fit = pares[0]
        if top_fit > mejor_fit:
            mejor_fit = top_fit
            mejor_global = deepcopy(top_ind)
        prom = sum(f for _, f in pares) / len(pares)
        hist_mejor.append(top_fit)
        hist_promedio.append(prom)

        nueva = [deepcopy(pares[i][0]) for i in range(min(params.elitismo, len(pares)))]
        while len(nueva) < params.tam_poblacion:
            p1 = seleccionar(poblacion, fitnesses, params)
            p2 = seleccionar(poblacion, fitnesses, params)
            if random.random() < params.prob_cruce:
                h1, h2 = cruzar_uniforme(p1, p2)
            else:
                h1, h2 = deepcopy(p1), deepcopy(p2)
            h1 = mutar(h1, params.prob_mutacion, catalogo_eff)
            h2 = mutar(h2, params.prob_mutacion, catalogo_eff)
            h1 = [max(0, min(q, int(it["stock"]))) for q, it in zip(h1, catalogo_eff)]
            h2 = [max(0, min(q, int(it["stock"]))) for q, it in zip(h2, catalogo_eff)]
            if params.usar_reparacion:
                h1 = reparar(h1, catalogo_eff, area_maxima)
                h2 = reparar(h2, catalogo_eff, area_maxima)
            nueva.append(h1)
            if len(nueva) < params.tam_poblacion:
                nueva.append(h2)

        poblacion = nueva
        fitnesses = [fitness(ind, catalogo_eff, params, area_maxima) for ind in poblacion]

    a, g, c = area_ganancia_cantidad(mejor_global, catalogo_eff)
    utilizacion = a / area_maxima * 100.0 if area_maxima > 0 else 0.0

    # Resultados serializables para JSON
    return {
        "mejor_individuo": mejor_global,
        "mejor_fitness": mejor_fit,
        "metricas": {
            "area_usada": a,
            "area_maxima": area_maxima,
            "ganancia_total": g,
            "cantidad_total": c,
            "utilizacion_pct": utilizacion,
        },
        "historia": {"mejor": hist_mejor, "promedio": hist_promedio},
        "catalogo_efectivo": catalogo_eff,
        "params": asdict(params),
    }
