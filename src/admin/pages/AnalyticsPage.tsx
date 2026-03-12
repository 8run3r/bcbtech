import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
  { name: "Direct", value: 40, color: "#00FF94" },
  { name: "Google", value: 35, color: "#60a5fa" },
  { name: "Social", value: 15, color: "#f59e0b" },
  { name: "Iné", value: 10, color: "#a78bfa" },
];

const pagesData = [
  { page: "/", visits: 312 },
  { page: "/riesenia", visits: 198 },
  { page: "/balicky", visits: 143 },
  { page: "/kontakt", visits: 97 },
  { page: "/portfolio", visits: 74 },
];

const cardStyle = { background: "#141414" };

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl border border-white/10 px-3 py-2" style={{ background: "#1a1a1a" }}>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-sm font-semibold text-white">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export const AnalyticsPage = () => {
  return (
    <div className="max-w-5xl space-y-6">
      {/* Info banner */}
      <div className="rounded-xl border border-amber-800/50 bg-amber-950/30 px-4 py-3 flex items-start gap-3">
        <span className="text-lg">📊</span>
        <p className="text-xs text-amber-200/80 leading-relaxed">
          Analytické dáta sú momentálne ukážkové. Pre reálne dáta prepoj Vercel Analytics alebo Google Analytics.
        </p>
      </div>

      {/* Device stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Desktop", value: "58%", icon: "🖥️" },
          { label: "Mobile", value: "38%", icon: "📱" },
          { label: "Tablet", value: "4%", icon: "📟" },
        ].map((d) => (
          <div key={d.label} className="rounded-xl border border-white/5 p-4 text-center" style={cardStyle}>
            <p className="text-2xl mb-1">{d.icon}</p>
            <p className="text-xl font-bold text-white">{d.value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{d.label}</p>
          </div>
        ))}
      </div>

      {/* Visitors chart */}
      <div className="rounded-xl border border-white/5 p-6" style={cardStyle}>
        <h2 className="text-white font-semibold mb-5">Návštevnosť (posledných 7 dní)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={visitorsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="visitors" stroke="#00FF94" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top pages */}
        <div className="rounded-xl border border-white/5 p-6" style={cardStyle}>
          <h2 className="text-white font-semibold mb-5">Najpopulárnejšie stránky</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={pagesData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="page" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="visits" fill="#00FF94" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sources */}
        <div className="rounded-xl border border-white/5 p-6" style={cardStyle}>
          <h2 className="text-white font-semibold mb-5">Zdroje návštev</h2>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={sourcesData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                  {sourcesData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {sourcesData.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="text-xs text-zinc-400">{s.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-white">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
