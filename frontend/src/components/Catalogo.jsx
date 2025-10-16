import React from "react";

// Layout de columnas: On | Nombre | Área | Ganancia | Stock | X
const GRID_COLS = "24px 1fr 50px 70px 50px 32px";

export default function Catalogo({ catalogo, onChange }) {
  const updateItem = (idx, key, val) => {
    const next = [...catalogo];
    next[idx] = { ...next[idx], [key]: val };
    onChange(next);
  };

  const onText = (idx, key) => (e) => updateItem(idx, key, e.target.value);  // string (permite borrar)
  const onNumber = (idx, key) => (e) => updateItem(idx, key, e.target.value); // guardamos string; se castea al enviar

  const addItem = () => {
    const maxId = Math.max(0, ...catalogo.map(c => c.id || 0));
    onChange([
      ...catalogo,
      { id: maxId + 1, nombre: "", area: "", ganancia: "", stock: "", activo: true },
    ]);
  };

  const remove = (idx) => {
    const next = [...catalogo];
    next.splice(idx, 1);
    onChange(next);
  };

  const cellInputStyle = {
    width: "100%",
    minWidth: 0,            // 👈 importante en grids para que no empuje
    padding: "6px 8px",     // un poquito más compacto
    border: "1px solid #d1d5db",
    borderRadius: 8,
    background: "#fff",
    color: "#111827",
  };

  return (
    <div style={{ background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 0 6px rgba(0,0,0,0.06)" }}>
      <h2>📦 Catálogo</h2>

      {/* Encabezado */}
      <div style={{
        display: "grid",
        gridTemplateColumns: GRID_COLS,
        gap: 8,
        fontSize: 14,
        fontWeight: 600,
        color: "#555",
        alignItems: "center",
        marginBottom: 6
      }}>
        <div>On</div>
        <div>NombreArtículo</div>
        <div>Área</div>
        <div>Ganancia</div>
        <div>Stock</div>
        <div></div>
      </div>

      {/* Filas */}
      {catalogo.map((it, idx) => (
        <div key={it.id ?? idx} style={{
          display: "grid",
          gridTemplateColumns: GRID_COLS,   // 👈 el mismo grid que arriba
          gap: 8,
          alignItems: "center",
          marginTop: 6
        }}>
          <input
            type="checkbox"
            checked={!!it.activo}
            onChange={(e) => updateItem(idx, "activo", e.target.checked)}
          />

          {/* NOMBRE */}
          <input
            type="text"
            value={String(it.nombre ?? "")}
            onChange={onText(idx, "nombre")}
            placeholder="Nombre del ítem"
            autoComplete="off"
            spellCheck="false"
            style={{ ...cellInputStyle, minWidth: 100 }}   // 👈 permite encoger
          />

          {/* ÁREA */}
          <input
            type="number"
            step="0.01"
            inputMode="decimal"
            value={String(it.area ?? "")}
            onChange={onNumber(idx, "area")}
            placeholder="e.g., 0.50"
            style={cellInputStyle}
          />

          {/* GANANCIA */}
          <input
            type="number"
            step="1"
            inputMode="numeric"
            value={String(it.ganancia ?? "")}
            onChange={onNumber(idx, "ganancia")}
            placeholder="e.g., 1200"
            style={cellInputStyle}
          />

          {/* STOCK */}
          <input
            type="number"
            step="1"
            inputMode="numeric"
            value={String(it.stock ?? "")}
            onChange={onNumber(idx, "stock")}
            placeholder="e.g., 5"
            style={cellInputStyle}
          />

          <button
            title="Eliminar"
            onClick={() => remove(idx)}
            style={{ border: "1px solid #ddd", borderRadius: 8, background: "#fff", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
      ))}

      <button
        onClick={addItem}
        style={{
          marginTop: 10,
          background: "#22c55e",
          color: "white",
          border: "none",
          padding: "8px 12px",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        + Agregar ítem
      </button>
    </div>
  );
}
