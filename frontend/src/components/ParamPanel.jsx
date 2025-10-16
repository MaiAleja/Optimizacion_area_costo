import React from "react";

export default function ParamPanel({ params, onChange, onRun, loading }) {
  const set = (k, v) => onChange({ ...params, [k]: v });

  return (
    <div style={{ background: "#fafafa", padding: 16, borderRadius: 12, marginTop: 16 }}>
      <h2>⚙️ Parámetros GA</h2>

      <label>Población</label>
      <input
        type="number"
        value={params.tam_poblacion}
        onChange={(e) => set("tam_poblacion", e.target.value)}
      />

      <label>Generaciones</label>
      <input
        type="number"
        value={params.num_generaciones}
        onChange={(e) => set("num_generaciones", e.target.value)}
      />

      <label>Prob. cruce</label>
      <input
        type="number"
        step="0.01"
        value={params.prob_cruce}
        onChange={(e) => set("prob_cruce", e.target.value)}
      />

      <label>Prob. mutación</label>
      <input
        type="number"
        step="0.01"
        value={params.prob_mutacion}
        onChange={(e) => set("prob_mutacion", e.target.value)}
      />

      <label>k Torneo</label>
      <input
        type="number"
        value={params.torneo_k}
        onChange={(e) => set("torneo_k", e.target.value)}
      />

      <label>Elitismo (n)</label>
      <input
        type="number"
        value={params.elitismo}
        onChange={(e) => set("elitismo", e.target.value)}
      />

      <label>Tipo de selección</label>
      <select
        value={params.tipo_seleccion}
        onChange={(e) => set("tipo_seleccion", e.target.value)}
      >
        <option value="torneo">Torneo</option>
        <option value="ruleta">Ruleta</option>
      </select>

      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="checkbox"
          checked={params.usar_reparacion}
          onChange={(e) => set("usar_reparacion", e.target.checked)}
        />
        Usar reparación
      </label>

      <label>Modo objetivo</label>
      <select
        value={params.modo_objetivo}
        onChange={(e) => set("modo_objetivo", e.target.value)}
      >
        <option value="ganancia">Ganancia</option>
        <option value="cantidad_prioritaria">Cantidad prioritaria</option>
        <option value="mixto">Mixto (alfa*ganancia + beta*cantidad)</option>
      </select>

      <label>α (mixto)</label>
      <input
        type="number"
        step="0.1"
        value={params.alfa}
        onChange={(e) => set("alfa", e.target.value)}
      />

      <label>β (mixto)</label>
      <input
        type="number"
        step="0.1"
        value={params.beta}
        onChange={(e) => set("beta", e.target.value)}
      />

      <label>Semilla</label>
      <input
        type="number"
        value={params.semilla}
        onChange={(e) => set("semilla", e.target.value)}
      />

      <button
        onClick={onRun}
        disabled={loading}
        style={{
          marginTop: 12,
          background: loading ? "#999" : "#007bff",
          color: "white",
          border: "none",
          padding: "10px 14px",
          borderRadius: 8,
          cursor: loading ? "not-allowed" : "pointer",
          width: "100%",
          fontWeight: 600,
        }}
      >
        {loading ? "Ejecutando..." : "Ejecutar GA"}
      </button>
    </div>
  );
}
