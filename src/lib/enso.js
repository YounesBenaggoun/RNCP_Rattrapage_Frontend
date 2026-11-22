// Ton API Express : GET /api/enso -> [{ year, month, oni }]
export const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3000/oni/all";

export const THEMES = ["light", "dark", "cupcake", "emerald", "synthwave", "night"];
export const COLORS = { elnino: "#ef4444", lanina: "#3b82f6", neutre: "#9ca3af" };
export const LABEL = { elnino: "El Niño", lanina: "La Niña", neutre: "Neutre" };
export const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

// Seuils NOAA : ONI >= 0,5 → El Niño, <= -0,5 → La Niña
export const phase = (v) => (v >= 0.5 ? "elnino" : v <= -0.5 ? "lanina" : "neutre");

export const monthLabel = (d) => `${d.year}-${String(d.month).padStart(2, "0")}`;

// Données de démo SYNTHÉTIQUES (pas des mesures réelles), utilisées si l'API est injoignable

export function heatColor(v) {
  const a = Math.min(Math.abs(v) / 2.5, 1) * 0.85;
  return v >= 0 ? `rgba(239,68,68,${a})` : `rgba(59,130,246,${a})`;
}


