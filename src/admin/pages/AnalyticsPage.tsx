import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { W98, raised, sunken, Win98Panel } from "../win98";

const visitorsData = [
  { day: "Po", visitors: 84 },
  { day: "Ut", visitors: 132 },
  { day: "St", visitors: 97 },
  { day: "Št", visitors: 178 },
  { day: "Pi", visitors: 156 },
  { day: "So", visitors: 62 },
  { day: "Ne", visitors: 48 },
];

const sourcesData = [
  { name: "Direct", value: 40, color: "#000080" },
  { name: "Google", value: 35, color: "#008000" },
  { name: "Social", value: 15, color: "#800080" },
  { name: "Iné", value: 10, color: "#808080" },
];

const pagesData = [
  { page: "/", visits: 312 },
  { page: "/riesenia", visits: 198 },
  { page: "/balicky", visits: 143 },
  { page: "/kontakt", visits: 97 },
  { page: "/portfolio", visits: 74 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ boxShadow: raised, background: W98.bg, padding: "4px 8px", fontFamily: W98.font, fontSize: "11px" }}>
        <div style={{ fontWeight: 700 }}>{label}</div>
        <div>{payload[0].value}</div>
      </div>
    );
  }
  return null;
};

export const AnalyticsPage = () => {
  return (
    <div style={{ fontFamily: W98.font, fontSize: "12px", color: W98.black }}>
      {/* Header */}
      <div style={{ boxShadow: raised, background: W98.bg, padding: "8px 12px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "20px" }}>📊</span>
        <span style={{ fontWeight: 700 }}>Analytika — Štatistiky návštevnosti</span>
      </div>

      {/* Info banner */}
      <div style={{
        boxShadow: sunken, background: "#fffff0", padding: "6px 10px", marginBottom: 12,
        display: "flex", alignItems: "center", gap: 8, fontSize: "11px",
      }}>
        <span style={{ fontSize: "16px" }}>ℹ️</span>
        <span>Analytické dáta sú ukážkové. Pre reálne dáta prepoj Vercel Analytics.</span>
      </div>

      {/* Device stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
        {[
          { label: "Desktop", value: "58%", icon: "🖥️" },
          { label: "Mobile", value: "38%", icon: "📱" },
          { label: "Tablet", value: "4%", icon: "📟" },
        ].map((d) => (
          <div key={d.label} style={{ boxShadow: raised, background: W98.bg, padding: 12, textAlign: "center" }}>
            <div style={{ fontSize: "20px", marginBottom: 4 }}>{d.icon}</div>
            <div style={{ fontSize: "18px", fontWeight: 700 }}>{d.value}</div>
            <div style={{ fontSize: "11px", color: W98.grayText }}>{d.label}</div>
          </div>
        ))}
      </div>

      {/* Visitors chart */}
      <Win98Panel label="Návštevnosť (posledných 7 dní)" style={{ marginBottom: 12 }}>
        <div style={{ boxShadow: sunken, background: W98.fieldBg, padding: 8 }}>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={visitorsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="day" tick={{ fill: "#000", fontSize: 11, fontFamily: W98.font }} axisLine={{ stroke: "#808080" }} tickLine={false} />
              <YAxis tick={{ fill: "#000", fontSize: 11, fontFamily: W98.font }} axisLine={{ stroke: "#808080" }} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="visitors" stroke="#000080" strokeWidth={2} dot={{ fill: "#000080", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Win98Panel>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {/* Top pages */}
        <Win98Panel label="Najpopulárnejšie stránky">
          <div style={{ boxShadow: sunken, background: W98.fieldBg, padding: 8 }}>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={pagesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#000", fontSize: 10, fontFamily: W98.font }} axisLine={{ stroke: "#808080" }} tickLine={false} />
                <YAxis type="category" dataKey="page" tick={{ fill: "#000", fontSize: 10, fontFamily: W98.font }} axisLine={{ stroke: "#808080" }} tickLine={false} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="visits" fill="#000080" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Win98Panel>

        {/* Sources */}
        <Win98Panel label="Zdroje návštev">
          <div style={{ boxShadow: sunken, background: W98.fieldBg, padding: 8, display: "flex", alignItems: "center", gap: 16 }}>
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={sourcesData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
                  {sourcesData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {sourcesData.map((s) => (
                <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 10, height: 10, background: s.color }} />
                    <span style={{ fontSize: "11px" }}>{s.name}</span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: "11px" }}>{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Win98Panel>
      </div>
    </div>
  );
};
