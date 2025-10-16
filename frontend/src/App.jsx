import React, { useState } from "react";
import axios from "axios";
import ParamPanel from "./components/ParamPanel.jsx";
import Catalogo from "./components/Catalogo.jsx";
import ChartConvergencia from "./components/ChartConvergencia.jsx";
import CanvasDistribucion from "./components/CanvasDistribucion.jsx";
import Resumen from "./components/Resumen.jsx";

const API_URL = "http://127.0.0.1:8000";

const CATALOGO_INICIAL = [
  { id: 1, nombre: "Mini nevera", area: 4, ganancia: 1200, stock: 5, activo: true },
  { id: 2, nombre: "TV 42\"", area: 3, ganancia: 800, stock: 10, activo: true },
  { id: 3, nombre: "Ventilador", area: 2, ganancia: 300, stock: 12, activo: true },
  { id: 4, nombre: "Nevera grande", area: 9, ganancia: 2400, stock: 3, activo: false },
];

function App() {
  const [catalogo, setCatalogo] = useState(CATALOGO_INICIAL);
  const [areaMaxima, setAreaMaxima] = useState(50);
  const [agrupar, setAgrupar] = useState(false);

  const [params, setParams] = useState({
    tam_poblacion: 100,
    num_generaciones: 60,
    prob_cruce: 0.6,
    prob_mutacion: 0.15,
    torneo_k: 3,
    elitismo: 2, // entero
    tipo_seleccion: "torneo", // "torneo" | "ruleta"
    usar_reparacion: true,
    modo_objetivo: "ganancia", // "ganancia" | "cantidad_prioritaria" | "mixto"
    alfa: 1.0,
    beta: 0.0,
    semilla: 42,
  });

  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null); // respuesta completa del backend

  const ejecutar = async () => {
    try {
      setLoading(true);

      // Construir payload exactamente como lo espera tu backend
      const payload = {
        catalogo: catalogo.map(({ activo, ...rest }) => ({
          ...rest,
          area: Number(rest.area) || 0,
          ganancia: Number(rest.ganancia) || 0,
          stock: Number(rest.stock) || 0,
        })),
        ids_activos: catalogo.filter(c => c.activo).map(c => c.id),
        area_maxima: Number(areaMaxima),
        agrupar: Boolean(agrupar),
        params: {
          ...params,
          tam_poblacion: Number(params.tam_poblacion),
          num_generaciones: Number(params.num_generaciones),
          prob_cruce: Number(params.prob_cruce),
          prob_mutacion: Number(params.prob_mutacion),
          torneo_k: Number(params.torneo_k),
          elitismo: Number(params.elitismo),
          alfa: Number(params.alfa),
          beta: Number(params.beta),
          semilla: Number(params.semilla),
        },
      };

      const res = await axios.post(`${API_URL}/run`, payload);
      setResp(res.data);
    } catch (e) {
      console.error(e);
      alert("Error ejecutando el GA. Revisa la consola y que el backend esté activo en 8000.");
    } finally {
      setLoading(false);
    }
  };

  const idsActivos = catalogo.filter(c => c.activo).map(c => c.id);

  return (
    <div style={{ fontFamily: "Inter, system-ui, Arial, sans-serif", padding: 20 }}>
      <h1>🧬 Optimización de Bodega con GA</h1>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 24 }}>
        <div>
          <Catalogo
            catalogo={catalogo}
            onChange={setCatalogo}
          />

          <div style={{ marginTop: 16, background: "#f7f7f7", padding: 12, borderRadius: 10 }}>
            <label style={{ fontWeight: 600 }}>Área máxima (m²):</label>
            <input
              type="number"
              step="0.1"
              value={areaMaxima}
              onChange={e => setAreaMaxima(e.target.value)}
            />
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <input
                type="checkbox"
                checked={agrupar}
                onChange={e => setAgrupar(e.target.checked)}
              />
              Agrupar por tipo (vista)
            </label>
          </div>

          <ParamPanel params={params} onChange={setParams} onRun={ejecutar} loading={loading} />
        </div>

        <div>
          <Resumen resp={resp} />
          {resp?.historia && (
            <>
              <h2 style={{ marginTop: 20 }}>📈 Convergencia</h2>
              <ChartConvergencia
                historia={resp.historia}
              />
            </>
          )}

          <h2 style={{ marginTop: 20 }}>🗺️ Distribución (aproximada)</h2>
          <CanvasDistribucion
            areaMaxima={Number(areaMaxima)}
            catalogoEfectivo={resp?.catalogo_efectivo}
            mejorIndividuo={resp?.mejor_individuo}
            idsActivos={idsActivos}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
