import React, { useEffect, useRef } from "react";

/**
 * Visualización aproximada:
 * - Cada unidad de un ítem se dibuja como un cuadrado cuyo lado ≈ √(área) escalada.
 * - Packing tipo "shelf".
 */
export default function CanvasDistribucion({
  areaMaxima = 50,
  catalogoEfectivo,
  mejorIndividuo,
  idsActivos,
  width = 520,
  height = 520,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Fondo y borde
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#cbd5e1";
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

    if (!catalogoEfectivo || !mejorIndividuo) {
      ctx.fillStyle = "#64748b";
      ctx.font = "14px sans-serif";
      ctx.fillText("Ejecuta el GA para ver la distribución.", 14, 28);
      return;
    }

    const Lref = Math.sqrt(Number(areaMaxima));
    const scale = Math.min(width, height) / (Lref || 1);

    let x = 8;
    let y = 8;
    let shelfH = 0;

    const palette = ["#93c5fd", "#86efac", "#fca5a5", "#fcd34d", "#c4b5fd", "#f9a8d4", "#a5b4fc", "#fdba74"];

    for (let i = 0; i < catalogoEfectivo.length; i++) {
      const it = catalogoEfectivo[i];
      const qty = Math.max(0, Number(mejorIndividuo[i] || 0));
      if (qty === 0) continue;

      const baseColor = palette[i % palette.length];
      const isActive = idsActivos?.includes(it.id);
      const rectColor = isActive ? baseColor : `${baseColor}55`; // atenuado

      for (let k = 0; k < qty; k++) {
        const side = Math.sqrt(Number(it.area) || 0) * scale;
        if (side <= 0) continue;

        // Salto de fila si no cabe
        if (x + side + 8 > width) {
          x = 8;
          y += shelfH + 8;
          shelfH = 0;
        }
        if (y + side + 8 > height) {
          ctx.fillStyle = "#ef4444";
          ctx.font = "12px sans-serif";
          ctx.fillText("⚠️ Vista recortada por límites del canvas.", 12, height - 10);
          return;
        }

        // *** APLICAR EL COLOR EN CADA BLOQUE ***
        ctx.fillStyle = rectColor;
        ctx.fillRect(x, y, side, side);
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.strokeRect(x, y, side, side);

        // Etiqueta solo en el primer bloque del ítem
        if (k === 0) {
          ctx.save(); // <-- guardamos estilos actuales
          ctx.fillStyle = "#111827";
          ctx.font = "12px sans-serif";
          const label = `${it.nombre} ×${qty}`;
          // Evitar que el texto se salga si el bloque es muy pequeño
          if (side >= 18) {
            ctx.fillText(label, x + 4, y + Math.min(14, side - 4));
          }
          ctx.restore(); // <-- recuperamos fillStyle = rectColor
        }

        x += side + 6;
        shelfH = Math.max(shelfH, side);
      }
    }
  }, [areaMaxima, catalogoEfectivo, mejorIndividuo, idsActivos, width, height]);

  return (
    <div style={{ background: "#fff", padding: 12, borderRadius: 12, boxShadow: "0 0 6px rgba(0,0,0,0.06)" }}>
      <canvas ref={canvasRef} width={width} height={height} style={{ width, height, borderRadius: 8 }} />
      <p style={{ color: "#64748b", fontSize: 12, marginTop: 8 }}>
        Visualización proporcional: cada bloque ≈ √(área) escalada. Sólo ilustrativa.
      </p>
    </div>
  );
}
