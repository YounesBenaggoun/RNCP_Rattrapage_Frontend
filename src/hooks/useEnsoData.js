import { useEffect, useMemo, useState } from "react";
import { API_URL } from "../lib/enso.js";

// Récupération des données ONI
async function getAllONI() {
  try {
    const response = await fetch("http://127.0.0.1:3000/oni/all");

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Erreur API :", error);
    return [];
  }
}

export function useEnsoData() {
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllONI()
      .then((data) => {
        setRaw(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const all = useMemo(
    () =>
      raw.map((d) => ({
        year: +d.year,
        month: +d.month,
        oni: +d.oni,
      })),
    [raw]
  );

  return {
    all,
    loading
  };
}