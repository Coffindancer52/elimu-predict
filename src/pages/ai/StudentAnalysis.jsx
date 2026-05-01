import { useState } from "react";
import { AlertTriangle, Lightbulb, Loader2, TrendingUp, TrendingDown, Minus, Calendar, BookOpen } from "lucide-react";
import api from "@/lib/api";
import RiskGauge from "./RiskGauge";
import PerformanceLineChart from "./PerformanceLineChart";
import RiskDistributionPieChart from "./RiskDistributionPieChart";

const riskClass = { HIGH: "danger", MEDIUM: "warning", LOW: "success" };

const StudentAnalysisPage = () => {
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [term, setTerm] = useState("TERM_1");
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());
  const [analysisResults, setAnalysisResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);

  const fetchAnalysis = async (e) => {
    e.preventDefault();
    
    if (!admissionNumber.trim()) {
      setError("Please enter admission number");
      return;
    }
    
    setLoading(true);
    setError("");
    setAnalysisResults([]);
    setSelectedSubject(null);
    
    try {
      const resp = await api.post(
        `/ai/analyze/student/${admissionNumber}?term=${term}&academicYear=${parseInt(academicYear)}`
      );
      
      setAnalysisResults(Array.isArray(resp) ? resp : []);
      
      if (Array.isArray(resp) && resp.length === 0) {
        setError("No analysis data found for this student");
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      setError(error.response?.data?.message || error.message || "Failed to analyze student performance");
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from analysis results
  const stats = {
    totalSubjects: analysisResults.length,
    highRisk: analysisResults.filter(r => r.riskLevel === "HIGH").length,
    mediumRisk: analysisResults.filter(r => r.riskLevel === "MEDIUM").length,
    lowRisk: analysisResults.filter(r => r.riskLevel === "LOW").length,
    avgRisk: analysisResults.reduce((sum, r) => sum + (r.riskPercentage || 0), 0) / (analysisResults.length || 1),
    improvingCount: analysisResults.filter(r => r.trend > 0).length,
    decliningCount: analysisResults.filter(r => r.trend < 0).length,
  };

  // Prepare chart data
  const riskChartData = analysisResults.map(r => ({
    subject: r.subjectName,
    riskPercentage: r.riskPercentage,
    riskLevel: r.riskLevel,
    trend: r.trend
  }));

  const performanceData = analysisResults.map(r => ({
    label: r.subjectName,
    classAverage: r.riskPercentage,
    value: r.riskPercentage
  }));

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="flex items-center gap-2">
          <AlertTriangle className="text-primary" /> Student AI Analysis
        </h1>
        <p className="subtitle">AI-powered risk predictions and personalized learning recommendations</p>
      </div>
      
      {/* Search Form */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="card-title">Analyze Student Performance</h2>
        </div>
        <div className="card-content">
          <form onSubmit={fetchAnalysis}>
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
                <label className="label">Term *</label>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="select"
                  disabled={loading}
                  required
                >
                  <option value="TERM_1">Term 1</option>
                  <option value="TERM_2">Term 2</option>
                  <option value="TERM_3">Term 3</option>
                </select>
              </div>
              <div className="field">
                <label className="label">Academic Year *</label>
                <input
                  type="number"
                  placeholder="e.g., 2024"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="input"
                  disabled={loading}
                  required
                />
              </div>
              <div className="field flex items-end">
                <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                  {loading ? <><Loader2 className="animate-spin" /> Analyzing...</> : "Analyze Student"}
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
      
      {/* Results Section */}
      {analysisResults.length > 0 && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-4 gap-4 mb-6">
            <div className="card text-center">
              <BookOpen className="mx-auto mb-2 text-primary" size={24} />
              <p className="text-2xl font-bold">{stats.totalSubjects}</p>
              <p className="text-xs muted-text">Subjects Analyzed</p>
            </div>
            <div className="card text-center">
              <RiskGauge value={stats.avgRisk} size="small" showLabel={false} />
              <p className="text-xs muted-text mt-1">Average Risk Score</p>
            </div>
            <div className="card text-center">
              <TrendingUp className={`mx-auto mb-2 ${stats.improvingCount > stats.decliningCount ? 'text-success' : 'text-warning'}`} size={24} />
              <p className="text-2xl font-bold">{stats.improvingCount}</p>
              <p className="text-xs muted-text">Improving Subjects</p>
            </div>
            <div className="card text-center">
              <RiskDistributionPieChart 
                high={stats.highRisk} 
                medium={stats.mediumRisk} 
                low={stats.lowRisk} 
                size={80}
              />
              <p className="text-xs muted-text mt-1">Risk Distribution</p>
            </div>
          </div>

          {/* Risk Distribution Bar Chart */}
          <div className="card mb-6">
            <div className="card-header">
              <h2 className="card-title">Subject-wise Risk Analysis</h2>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                {riskChartData.map((subject, idx) => (
                  <div key={idx} className="subject-risk-item">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{subject.subject}</span>
                      <div className="flex items-center gap-2">
                        {subject.trend > 0 && <TrendingUp size={14} className="text-danger" />}
                        {subject.trend < 0 && <TrendingDown size={14} className="text-success" />}
                        {subject.trend === 0 && <Minus size={14} className="text-muted" />}
                        <span className={`badge ${riskClass[subject.riskLevel]}`}>
                          {subject.riskLevel}
                        </span>
                      </div>
                    </div>
                    <div className="bar-group">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Risk Score</span>
                        <span className="font-bold">{subject.riskPercentage}%</span>
                      </div>
                      <div className="bar" onClick={() => setSelectedSubject(subject)}>
                        <div 
                          className={`bar-fill ${subject.riskLevel === "HIGH" ? "danger" : subject.riskLevel === "MEDIUM" ? "warning" : "success"} cursor-pointer`}
                          style={{ width: `${subject.riskPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Comparison Chart */}
          <div className="card mb-6">
            <div className="card-header">
              <h2 className="card-title">Risk Comparison by Subject</h2>
            </div>
            <div className="card-content">
              <PerformanceLineChart data={performanceData} height={300} showLegend />
            </div>
          </div>

          {/* Detailed Recommendations */}
          <div className="grid grid-2 gap-6">
            {analysisResults.map((analysis, index) => (
              <div key={index} className={`card ${analysis.riskLevel === "HIGH" ? "danger-tint" : analysis.riskLevel === "MEDIUM" ? "warning-tint" : "success-tint"}`}>
                <div className="card-header">
                  <div className="flex justify-between items-center">
                    <h3 className="card-title">{analysis.subjectName}</h3>
                    <span className={`badge ${riskClass[analysis.riskLevel]}`}>
                      {analysis.riskLevel} Risk
                    </span>
                  </div>
                </div>
                <div className="card-content">
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="muted-text">Risk Score</span>
                      <span className="font-bold">{analysis.riskPercentage}%</span>
                    </div>
                    <div className="bar">
                      <div 
                        className={`bar-fill ${analysis.riskLevel === "HIGH" ? "danger" : analysis.riskLevel === "MEDIUM" ? "warning" : "success"}`}
                        style={{ width: `${analysis.riskPercentage}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3 text-sm">
                    <Calendar size={14} className="muted-text" />
                    <span className="muted-text">{analysis.term} • {analysis.academicYear}</span>
                    {analysis.trend > 0 && <span className="text-danger">↑ Risk increased by {analysis.trend}%</span>}
                    {analysis.trend < 0 && <span className="text-success">↓ Risk decreased by {Math.abs(analysis.trend)}%</span>}
                    {analysis.trend === 0 && <span className="muted-text">→ Risk stable</span>}
                  </div>
                  
                  <div className="ai-suggestion bg-white/50 dark:bg-gray-900/50 rounded-lg p-3 mt-2">
                    <div className="heading flex items-center gap-2 mb-2">
                      <Lightbulb size={16} className="text-warning" />
                      <span className="font-bold">AI Recommendation</span>
                    </div>
                    <p className="text-sm">{analysis.suggestion || "No specific recommendations available"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* Selected Subject Modal */}
      {selectedSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedSubject(null)}>
          <div className="card max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <h3 className="card-title">{selectedSubject.subject}</h3>
              <button className="btn btn-sm btn-outline" onClick={() => setSelectedSubject(null)}>Close</button>
            </div>
            <div className="card-content">
              <RiskGauge value={selectedSubject.riskPercentage} size="large" />
              <div className="mt-4 text-center">
                <p className="text-sm muted-text">Risk Level: {selectedSubject.riskLevel}</p>
                <p className="text-sm muted-text">Trend: {selectedSubject.trend > 0 ? "Increasing" : selectedSubject.trend < 0 ? "Decreasing" : "Stable"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAnalysisPage;