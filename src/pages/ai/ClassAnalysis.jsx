import { useState } from "react";
import { AlertTriangle, Lightbulb, Loader2, TrendingUp, TrendingDown, Users, BookOpen, Award, BarChart3 } from "lucide-react";
import api from "@/lib/api";
import RiskGauge from "@/components/charts/RiskGauge";
import ClassComparisonBarChart from "@/components/charts/ClassComparisonBarChart";
import RiskDistributionPieChart from "@/components/charts/RiskDistributionPieChart";

const riskClass = { HIGH: "danger", MEDIUM: "warning", LOW: "success" };

const ClassAnalysisPage = () => {
  const [className, setClassName] = useState("");
  const [term, setTerm] = useState("TERM_1");
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());
  const [classAnalysis, setClassAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);

  const fetchAnalysis = async (e) => {
    e.preventDefault();
    
    if (!className.trim()) {
      setError("Please enter class name");
      return;
    }
    
    setLoading(true);
    setError("");
    setClassAnalysis(null);
    
    try {
      const resp = await api.post(
        `/ai/analyze/class/${className}?term=${term}&academicYear=${parseInt(academicYear)}`
      );
      
      setClassAnalysis(resp);
      
      if (!resp || Object.keys(resp).length === 0) {
        setError("No analysis data found for this class");
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      setError(error.response?.data?.message || error.message || "Failed to analyze class performance");
    } finally {
      setLoading(false);
    }
  };

  // Process class analysis data
  const processAnalysisData = () => {
    if (!classAnalysis) {
        alert("null") 
    return null;
    }
        
    
    const subjects = Object.keys(classAnalysis);
    const allAnalyses = subjects.flatMap(subject => classAnalysis[subject]);
    
    const stats = {
      totalSubjects: subjects.length,
      totalStudents: new Set(allAnalyses.map(a => a.admissionNumber)).size,
      highRiskSubjects: subjects.filter(s => 
        classAnalysis[s].some(a => a.riskLevel === "HIGH")
      ).length,
      avgRisk: allAnalyses.reduce((sum, a) => sum + (a.riskPercentage || 0), 0) / (allAnalyses.length || 1),
    };
    
    // Subject risk summary
    const subjectRiskSummary = subjects.map(subject => ({
      name: subject,
      avgRisk: classAnalysis[subject].reduce((sum, a) => sum + a.riskPercentage, 0) / classAnalysis[subject].length,
      highRiskCount: classAnalysis[subject].filter(a => a.riskLevel === "HIGH").length,
      mediumRiskCount: classAnalysis[subject].filter(a => a.riskLevel === "MEDIUM").length,
      lowRiskCount: classAnalysis[subject].filter(a => a.riskLevel === "LOW").length,
      suggestions: classAnalysis[subject][0]?.suggestion || ""
    }));
    
    return { stats, subjectRiskSummary, allAnalyses };
  };
  
  const data = processAnalysisData();
  
  // Prepare chart data
  const chartData = data?.subjectRiskSummary.map(s => ({
    className: s.name,
    meanAverage: s.avgRisk,
    highRiskCount: s.highRiskCount
  })) || [];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="flex items-center gap-2">
          <Users className="text-primary" /> Class AI Analysis
        </h1>
        <p className="subtitle">Comprehensive AI-powered analysis of entire class performance</p>
      </div>
      
      {/* Search Form */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="card-title">Analyze Class Performance</h2>
        </div>
        <div className="card-content">
          <form onSubmit={fetchAnalysis}>
            <div className="grid grid-2 gap-4">
              <div className="field">
                <label className="label">Class Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Form 3A, Form 1B"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
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
                  {loading ? <><Loader2 className="animate-spin" /> Analyzing Class...</> : "Analyze Class"}
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
      {data && classAnalysis && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-4 gap-4 mb-6">
            <div className="card text-center">
              <Users className="mx-auto mb-2 text-primary" size={24} />
              <p className="text-2xl font-bold">{data.stats.totalStudents}</p>
              <p className="text-xs muted-text">Total Students</p>
            </div>
            <div className="card text-center">
              <BookOpen className="mx-auto mb-2 text-primary" size={24} />
              <p className="text-2xl font-bold">{data.stats.totalSubjects}</p>
              <p className="text-xs muted-text">Subjects</p>
            </div>
            <div className="card text-center">
              <RiskGauge value={data.stats.avgRisk} size="small" showLabel={false} />
              <p className="text-xs muted-text mt-1">Avg Risk Score</p>
            </div>
            <div className="card text-center">
              <AlertTriangle className="mx-auto mb-2 text-danger" size={24} />
              <p className="text-2xl font-bold text-danger">{data.stats.highRiskSubjects}</p>
              <p className="text-xs muted-text">High-Risk Subjects</p>
            </div>
          </div>

          {/* Subject Comparison Bar Chart */}
          <div className="card mb-6">
            <div className="card-header">
              <h2 className="card-title flex items-center gap-2">
                <BarChart3 size={18} /> Subject Risk Comparison
              </h2>
            </div>
            <div className="card-content">
              <ClassComparisonBarChart data={chartData} height={350} />
            </div>
          </div>

          {/* Detailed Subject Analysis */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3">Subject-wise Breakdown</h2>
            <div className="grid grid-2 gap-4">
              {data.subjectRiskSummary.map((subject, idx) => (
                <div key={idx} className="card">
                  <div className="card-header">
                    <div className="flex justify-between items-center">
                      <h3 className="card-title">{subject.name}</h3>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => setSelectedSubject(subject)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                  <div className="card-content">
                    <RiskGauge value={subject.avgRisk} size="small" />
                    
                    <div className="grid grid-3 gap-2 text-center mt-3">
                      <div>
                        <p className="text-xs muted-text">High Risk</p>
                        <p className="text-lg font-bold text-danger">{subject.highRiskCount}</p>
                      </div>
                      <div>
                        <p className="text-xs muted-text">Medium Risk</p>
                        <p className="text-lg font-bold text-warning">{subject.mediumRiskCount}</p>
                      </div>
                      <div>
                        <p className="text-xs muted-text">Low Risk</p>
                        <p className="text-lg font-bold text-success">{subject.lowRiskCount}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-start gap-2">
                        <Lightbulb size={14} className="text-warning mt-0.5" />
                        <p className="text-xs">{subject.suggestions.substring(0, 100)}...</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Distribution Summary */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Risk Distribution Overview</h2>
            </div>
            <div className="card-content">
              <div className="flex justify-around items-center">
                <RiskDistributionPieChart 
                  high={data.subjectRiskSummary.reduce((sum, s) => sum + s.highRiskCount, 0)}
                  medium={data.subjectRiskSummary.reduce((sum, s) => sum + s.mediumRiskCount, 0)}
                  low={data.subjectRiskSummary.reduce((sum, s) => sum + s.lowRiskCount, 0)}
                  size={150}
                />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-danger rounded"></div>
                    <span>High Risk: {data.subjectRiskSummary.reduce((sum, s) => sum + s.highRiskCount, 0)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-warning rounded"></div>
                    <span>Medium Risk: {data.subjectRiskSummary.reduce((sum, s) => sum + s.mediumRiskCount, 0)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-success rounded"></div>
                    <span>Low Risk: {data.subjectRiskSummary.reduce((sum, s) => sum + s.lowRiskCount, 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Subject Detail Modal */}
      {selectedSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedSubject(null)}>
          <div className="card max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="card-header sticky top-0 bg-white dark:bg-gray-900">
              <div className="flex justify-between items-center">
                <h3 className="card-title">{selectedSubject.name}</h3>
                <button className="btn btn-sm btn-outline" onClick={() => setSelectedSubject(null)}>Close</button>
              </div>
            </div>
            <div className="card-content">
              <RiskGauge value={selectedSubject.avgRisk} size="large" />
              
              <div className="grid grid-3 gap-4 text-center mt-4">
                <div className="p-3 bg-danger/10 rounded-lg">
                  <p className="text-2xl font-bold text-danger">{selectedSubject.highRiskCount}</p>
                  <p className="text-xs">High Risk Students</p>
                </div>
                <div className="p-3 bg-warning/10 rounded-lg">
                  <p className="text-2xl font-bold text-warning">{selectedSubject.mediumRiskCount}</p>
                  <p className="text-xs">Medium Risk Students</p>
                </div>
                <div className="p-3 bg-success/10 rounded-lg">
                  <p className="text-2xl font-bold text-success">{selectedSubject.lowRiskCount}</p>
                  <p className="text-xs">Low Risk Students</p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                <div className="flex items-start gap-2">
                  <Lightbulb size={16} className="text-warning mt-0.5" />
                  <div>
                    <p className="font-bold mb-1">AI Recommendations</p>
                    <p className="text-sm">{selectedSubject.suggestions}</p>
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

export default ClassAnalysisPage;