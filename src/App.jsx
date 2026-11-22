import { useState, useMemo, useEffect } from "react";
import { useEnsoData } from "./hooks/useEnsoData.js";

import Navbar from "./components/Navbar.jsx";
import RangeFilter from "./components/RangeFilter.jsx";
import StatsRow from "./components/StatsRow.jsx";
import EvolutionChart from "./components/EvolutionChart.jsx";
import AnnualChart from "./components/AnnualChart.jsx";
import PhasePie from "./components/PhasePie.jsx";
import Heatmap from "./components/Heatmap.jsx";
import DataTable from "./components/DataTable.jsx";
import { phase, monthLabel } from "./lib/enso.js";

const TABS = [
  ["evolution", "Évolution"],
  ["annual", "Moyenne annuelle"],
  ["repartition", "Répartition"],
  ["heatmap", "Heatmap"],
  ["data", "Données"],
];

function App() {

  const { all, loading } = useEnsoData();
  const [tab, setTab] = useState("evolution");
  const [theme, setTheme] = useState("light");
  const [from, setFrom] = useState(1990);
  const [to, setTo] = useState(2025);

  const minY = all.length ? all[0].year : 1950;
  const maxY = all.length ? all[all.length - 1].year : 2026;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (all.length) {
      setFrom(Math.max(minY, maxY - 35));
      setTo(maxY);
    }
  }, [all.length, minY, maxY]);

  const rows = useMemo(() => all.filter((d) => d.year >= from && d.year <= to), [all, from, to]);

  const counts = useMemo(() => {
    const c = { elnino: 0, lanina: 0, neutre: 0 };
    rows.forEach((d) => c[phase(d.oni)]++);
    return c;
  }, [rows]);



  return (
    <>
      <Navbar theme={"dark"} onTheme={setTheme} />
      <RangeFilter min={minY} max={maxY} from={from} to={to} onFrom={setFrom} onTo={setTo} />
      <StatsRow rows={rows} counts={counts} />


      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <div role="tablist" className="tabs tabs-box w-fit">
            {TABS.map(([id, text]) => (
              <button
                key={id}
                role="tab"
                className={`tab ${tab === id ? "tab-active" : ""}`}
                onClick={() => setTab(id)}
              >
                {text}
              </button>
            ))}
          </div>

          {tab === "evolution" && <EvolutionChart rows={rows} />}
          {tab === "annual" && <AnnualChart rows={rows} />}
          {tab === "repartition" && <PhasePie counts={counts} total={rows.length} />}
          {tab === "heatmap" && <Heatmap rows={rows} />}
          {tab === "data" && <DataTable rows={rows} />}
        </div>
      </div>
    </>
  )
}

export default App
