import { useState, useEffect, useRef } from "react";
import { BarChart2, Network, FileText, Database, TrendingUp, Layers } from "lucide-react";
import { ForceGraph2D } from "react-force-graph-2d";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area, Legend
} from "recharts";

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState("methodology");
  
  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      <h1 className="text-3xl font-bold text-white flex items-center gap-2">
        <BarChart2 /> Research Analysis
      </h1>
      
      <div className="flex gap-2 border-b border-slate-700 pb-2 overflow-x-auto">
        <TabButton active={activeTab === "methodology"} onClick={() => setActiveTab("methodology")} icon={<BookOpen size={16}/>} label="Methodology" />
        <TabButton active={activeTab === "keywords"} onClick={() => setActiveTab("keywords")} icon={<Network size={16}/>} label="Keyword Network" />
        <TabButton active={activeTab === "coauthors"} onClick={() => setActiveTab("coauthors")} icon={<Network size={16}/>} label="Co-authorship" />
        <TabButton active={activeTab === "coupling"} onClick={() => setActiveTab("coupling")} icon={<Network size={16}/>} label="Bibliographic Coupling" />
        <div className="w-px bg-slate-700 mx-2" />
        <TabButton active={activeTab === "tfidf"} onClick={() => setActiveTab("tfidf")} icon={<Database size={16}/>} label="TF-IDF Terms" />
        <TabButton active={activeTab === "topics"} onClick={() => setActiveTab("topics")} icon={<Layers size={16}/>} label="Topic Modeling" />
        <TabButton active={activeTab === "topic_trends"} onClick={() => setActiveTab("topic_trends")} icon={<TrendingUp size={16}/>} label="Topic Trends" />
      </div>

      <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden relative overflow-y-auto">
        {activeTab === "methodology" && <MethodologySection />}
        {activeTab === "keywords" && <NetworkGraph endpoint="/api/analysis/keywords" color="#8b5cf6" />}
        {activeTab === "coauthors" && <NetworkGraph endpoint="/api/analysis/coauthors" color="#3b82f6" />}
        {activeTab === "coupling" && <NetworkGraph endpoint="/api/analysis/coupling" color="#10b981" />}
        {activeTab === "tfidf" && <TfidfSection />}
        {activeTab === "topics" && <TopicModelingSection />}
        {activeTab === "topic_trends" && <TopicTrendsSection />}
      </div>
    </div>
  );
}

function BookOpen({ size }) {
  return <FileText size={size} />;
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors
        ${active ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
    >
      {icon} {label}
    </button>
  );
}

function MethodologySection() {
  return (
    <div className="p-8 max-w-4xl space-y-6 text-slate-300">
      <h2 className="text-2xl font-bold text-white">NLP-Enhanced Analysis</h2>
      
      <p className="leading-relaxed">
        This platform contrasts two distinct approaches to bibliometric analysis:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
          <h3 className="text-xl font-semibold text-blue-400 mb-3 flex items-center gap-2">
            <Network size={20} /> Traditional Bibliometric Analysis
          </h3>
          <p className="text-sm mb-4">Relies on structured metadata provided by databases (like OpenAlex or Web of Science).</p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li><strong>Keywords:</strong> Co-occurrence networks based on author-provided or database-tagged keywords.</li>
            <li><strong>Citations:</strong> Pure count of how many times a paper is referenced.</li>
            <li><strong>Authors:</strong> Collaboration networks and productivity metrics.</li>
            <li><strong>References:</strong> Bibliographic coupling (papers sharing the same references).</li>
          </ul>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
          <h3 className="text-xl font-semibold text-purple-400 mb-3 flex items-center gap-2">
            <Database size={20} /> NLP Analysis
          </h3>
          <p className="text-sm mb-4">Relies on processing the unstructured natural language text of the paper abstracts.</p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li><strong>Abstract Text:</strong> Lowercased, tokenized, and lemmatized textual data.</li>
            <li><strong>TF-IDF:</strong> Term Frequency-Inverse Document Frequency to find universally important terms.</li>
            <li><strong>Topic Modeling (LDA):</strong> Latent Dirichlet Allocation to discover hidden semantic clusters without pre-defined tags.</li>
            <li><strong>Temporal Topic Evolution:</strong> Tracking how semantic topics rise and fall over time.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function TfidfSection() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/nlp/tfidf")
      .then(res => res.json())
      .then(d => {
        setData(d.terms || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400">Calculating TF-IDF scores...</div>;

  return (
    <div className="p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold text-white mb-4">Top 50 TF-IDF Terms</h2>
      <div className="flex-1 min-h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.slice(0, 20)} layout="vertical" margin={{ left: 100, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" stroke="#94a3b8" />
            <YAxis dataKey="term" type="category" stroke="#94a3b8" width={100} />
            <RechartsTooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155" }} />
            <Bar dataKey="score" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TopicModelingSection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);

  useEffect(() => {
    fetch("/api/nlp/topics?n_topics=8")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400">Running LDA Topic Modeling (this may take a moment)...</div>;
  if (!data?.topics) return <div className="p-8 text-center text-slate-400">Failed to load topics.</div>;

  return (
    <div className="p-6 h-full flex flex-col md:flex-row gap-6">
      <div className="flex-1">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center justify-between">
          <span>Discovered Topics (n={data.n_topics})</span>
          <span className="text-sm font-normal text-slate-400">Analyzed {data.total_analyzed} abstracts</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.topics.map((t) => (
            <div 
              key={t.id} 
              onClick={() => setSelectedTopic(t)}
              className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                selectedTopic?.id === t.id 
                ? "bg-blue-900/40 border-blue-500" 
                : "bg-slate-900/50 border-slate-700 hover:border-slate-500"
              }`}
            >
              <div className="text-lg font-semibold text-white mb-2">Topic {t.id}</div>
              <div className="text-sm text-slate-400 mb-3">{t.paper_count} papers</div>
              <div className="flex flex-wrap gap-1">
                {t.terms.slice(0, 5).map(term => (
                  <span key={term} className="px-2 py-1 bg-slate-800 rounded-md text-xs text-slate-300">{term}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full md:w-1/3 bg-slate-900/50 rounded-xl border border-slate-700 p-6 flex flex-col">
        {selectedTopic ? (
          <>
            <h3 className="text-lg font-bold text-white mb-2">Topic {selectedTopic.id} Details</h3>
            <p className="text-sm text-slate-400 mb-4">{selectedTopic.paper_count} papers have this as their dominant topic.</p>
            <strong className="text-slate-300 block mb-2">Top Representative Terms:</strong>
            <ul className="space-y-1 mb-4">
              {selectedTopic.terms.map((term, i) => (
                <li key={i} className="text-blue-300 bg-blue-900/20 px-3 py-1 rounded-md text-sm">{term}</li>
              ))}
            </ul>
          </>
        ) : (
          <div className="text-center text-slate-500 flex-1 flex items-center justify-center">
            Click a topic to view details.
          </div>
        )}
      </div>
    </div>
  );
}

function TopicTrendsSection() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    fetch("/api/nlp/topic-trends?n_topics=8")
      .then(res => res.json())
      .then(d => {
        setData(d.trends || []);
        if (d.trends && d.trends.length > 0) {
          const keys = Object.keys(d.trends[0]).filter(k => k !== "year");
          setTopics(keys);
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400">Calculating temporal distributions...</div>;

  // Generate some distinct colors
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef"];

  return (
    <div className="p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold text-white mb-4">Research Topic Evolution (% of papers per year)</h2>
      <div className="flex-1 min-h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="year" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <RechartsTooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155" }} />
            <Legend />
            {topics.map((t, i) => (
              <Area key={t} type="monotone" dataKey={t} stackId="1" stroke={colors[i%colors.length]} fill={colors[i%colors.length]} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function NetworkGraph({ endpoint, color }) {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    setLoading(true);
    fetch(endpoint)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [endpoint]);

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      });
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [loading]);

  if (loading) return <div className="p-8 text-center text-slate-400 h-full flex items-center justify-center">Analyzing data and building network...</div>;
  if (!data.nodes || data.nodes.length === 0) return <div className="p-8 text-center text-slate-400 h-full flex items-center justify-center">No sufficient data to build this network.</div>;

  return (
    <div ref={containerRef} className="w-full h-full">
      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
        nodeLabel="name"
        nodeColor={() => color}
        nodeVal={(node) => Math.sqrt(node.val || 1) * 3}
        linkColor={() => "#334155"}
        linkWidth={(link) => Math.min(Math.sqrt(link.weight || 1), 5)}
        backgroundColor="#1e293b"
      />
    </div>
  );
}
