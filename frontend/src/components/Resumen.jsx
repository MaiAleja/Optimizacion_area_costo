import React from "react";

export default function Resumen({ resp }) {
  if (!resp) return null;

  const {
    mejor_individuo,
    mejor_fitness,
    metricas,
    params,
  } = resp || {};

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 0 6px rgba(0,0,0,0.06)" }}>
        <h2>🔹 Resultado</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ color: "#64748b", fontSize: 13 }}>Mejor fitness</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{(mejor_fitness ?? 0).toFixed(3)}</div>
          </div>
          <div>
            <div style={{ color: "#64748b", fontSize: 13 }}>Utilización</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>
              {metricas?.utilizacion_pct?.toFixed(2)}%
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ color: "#64748b", fontSize: 13, marginBottom: 6 }}>Métricas</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            <Badge label="Área usada" value={metricas?.area_usada?.toFixed(2)} />
            <Badge label="Área máxima" value={metricas?.area_maxima?.toFixed(2)} />
            <Badge label="Ganancia total" value={metricas?.ganancia_total?.toFixed(2)} />
            <Badge label="Cantidad total" value={metricas?.cantidad_total} />
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 0 6px rgba(0,0,0,0.06)" }}>
        <h3>🧬 Mejor individuo</h3>
        <code style={{ display: "block", whiteSpace: "pre-wrap" }}>
          {JSON.stringify(mejor_individuo, null, 2)}
        </code>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 0 6px rgba(0,0,0,0.06)" }}>
        <h3>⚙️ Parámetros usados</h3>
        <code style={{ display: "block", whiteSpace: "pre-wrap" }}>
          {JSON.stringify(params, null, 2)}
        </code>
      </div>
    </div>
  );
}

function Badge({ label, value }) {
  return (
    <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 10px" }}>
      <div style={{ color: "#64748b", fontSize: 12 }}>{label}</div>
      <div style={{ fontWeight: 700 }}>{value ?? "-"}</div>
    </div>
  );
}
