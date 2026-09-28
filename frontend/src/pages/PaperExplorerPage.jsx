import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, FileText } from "lucide-react";

export default function PaperExplorerPage() {
  const [data, setData] = useState({ papers: [], total: 0, page: 1, total_pages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedPaper, setSelectedPaper] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (search) params.append("search", search);

    fetch(`/api/papers?${params.toString()}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      <h1 className="text-3xl font-bold text-white flex items-center gap-2">
        <FileText /> Paper Explorer
      </h1>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Search by title..."
          className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Search size={18} /> Search
        </button>
      </form>

      <div className="flex-1 overflow-auto bg-slate-800 rounded-xl border border-slate-700">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-900 shadow-md">
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="p-4 w-2/3">Title</th>
              <th className="p-4">Year</th>
              <th className="p-4 text-right">Citations</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3" className="p-8 text-center text-slate-400">Loading papers...</td></tr>
            ) : data.papers.length === 0 ? (
              <tr><td colSpan="3" className="p-8 text-center text-slate-400">No papers found.</td></tr>
            ) : (
              data.papers.map((p) => (
                <tr 
                  key={p.id} 
                  onClick={() => setSelectedPaper(p)}
                  className="border-b border-slate-700/50 hover:bg-slate-700 cursor-pointer"
                >
                  <td className="p-4 text-sm text-white font-medium">{p.title}</td>
                  <td className="p-4 text-sm text-slate-300">{p.publication_year}</td>
                  <td className="p-4 text-sm text-blue-400 font-semibold text-right">{p.citation_count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-slate-400 text-sm">
        <div>Showing page {data.page} of {data.total_pages} ({data.total} total papers)</div>
        <div className="flex gap-2">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(page - 1)}
            className="p-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-50"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            disabled={page === data.total_pages || data.total_pages === 0} 
            onClick={() => setPage(page + 1)}
            className="p-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Modal */}
      {selectedPaper && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-2">{selectedPaper.title}</h2>
            <div className="flex gap-4 text-sm text-slate-400 mb-4">
              <span>{selectedPaper.publication_year}</span>
              <span>Citations: {selectedPaper.citation_count}</span>
              {selectedPaper.doi && (
                <a href={selectedPaper.doi} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                  DOI Link
                </a>
              )}
            </div>
            <div className="mb-4">
              <strong className="text-slate-300 block mb-1">Authors:</strong>
              <div className="text-slate-400 text-sm">
                {(selectedPaper.authors || "").split("|").join(", ")}
              </div>
            </div>
            <div className="mb-4">
              <strong className="text-slate-300 block mb-1">Abstract:</strong>
              <p className="text-slate-400 text-sm leading-relaxed">{selectedPaper.abstract || "No abstract available."}</p>
            </div>
            <div className="mb-4">
              <strong className="text-slate-300 block mb-1">Keywords:</strong>
              <div className="flex flex-wrap gap-2">
                {(selectedPaper.keywords || "").split("|").slice(0, 10).map((kw, i) => kw && (
                  <span key={i} className="px-2 py-1 bg-slate-700 text-xs rounded-full text-slate-300">{kw}</span>
                ))}
              </div>
            </div>
            {(selectedPaper.dominant_topic_8 !== undefined && selectedPaper.dominant_topic_8 !== -1) && (
              <div className="mb-4 p-3 bg-blue-900/20 border border-blue-800/50 rounded-lg">
                <strong className="text-blue-300 block mb-1">NLP Analysis:</strong>
                <div className="text-sm text-slate-300">
                  <span className="font-semibold text-blue-200">Dominant Topic:</span> {selectedPaper.dominant_topic_8} 
                  <span className="mx-2">|</span>
                  <span className="font-semibold text-blue-200">Probability:</span> {(selectedPaper.topic_prob_8 * 100).toFixed(1)}%
                </div>
              </div>
            )}
            <button 
              onClick={() => setSelectedPaper(null)}
              className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
