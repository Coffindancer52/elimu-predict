import { useState } from "react";
import { Brain, AlertTriangle, TrendingUp, Users, BookOpen, ChevronRight, Target, Zap, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";
import RiskGauge from "@/components/charts/RiskGauge";
import ClassComparisonBarChart from "@/components/charts/ClassComparisonBarChart";
import RiskDistributionPieChart from "@/components/charts/RiskDistributionPieChart";

const SmartClassInsightsPage = () => {
  const [className, setClassName] = useState("");
  const [term, setTerm] = useState("TERM_1");
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showHiddenStrugglers, setShowHiddenStrugglers] = useState({});

  const fetchInsights = async (e) => {
    e?.preventDefault();
    if (!className) {
      setError("Please enter class name");
      return;
    }
    
    setLoading(true);
    setError("");
    setInsights(null);
    
    try {
      const response = await api.get(
        `/ai/smart-insight/${className}?term=${term}&academicYear=${academicYear}`
      );
      setInsights(response);
      
      if (!response) {
        setError("No insights found for this class");
      }
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Failed to fetch class insights");
    } finally {
      setLoading(false);
    }
  };

  const toggleHiddenStrugglers = (subjectId) => {
    setShowHiddenStrugglers(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  // Prepare chart data
  const subjectRiskData = insights?.subjectInsights?.map(s => ({
    className: s.subjectName,
    meanAverage: s.classAverageRisk,
    highRiskCount: s.highRiskCount
  })) || [];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="flex items-center gap-2">
          <Brain className="text-primary" /> Smart Class Insights
        </h1>
        <p className="subtitle">Deep learning analytics for class performance with hidden pattern detection</p>
      </div>

      {/* Search Form */}
      <div className="card mb-6">
        <div className="card-content">
          <form onSubmit={fetchInsights} className="flex gap-4 items-end flex-wrap">
            <div className="field flex-1 min-w-[200px]">
              <label className="label">Class Name</label>
              <input 
                className="input" 
                placeholder="e.g., Form 3A" 
                value={className} 
                onChange={(e) => setClassName(e.target.value)} 
                disabled={loading}
                required
              />
            </div>
            <div className="field">
              <label className="label">Term</label>
              <select className="select" value={term} onChange={(e) => setTerm(e.target.value)} disabled={loading}>
                <option value="TERM_1">Term 1</option>
                <option value="TERM_2">Term 2</option>
                <option value="TERM_3">Term 3</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Year</label>
              <select className="select" value={academicYear} onChange={(e) => setAcademicYear(parseInt(e.target.value))} disabled={loading}>
                <option>{academicYear}</option>
                <option>{academicYear - 1}</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Loading Insights..." : "Get Smart Insights"}
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div className="alert danger mb-4" role="alert">
          {error}
        </div>
      )}

      {insights && !loading && (
        <>
          {/* Class Overview Cards */}
          <div className="grid grid-4 gap-4 mb-6">
            <div className="card text-center">
              <Users className="mx-auto mb-2 text-primary" size={24} />
              <p className="text-2xl font-bold">{insights.totalStudents}</p>
              <p className="text-xs muted-text">Total Students</p>
            </div>
            <div className="card text-center">
              <AlertTriangle className="mx-auto mb-2 text-danger" size={24} />
              <p className="text-2xl font-bold text-danger">{insights.totalWeakStudents}</p>
              <p className="text-xs muted-text">Weak Students</p>
            </div>
            <div className="card text-center">
              <Target className="mx-auto mb-2 text-warning" size={24} />
              <p className="text-xl font-bold text-warning">{insights.criticalSubject || 'N/A'}</p>
              <p className="text-xs muted-text">Critical Subject</p>
            </div>
            <div className="card text-center">
              <TrendingUp className="mx-auto mb-2 text-success" size={24} />
              <p className="text-xl font-bold">{insights.term} {insights.academicYear}</p>
              <p className="text-xs muted-text">Analysis Period</p>
            </div>
          </div>

          {/* Subject Risk Comparison Chart */}
          {subjectRiskData.length > 0 && (
            <div className="card mb-6">
              <div className="card-header">
                <h2 className="card-title">Subject Risk Comparison</h2>
              </div>
              <div className="card-content">
                <ClassComparisonBarChart data={subjectRiskData} height={300} />
              </div>
            </div>
          )}

          {/* Subject Insights */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <BookOpen size={18} /> Subject-wise Deep Analysis
            </h2>
            <div className="space-y-4">
              {insights.subjectInsights?.map((subject, i) => (
                <div key={i} className="card">
                  <div className="card-header">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <h3 className="card-title">{subject.subjectName}</h3>
                        <p className="text-xs muted-text">Subject ID: {subject.subjectId}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`badge ${
                          subject.subjectStatus === 'CRITICAL' ? 'danger' : 
                          subject.subjectStatus === 'WARNING' ? 'warning' : 'success'
                        }`}>
                          {subject.subjectStatus || 'Active'}
                        </span>
                        <button 
                          className="btn btn-outline btn-sm"
                          onClick={() => toggleHiddenStrugglers(subject.subjectId)}
                        >
                          {showHiddenStrugglers[subject.subjectId] ? <EyeOff size={14} /> : <Eye size={14} />}
                          {showHiddenStrugglers[subject.subjectId] ? " Hide" : " Show"} Hidden Strugglers
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="card-content">
                    {/* Risk Metrics */}
                    <div className="grid grid-4 gap-2 text-center text-xs mb-4">
                      <div className="p-2 bg-danger/10 rounded">
                        <p className="font-bold text-danger">{subject.highRiskCount || 0}</p>
                        <p className="muted-text">High Risk</p>
                      </div>
                      <div className="p-2 bg-warning/10 rounded">
                        <p className="font-bold text-warning">{subject.mediumRiskCount || 0}</p>
                        <p className="muted-text">Medium Risk</p>
                      </div>
                      <div className="p-2 bg-success/10 rounded">
                        <p className="font-bold text-success">{subject.lowRiskCount || 0}</p>
                        <p className="muted-text">Low Risk</p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded">
                        <p className="font-bold">{subject.classAverageRisk?.toFixed(1)}%</p>
                        <p className="muted-text">Avg Risk</p>
                      </div>
                    </div>

                    {/* Risk Gauge */}
                    <div className="mb-4">
                      <RiskGauge value={subject.classAverageRisk || 0} size="small" />
                    </div>

                    {/* Action Required */}
                    {subject.actionRequired && (
                      <div className="bg-warning/10 p-3 rounded-lg mb-4">
                        <div className="flex items-start gap-2">
                          <Zap size={16} className="text-warning mt-0.5" />
                          <div>
                            <p className="font-bold text-sm">Action Required</p>
                            <p className="text-sm">{subject.actionRequired}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Hidden Strugglers */}
                    {showHiddenStrugglers[subject.subjectId] && subject.hiddenStrugglers?.length > 0 && (
                      <div className="mt-4">
                        <p className="font-bold text-sm mb-2 flex items-center gap-2">
                          <Eye size={14} /> Hidden Strugglers ({subject.hiddenStrugglers.length})
                        </p>
                        <div className="space-y-2">
                          {subject.hiddenStrugglers.map((student, j) => (
                            <div key={j} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold">{student.fullName}</p>
                                  <p className="text-xs muted-text">{student.admissionNumber}</p>
                                </div>
                                <span className={`badge ${student.urgency === 'HIGH' ? 'danger' : 'warning'}`}>
                                  {student.urgency} Urgency
                                </span>
                              </div>
                              <div className="mt-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Risk Score</span>
                                  <span>{student.riskPercentage}%</span>
                                </div>
                                <div className="bar">
                                  <div className={`bar-fill ${student.riskPercentage > 70 ? 'danger' : 'warning'}`} 
                                       style={{ width: `${student.riskPercentage}%` }} />
                                </div>
                              </div>
                              <p className="text-xs mt-2 text-gray-600">{student.suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Performance Outliers */}
                    {(subject.performanceOutliersLow?.length > 0 || subject.performanceOutliersHigh?.length > 0) && (
                      <div className="grid grid-2 gap-3 mt-4 pt-3 border-t">
                        {subject.performanceOutliersLow?.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-danger mb-1">⚠️ Low Performers</p>
                            <p className="text-xs">{subject.performanceOutliersLow.join(', ')}</p>
                          </div>
                        )}
                        {subject.performanceOutliersHigh?.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-success mb-1">🌟 High Performers</p>
                            <p className="text-xs">{subject.performanceOutliersHigh.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Subject Risk Students */}
          {insights.multiSubjectRiskStudents?.length > 0 && (
            <div className="card danger-tint mb-6">
              <div className="card-header">
                <h2 className="card-title flex items-center gap-2 text-danger">
                  <AlertTriangle size={18} /> Multi-Subject Risk Students
                </h2>
                <p className="text-xs muted-text">Students at risk in multiple subjects requiring immediate attention</p>
              </div>
              <div className="card-content">
                <div className="space-y-3">
                  {insights.multiSubjectRiskStudents.map((student, i) => (
                    <div key={i} className="border-b last:border-0 pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">{student.fullName}</p>
                          <p className="text-xs muted-text">{student.admissionNumber}</p>
                        </div>
                        <span className={`badge ${student.overallUrgency === 'HIGH' ? 'danger' : 'warning'}`}>
                          {student.overallUrgency} Priority
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {student.highRiskSubjects?.map((subject, j) => (
                          <span key={j} className="badge danger">🔴 {subject}</span>
                        ))}
                        {student.mediumRiskSubjects?.map((subject, j) => (
                          <span key={j} className="badge warning">🟡 {subject}</span>
                        ))}
                      </div>
                      <p className="text-xs text-danger mt-1">
                        Total at-risk subjects: {student.totalAtRiskSubjects}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mixed Performers */}
          {insights.mixedPerformers?.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center gap-2">
                  🎭 Mixed Performers
                </h2>
                <p className="text-xs muted-text">Students excelling in some subjects but struggling in others</p>
              </div>
              <div className="card-content">
                <div className="space-y-3">
                  {insights.mixedPerformers.map((student, i) => (
                    <div key={i} className="flex items-start justify-between border-b last:border-0 pb-3">
                      <div className="flex-1">
                        <p className="font-bold">{student.fullName}</p>
                        <div className="flex gap-3 mt-1">
                          <div>
                            <span className="text-xs text-success">✓ Strong: </span>
                            <span className="text-xs">{student.strongSubjects?.join(', ') || 'None'}</span>
                          </div>
                          <div>
                            <span className="text-xs text-danger">⚠️ Weak: </span>
                            <span className="text-xs">{student.weakSubjects?.join(', ') || 'None'}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{student.insight}</p>
                      </div>
                      <ChevronRight size={16} className="muted-text flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SmartClassInsightsPage;