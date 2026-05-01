import { useState, useEffect } from "react";
import { Calendar, TrendingUp, TrendingDown, Minus, Search, Filter, Download } from "lucide-react";
import api from "@/lib/api";
import PerformanceLineChart from "./PerformanceLineChart";
import RiskGauge from "./RiskGauge";

const riskClass = { HIGH: "danger", MEDIUM: "warning", LOW: "success" };

const StudentResultsHistoryPage = () => {
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [term, setTerm] = useState("TERM_1");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allHistory, setAllHistory] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Fetch single term results
  const fetchTermResults = async (e) => {
    e?.preventDefault();
    
    if (!admissionNumber.trim()) {
      setError("Please enter admission number");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const resp = await api.get(
        `/ai/results/student/${admissionNumber}?term=${term}`
      );
      setResults(Array.isArray(resp) ? resp : []);
      
      if (Array.isArray(resp) && resp.length === 0) {
        setError("No results found for this student in the selected term");
      }
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all historical results
  const fetchAllHistory = async () => {
    if (!admissionNumber.trim()) return;
    
    setLoading(true);
    setError("");
    
    try {
      const resp = await api.get(`/ai/results/student/${admissionNumber}/all`);
      setAllHistory(Array.isArray(resp) ? resp : null);
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admissionNumber) {
      fetchAllHistory();
    }
  }, [admissionNumber]);

  // Process historical data for charts
  const processHistoryData = () => {
    if (!allHistory) return [];
    
    const byTerm = {};
    allHistory.forEach(record => {
      const key = `${record.term}_${record.academicYear}`;
      if (!byTerm[key]) {
        byTerm[key] = { term: record.term, year: record.academicYear, subjects: [] };
      }
      byTerm[key].subjects.push(record);
    });
    
    return Object.values(byTerm).map(termData => ({
      label: `${termData.term.replace('TERM_', 'Term ')} ${termData.year}`,
      classAverage: termData.subjects.reduce((sum, s) => sum + s.riskPercentage, 0) / termData.subjects.length,
      value: termData.subjects.reduce((sum, s) => sum + s.riskPercentage, 0) / termData.subjects.length
    }));
  };

  const chartData = processHistoryData();

  // Calculate trends
  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp size={14} className="text-danger" />;
    if (trend < 0) return <TrendingDown size={14} className="text-success" />;
    return <Minus size={14} className="text-muted" />;
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Student Results History</h1>
        <p className="subtitle">Track performance trends and historical AI analysis results</p>
      </div>

      {/* Search Form */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="card-title flex items-center gap-2">
            <Search size={18} /> Search Student Records
          </h2>
        </div>
        <div className="card-content">
          <form onSubmit={fetchTermResults}>
            <div className="grid grid-2 gap-4">
              <div className="field">
                <label className="label">Admission Number *</label>
                <input
                  type="text"
                  placeholder="e.g., ADM2024001"
                  value={admissionNumber}
                  onChange={(e) => setAdmissionNumber(e.target.value.toUpperCase())}
                  className="input"
                  disabled={loading}
                  required
                />
              </div>
              <div className="field">
                <label className="label">Term</label>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="select"
                  disabled={loading}
                >
                  <option value="TERM_1">Term 1</option>
                  <option value="TERM_2">Term 2</option>
                  <option value="TERM_3">Term 3</option>
                </select>
              </div>
              <div className="field flex items-end">
                <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                  {loading ? "Loading..." : "View Term Results"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {error && (
        <div className="alert danger mb-4" role="alert">
          {error}
        </div>
      )}

      {/* Historical Trend Chart */}
      {chartData.length > 0 && (
        <div className="card mb-6">
          <div className="card-header">
            <h2 className="card-title flex items-center gap-2">
              <TrendingUp size={18} /> Historical Risk Trend
            </h2>
            <p className="text-xs muted-text">Average risk score progression across terms</p>
          </div>
          <div className="card-content">
            <PerformanceLineChart data={chartData} height={300} showLegend={false} />
          </div>
        </div>
      )}

      {/* Current Term Results */}
      {results.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold">Results for {term.replace('TERM_', 'Term ')}</h2>
            <button className="btn btn-outline btn-sm">
              <Download size={14} /> Export Report
            </button>
          </div>
          
          <div className="grid grid-2 gap-4">
            {results.map((result, idx) => (
              <div key={idx} className="card">
                <div className="card-header">
                  <div className="flex justify-between items-center">
                    <h3 className="card-title">{result.subjectName}</h3>
                    <span className={`badge ${riskClass[result.riskLevel]}`}>
                      {result.riskLevel}
                    </span>
                  </div>
                </div>
                <div className="card-content">
                  <div className="flex items-center justify-between mb-3">
                    <RiskGauge value={result.riskPercentage} size="small" />
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {getTrendIcon(result.trend)}
                        <span className={`text-sm ${
                          result.trend > 0 ? 'text-danger' : result.trend < 0 ? 'text-success' : 'text-muted'
                        }`}>
                          {result.trend > 0 ? `+${result.trend}%` : result.trend < 0 ? `${result.trend}%` : 'Stable'}
                        </span>
                      </div>
                      <p className="text-xs muted-text mt-1">
                        {result.trend > 0 ? 'Risk increased' : result.trend < 0 ? 'Risk decreased' : 'No change'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <Calendar size={12} />
                    <span>{result.term} • {result.academicYear}</span>
                  </div>
                  
                  <div className="bg-primary/5 p-3 rounded-lg">
                    <p className="text-xs font-bold mb-1">Analysis Status: {result.analysisStatus}</p>
                    <p className="text-xs">{result.suggestion?.substring(0, 120)}...</p>
                    <button 
                      className="btn btn-link btn-sm mt-2 p-0"
                      onClick={() => setSelectedSubject(result)}
                    >
                      View Full Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* All Historical Records Summary */}
      {allHistory && allHistory.length > 0 && (
        <div className="card mt-6">
          <div className="card-header">
            <h2 className="card-title flex items-center gap-2">
              <Filter size={18} /> Complete Analysis History
            </h2>
            <p className="text-xs muted-text">All recorded AI analyses for this student</p>
          </div>
          <div className="card-content flush">
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Term</th>
                    <th>Year</th>
                    <th>Risk Score</th>
                    <th>Risk Level</th>
                    <th>Trend</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allHistory.map((record, i) => (
                    <tr key={i} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setSelectedSubject(record)}>
                      <td className="font-medium">{record.subjectName}</td>
                      <td>{record.term?.replace('TERM_', 'Term ')}</td>
                      <td>{record.academicYear}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="bar w-16">
                            <div className={`bar-fill ${record.riskPercentage > 70 ? 'danger' : record.riskPercentage > 40 ? 'warning' : 'success'}`} 
                                 style={{ width: `${record.riskPercentage}%` }} />
                          </div>
                          <span className="text-xs">{record.riskPercentage}%</span>
                        </div>
                      </td>
                      <td><span className={`badge ${riskClass[record.riskLevel]}`}>{record.riskLevel}</span></td>
                      <td>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(record.trend)}
                          <span className="text-xs">{Math.abs(record.trend)}%</span>
                        </div>
                      </td>
                      <td><span className="badge outline">{record.analysisStatus}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedSubject(null)}>
          <div className="card max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="card-header sticky top-0 bg-white dark:bg-gray-900">
              <div className="flex justify-between items-center">
                <h3 className="card-title">{selectedSubject.subjectName}</h3>
                <button className="btn btn-sm btn-outline" onClick={() => setSelectedSubject(null)}>Close</button>
              </div>
            </div>
            <div className="card-content">
              <div className="text-center mb-4">
                <RiskGauge value={selectedSubject.riskPercentage} size="large" />
                <div className="flex justify-center gap-4 mt-2">
                  <span className={`badge ${riskClass[selectedSubject.riskLevel]}`}>
                    {selectedSubject.riskLevel} Risk
                  </span>
                  <span className="badge outline">{selectedSubject.analysisStatus}</span>
                </div>
              </div>
              
              <div className="grid grid-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-xs muted-text">Student</p>
                  <p className="font-mono text-sm">{selectedSubject.admissionNumber}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-xs muted-text">Period</p>
                  <p className="text-sm">{selectedSubject.term} • {selectedSubject.academicYear}</p>
                </div>
              </div>
              
              <div className="bg-primary/5 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <TrendingUp size={16} className="mt-0.5" />
                  <div>
                    <p className="font-bold mb-1">Trend Analysis</p>
                    <p className="text-sm">
                      {selectedSubject.trend > 0 
                        ? `Risk score increased by ${selectedSubject.trend}% compared to previous assessment. Immediate intervention recommended.`
                        : selectedSubject.trend < 0
                        ? `Risk score decreased by ${Math.abs(selectedSubject.trend)}%. Good progress being made.`
                        : `Risk score stable. Continue current support strategies.`
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-warning/10 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="text-warning mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <div>
                    <p className="font-bold mb-1">AI Recommendations</p>
                    <p className="text-sm">{selectedSubject.suggestion || "No specific recommendations available"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentResultsHistoryPage;