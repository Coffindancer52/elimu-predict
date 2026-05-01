import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Brain, AlertTriangle, TrendingUp, Users, BookOpen, ChevronRight } from 'lucide-react';
import RiskGauge from '@/pages/RiskGauge';

const ClassInsightsPage = () => {
  const [className, setClassName] = useState('');
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [term, setTerm] = useState('TERM_1');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());

  const fetchInsights = async (e) => {
    e?.preventDefault();
    if (!className) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/ai/smart-insight/${className}?term=${term}&academicYear=${academicYear}`);
      setInsights(response);
    } catch (error) {
      console.error(error);
      alert('Failed to fetch class insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (className) fetchInsights();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="flex items-center gap-2"><Brain className="text-primary" /> Class AI Insights</h1>
        <p className="subtitle">Deep learning analytics for class performance</p>
      </div>

      <div className="card mb-6">
        <div className="card-content">
          <form onSubmit={fetchInsights} className="flex gap-4 items-end">
            <div className="field flex-1">
              <label className="label">Class Name</label>
              <input className="input" placeholder="e.g., Form 3A" value={className} onChange={(e) => setClassName(e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Term</label>
              <select className="select" value={term} onChange={(e) => setTerm(e.target.value)}>
                <option value="TERM_1">Term 1</option>
                <option value="TERM_2">Term 2</option>
                <option value="TERM_3">Term 3</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Year</label>
              <select className="select" value={academicYear} onChange={(e) => setAcademicYear(parseInt(e.target.value))}>
                <option>{academicYear}</option>
                <option>{academicYear - 1}</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Analyze Class</button>
          </form>
        </div>
      </div>

      {loading && <div className="text-center py-12">Loading insights...</div>}

      {insights && !loading && (
        <>
          {/* Class Overview */}
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
              <BookOpen className="mx-auto mb-2 text-warning" size={24} />
              <p className="text-xl font-bold text-warning">{insights.criticalSubject || 'N/A'}</p>
              <p className="text-xs muted-text">Critical Subject</p>
            </div>
            <div className="card text-center">
              <TrendingUp className="mx-auto mb-2 text-success" size={24} />
              <p className="text-xl font-bold">{insights.term} {insights.academicYear}</p>
              <p className="text-xs muted-text">Analysis Period</p>
            </div>
          </div>

          {/* Subject Insights */}
          <div className="card mb-6">
            <div className="card-header">
              <h2 className="card-title">Subject-wise Analysis</h2>
            </div>
            <div className="card-content">
              {insights.subjectInsights?.map((subject, i) => (
                <div key={i} className="mb-4 pb-4 border-b last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold">{subject.subjectName}</h3>
                    <span className={`badge ${subject.subjectStatus === 'CRITICAL' ? 'danger' : subject.subjectStatus === 'WARNING' ? 'warning' : 'success'}`}>
                      {subject.subjectStatus || 'Active'}
                    </span>
                  </div>
                  <div className="grid grid-4 gap-2 text-center text-xs mb-3">
                    <div><p className="font-bold">{subject.highRiskCount || 0}</p><p className="muted-text">High Risk</p></div>
                    <div><p className="font-bold">{subject.mediumRiskCount || 0}</p><p className="muted-text">Medium</p></div>
                    <div><p className="font-bold">{subject.lowRiskCount || 0}</p><p className="muted-text">Low Risk</p></div>
                    <div><p className="font-bold">{subject.classAverageRisk?.toFixed(1)}%</p><p className="muted-text">Avg Risk</p></div>
                  </div>
                  {subject.hiddenStrugglers?.length > 0 && (
                    <details className="mt-2">
                      <summary className="text-sm cursor-pointer text-warning">⚠️ Hidden Strugglers ({subject.hiddenStrugglers.length})</summary>
                      <div className="mt-2 space-y-2">
                        {subject.hiddenStrugglers.map((student, j) => (
                          <div key={j} className="bg-gray-50 dark:bg-gray-800 rounded p-2 text-sm">
                            <p className="font-bold">{student.fullName} ({student.admissionNumber})</p>
                            <p className="text-xs">Risk: {student.riskPercentage}% | Urgency: {student.urgency}</p>
                            <p className="text-xs text-gray-600">{student.suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Subject Risk Students */}
          {insights.multiSubjectRiskStudents?.length > 0 && (
            <div className="card mb-6 danger-tint">
              <div className="card-header">
                <h2 className="card-title text-danger">⚠️ Multi-Subject Risk Students</h2>
              </div>
              <div className="card-content">
                {insights.multiSubjectRiskStudents.map((student, i) => (
                  <div key={i} className="list-row">
                    <div>
                      <p className="name">{student.fullName}</p>
                      <p className="meta">{student.admissionNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-danger">High: {student.highRiskSubjects?.join(', ')}</p>
                      <p className="text-xs">Medium: {student.mediumRiskSubjects?.join(', ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mixed Performers */}
          {insights.mixedPerformers?.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">🎭 Mixed Performers</h2>
              </div>
              <div className="card-content">
                {insights.mixedPerformers.map((student, i) => (
                  <div key={i} className="list-row">
                    <div>
                      <p className="name">{student.fullName}</p>
                      <p className="text-xs text-success">Strong: {student.strongSubjects?.join(', ')}</p>
                      <p className="text-xs text-danger">Weak: {student.weakSubjects?.join(', ')}</p>
                    </div>
                    <ChevronRight size={16} className="muted-text" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClassInsightsPage;