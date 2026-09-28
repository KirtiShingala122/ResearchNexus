import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { LayoutDashboard, Users, Building, BookOpen, Quote } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/dashboard/summary")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch dashboard summary");
        return res.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading dashboard data...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (data?.error) return <div className="p-8 text-center text-slate-400">Empty dataset. Please run the collection script first.</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white flex items-center gap-2">
        <LayoutDashboard /> Dashboard Overview
      </h1>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Total Papers" value={data.total_papers} />
        <StatCard icon={Quote} label="Total Citations" value={data.total_citations} />
        <StatCard icon={Users} label="Unique Authors" value={data.unique_authors} />
        <StatCard icon={Building} label="Institutions" value={data.unique_institutions} />
      </div>
      
      <div className="text-sm text-slate-400">Publication Year Range: {data.year_range}</div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Publications per Year</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.publications_per_year}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="year" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155" }} />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Top 10 Contributing Authors</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.top_authors} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="author" type="category" stroke="#94a3b8" width={100} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155" }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4">Top 10 Most Cited Papers</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="p-3">Title</th>
                <th className="p-3">Year</th>
                <th className="p-3 text-right">Citations</th>
              </tr>
            </thead>
            <tbody>
              {data.top_papers.map((p, i) => (
                <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="p-3 text-sm text-white">{p.title}</td>
                  <td className="p-3 text-sm text-slate-300">{p.publication_year}</td>
                  <td className="p-3 text-sm text-blue-400 font-semibold text-right">{p.citation_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center gap-4">
      <div className="p-3 bg-slate-700/50 rounded-lg text-blue-400">
        <Icon size={24} />
      </div>
      <div>
        <div className="text-sm text-slate-400">{label}</div>
        <div className="text-2xl font-bold text-white">{value?.toLocaleString() || 0}</div>
      </div>
    </div>
  );
}
