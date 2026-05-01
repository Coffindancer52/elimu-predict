import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Brain, AlertCircle, CheckCircle, ListChecks, TrendingUp, Calendar } from 'lucide-react';

const SchoolAnalysisPage = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState('TERM_1');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/principal/analysis?term=${term}&academicYear=${academicYear}`);
        alert("success")
        setAnalysis(response);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [term, academicYear]);

  if (loading) {
    return <div className="text-center py-12">Loading AI School Analysis...</div>;
  }

  if (!analysis) {
    return <div className="card">No analysis data available. Ensure marks have been uploaded.</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="flex items-center gap-2"><Brain className="text-primary" /> AI School Analysis Report</h1>
        <p className="subtitle">Comprehensive AI-driven analysis of school performance</p>
      </div>

      <div className="flex justify-end gap-2 mb-4">
        <select className="select" value={term} onChange={(e) => setTerm(e.target.value)}>
          <option value="TERM_1">Term 1</option>
          <option value="TERM_2">Term 2</option>
          <option value="TERM_3">Term 3</option>
        </select>
        <select className="select" value={academicYear} onChange={(e) => setAcademicYear(parseInt(e.target.value))}>
          <option>{academicYear}</option>
          <option>{academicYear - 1}</option>
        </select>
      </div>

      <div className="card mb-6">
        <div className="card-content">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="muted-text" />
            <p className="text-xs muted-text">Generated: {new Date(analysis.generatedAt).toLocaleString()}</p>
          </div>
          <h2 className="text-lg font-bold mb-3">Executive Summary</h2>
          <p className="mb-4">{analysis.overallAnalysis}</p>
          <div className="bg-primary/10 p-4 rounded-lg">
            <p className="font-bold flex items-center gap-2"><TrendingUp size={18} /> Principal's Recommendation</p>
            <p className="mt-1">{analysis.principalRecommendation}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-2 gap-6 mb-6">
        <div className="card warning-tint">
          <div className="card-header">
            <h2 className="card-title flex items-center gap-2 text-warning"><AlertCircle size={18} /> Areas Needing Attention</h2>
          </div>
          <div className="card-content">
            {analysis.areasNeedingAttention?.map((area, i) => (
              <div key={i} className="mb-3 pb-3 border-b last:border-0">
                <p className="font-bold">{area.area}</p>
                <p className="text-sm muted-text mb-1">{area.reason}</p>
                <p className="text-sm text-primary">💡 {area.recommendation}</p>
                <span className="badge outline mt-1">Priority: {area.priority}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card success-tint">
          <div className="card-header">
            <h2 className="card-title flex items-center gap-2 text-success"><CheckCircle size={18} /> Performing Well</h2>
          </div>
          <div className="card-content">
            {analysis.areasPerformingWell?.map((area, i) => (
              <div key={i} className="mb-3 pb-3 border-b last:border-0">
                <p className="font-bold">{area.area}</p>
                <p className="text-sm muted-text">{area.reason}</p>
                <p className="text-sm text-success">✓ {area.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title flex items-center gap-2"><ListChecks size={18} /> AI Action Plan</h2>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            {analysis.actionPlan?.sort((a, b) => a.priority - b.priority).map((action, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  action.priority === 1 ? 'bg-red-100 text-red-700' : 
                  action.priority === 2 ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {action.priority}
                </div>
                <div className="flex-1">
                  <p className="font-bold">{action.action}</p>
                  <div className="grid grid-3 gap-2 mt-1 text-xs">
                    <p><span className="font-semibold">Target Class:</span> {action.targetClass || 'School-wide'}</p>
                    <p><span className="font-semibold">Subject:</span> {action.targetSubject || 'All'}</p>
                    <p><span className="font-semibold">Expected:</span> {action.expectedOutcome}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolAnalysisPage;