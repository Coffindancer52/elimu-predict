import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import StatCard from "@/components/StatCard";
import RiskGauge from "./RiskGauge";
import PerformanceLineChart from "./PerformanceLineChart";
import RiskDistributionPieChart from "./RiskDistributionPieChart";
import ClassComparisonBarChart from "./ClassComparisonBarChart";
import { 
  Users, GraduationCap, AlertTriangle, TrendingUp, BookOpen, 
  Brain, BarChart3, ClipboardList, School, Trophy, ArrowUp, ArrowDown 
} from "lucide-react";

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="grid grid-4 mb-8 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card h-28 bg-gray-100 dark:bg-gray-800"/>
      ))}
    </div>
    <div className="grid grid-2 gap-6">
      <div className="card h-96 bg-gray-100 dark:bg-gray-800"/>
      <div className="card h-96 bg-gray-100 dark:bg-gray-800"/>
    </div>
  </div>
);

// Teacher Dashboard Component
const TeacherDashboard = ({ teacherData, loading, term, academicYear, onTermChange, onYearChange }) => {
  const [selectedSubject, setSelectedSubject] = useState(null);

  if (loading) return <LoadingSkeleton />;
  if (!teacherData) return <div className="card">No data available</div>;

  const { subjectCards = [], teacherName, totalStudentsTaught = 0, totalAssignments = 0 } = teacherData;
  
  // Calculate at-risk count across all subjects
  const atRiskCount = subjectCards.reduce((sum, card) => sum + (card.highRiskCount || 0), 0);
  const pendingMarks = subjectCards.length * 2; // Mock - would come from API
  const totalSubjects = subjectCards.length;

  return (
    <>
      {/* Term Selector */}
      <div className="flex justify-end mb-4 gap-2">
        <select className="select" value={term} onChange={(e) => onTermChange(e.target.value)}>
          <option value="TERM_1">Term 1</option>
          <option value="TERM_2">Term 2</option>
          <option value="TERM_3">Term 3</option>
        </select>
        <select className="select" value={academicYear} onChange={(e) => onYearChange(parseInt(e.target.value))}>
          <option>{academicYear}</option>
          <option>{academicYear - 1}</option>
          <option>{academicYear - 2}</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-4 mb-8 gap-4">
        <StatCard label="My Students" value={totalStudentsTaught} icon={GraduationCap} variant="primary"/>
        <StatCard label="At-Risk Students" value={atRiskCount} icon={AlertTriangle} variant="danger" 
                  trend={{ value: `${subjectCards.filter(c => c.trend === 'declining').length} subjects declining`, positive: false }}/>
        <StatCard label="Subjects Assigned" value={totalSubjects} icon={BookOpen}/>
        <StatCard label="Pending Marks" value={pendingMarks} icon={ClipboardList} variant="warning"/>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-2 gap-6 mb-6">
        {subjectCards.map((card, idx) => (
          <div key={idx} className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedSubject(card)}>
            <div className="card-header">
              <div className="flex justify-between items-center">
                <h3 className="card-title">{card.subjectName}</h3>
                <span className={`badge ${card.subjectStatus === 'CRITICAL' ? 'danger' : card.subjectStatus === 'WARNING' ? 'warning' : 'success'}`}>
                  {card.subjectStatus || 'Active'}
                </span>
              </div>
              <p className="text-xs muted-text">{card.className}</p>
            </div>
            <div className="card-content">
              <div className="grid grid-2 gap-4 mb-4">
                <div>
                  <p className="text-xs muted-text">Class Average</p>
                  <p className="text-xl font-bold">{card.classAverageMark?.toFixed(1) || '-'}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    {card.avgChange > 0 ? <ArrowUp className="text-success" size={14}/> : <ArrowDown className="text-danger" size={14}/>}
                    <span className={`text-xs ${card.avgChange > 0 ? 'text-success' : card.avgChange < 0 ? 'text-danger' : 'text-muted'}`}>
                      {Math.abs(card.avgChange || 0).toFixed(1)}% from last term
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs muted-text">Mean Risk Score</p>
                  <RiskGauge value={card.classMeanRisk || 0} size="small" />
                </div>
              </div>
              
              {/* Risk Distribution */}
              <div className="flex justify-between gap-2 mb-4">
                <div className="text-center flex-1">
                  <p className="text-xs muted-text">High Risk</p>
                  <p className="text-lg font-bold text-danger">{card.highRiskCount || 0}</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-xs muted-text">Medium Risk</p>
                  <p className="text-lg font-bold text-warning">{card.mediumRiskCount || 0}</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-xs muted-text">Low Risk</p>
                  <p className="text-lg font-bold text-success">{card.lowRiskCount || 0}</p>
                </div>
              </div>

              {/* Assessment Graph */}
              {card.assessmentGraph && card.assessmentGraph.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-bold mb-2">Assessment Performance</p>
                  <PerformanceLineChart data={card.assessmentGraph} height={120} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* At-Risk Students List Modal */}
      {selectedSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedSubject(null)}>
          <div className="card max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="card-header sticky top-0 bg-white dark:bg-gray-900">
              <div className="flex justify-between items-center">
                <h2 className="card-title">At-Risk Students - {selectedSubject.subjectName}</h2>
                <button className="btn btn-outline btn-sm" onClick={() => setSelectedSubject(null)}>Close</button>
              </div>
            </div>
            <div className="card-content">
              {selectedSubject.atRiskStudents?.length > 0 ? (
                selectedSubject.atRiskStudents.map((student, i) => (
                  <div key={i} className="list-row border-b last:border-0">
                    <div>
                      <p className="name">{student.fullName}</p>
                      <p className="meta">ADM: {student.admissionNumber} | Trend: {student.trendDirection || 'stable'}</p>
                    </div>
                    <div className="text-right">
                      <span className="accent text-danger">{student.riskPercentage}% risk</span>
                      <p className="text-xs muted-text">Mean: {student.subjectMean}%</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center muted-text">No at-risk students in this subject</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Principal Dashboard Component
const PrincipalDashboard = ({ principalData, loading, term, academicYear, onTermChange, onYearChange }) => {
  if (loading) return <LoadingSkeleton />;
  if (!principalData) return <div className="card">No data available</div>;

  const { 
    schoolMeanAverage = 0, schoolGrade = 'C', meanChange = 0, schoolTrend = 'stable',
    totalStudents = 0, totalClasses = 0, totalSubjects = 0, 
    classRankings = [], subjectRankings = [], mostImprovedClass = null
  } = principalData;

  const highRiskCount = classRankings.reduce((sum, c) => sum + (c.highRiskCount || 0), 0);

  return (
    <>
      {/* Term Selector */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <select className="select" value={term} onChange={(e) => onTermChange(e.target.value)}>
            <option value="TERM_1">Term 1</option>
            <option value="TERM_2">Term 2</option>
            <option value="TERM_3">Term 3</option>
          </select>
          <select className="select" value={academicYear} onChange={(e) => onYearChange(parseInt(e.target.value))}>
            <option>{academicYear}</option>
            <option>{academicYear - 1}</option>
            <option>{academicYear - 2}</option>
          </select>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => window.location.href = '/school-analysis'}>
          <Brain size={16} /> View AI Analysis
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-4 mb-8 gap-4">
        <StatCard label="Total Students" value={totalStudents} icon={GraduationCap} variant="primary"/>
        <StatCard label="Total Classes" value={totalClasses} icon={School}/>
        <StatCard label="At-Risk Students" value={highRiskCount} icon={AlertTriangle} variant="danger" 
                  trend={{ value: meanChange > 0 ? `${meanChange.toFixed(1)}% improvement` : `${Math.abs(meanChange).toFixed(1)}% decline`, positive: meanChange > 0 }}/>
        <StatCard label="School Avg" value={`${schoolMeanAverage.toFixed(1)}%`} icon={TrendingUp} variant={meanChange >= 0 ? "success" : "warning"}/>
      </div>

      {/* School Performance Overview */}
      <div className="grid grid-2 gap-6 mb-6">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title flex items-center gap-2"><Trophy size={18} /> Class Performance Rankings</h2>
          </div>
          <div className="card-content">
            {classRankings.slice(0, 5).map((cls, i) => (
              <div key={i} className="list-row">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-yellow-100 text-yellow-800' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-800' : 'bg-gray-50'
                  }`}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="name">{cls.className}</p>
                    <p className="meta">Grade: {cls.grade} | {cls.totalStudents} students</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{cls.meanAverage?.toFixed(1)}%</p>
                  <div className="flex items-center gap-1">
                    {cls.trend === 'up' ? <ArrowUp size={12} className="text-success"/> : <ArrowDown size={12} className="text-danger"/>}
                    <span className={`text-xs ${cls.meanChange >= 0 ? 'text-success' : 'text-danger'}`}>
                      {Math.abs(cls.meanChange || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Subject Performance</h2>
          </div>
          <div className="card-content">
            {subjectRankings.slice(0, 5).map((subject, i) => (
              <div key={i} className="bar-row">
                <div className="labels">
                  <span className="name">{subject.subjectName}</span>
                  <span className="value">{subject.schoolWideMean?.toFixed(1)}%</span>
                </div>
                <div className="bar">
                  <div className={`bar-fill ${subject.status === 'CRITICAL' ? 'danger' : subject.status === 'WARNING' ? 'warning' : 'success'}`} 
                       style={{ width: `${subject.schoolWideMean || 0}%` }}/>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs muted-text">Rank #{subject.rank}</span>
                  <div className="flex items-center gap-1">
                    {subject.trend === 'up' ? <ArrowUp size={10} className="text-success"/> : 
                     subject.trend === 'down' ? <ArrowDown size={10} className="text-danger"/> : null}
                    <span className={`text-xs ${subject.meanChange >= 0 ? 'text-success' : 'text-danger'}`}>
                      {Math.abs(subject.meanChange || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Class Comparison Chart */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="card-title">Class Performance Comparison</h2>
        </div>
        <div className="card-content">
          <ClassComparisonBarChart data={classRankings} height={300} />
        </div>
      </div>

      {/* Most Improved Class Highlight */}
      {mostImprovedClass && (
        <div className="card success-tint">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs muted-text">🏆 Most Improved Class</p>
                <p className="text-xl font-bold">{mostImprovedClass.className}</p>
                <p className="text-sm">{mostImprovedClass.message}</p>
              </div>
              <div className="text-right">
                <p className="text-xs muted-text">Improvement</p>
                <p className="text-2xl font-bold text-success">+{mostImprovedClass.improvement?.toFixed(1)}%</p>
                <p className="text-xs">{mostImprovedClass.previousMean?.toFixed(1)}% → {mostImprovedClass.currentMean?.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Parent Dashboard Component
const ParentDashboard = ({ parentData, loading }) => {
  const [selectedChild, setSelectedChild] = useState(null);

  if (loading) return <LoadingSkeleton />;
  
  // If no child selected, show selection UI
  if (!selectedChild && parentData?.length > 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Select Your Child</h2>
        </div>
        <div className="card-content">
          <div className="grid grid-2 gap-4">
            {parentData.map((child, i) => (
              <div key={i} className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                   onClick={() => setSelectedChild(child)}>
                <div className="flex items-center gap-3">
                  <GraduationCap size={24} className="text-primary" />
                  <div>
                    <p className="font-bold">{child.fullName}</p>
                    <p className="text-sm muted-text">{child.className} | {child.admissionNumber}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const child = selectedChild || parentData?.[0];
  if (!child) return <div className="card">No children linked to your account. Please contact school administration.</div>;

  const { performance, analysis, assessmentBreakDown } = child;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">{child.fullName}</h2>
          <p className="text-sm muted-text">{child.className} | Admission: {child.admissionNumber}</p>
        </div>
        {parentData?.length > 1 && (
          <select className="select" onChange={(e) => setSelectedChild(parentData.find(c => c.admissionNumber === e.target.value))}>
            {parentData.map(c => <option key={c.admissionNumber} value={c.admissionNumber}>{c.fullName}</option>)}
          </select>
        )}
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-3 mb-6 gap-4">
        <StatCard label="Overall Average" value={`${performance?.overallGrade || '-'} (${performance?.totalMarksObtained?.toFixed(1) || 0}%)`} 
                  icon={TrendingUp} variant="primary"/>
        <StatCard label="Class Position" value={`${performance?.classPosition || '-'}/${performance?.totalStudents || '-'}`} 
                  icon={Trophy} variant={performance?.classPosition <= 10 ? "success" : "warning"}/>
        <StatCard label="Risk Level" value={analysis?.overallRiskLevel || 'Unknown'} icon={AlertTriangle} 
                  variant={analysis?.overallRiskLevel === 'HIGH' ? "danger" : analysis?.overallRiskLevel === 'MEDIUM' ? "warning" : "success"}/>
      </div>

      {/* Best & Worst Subjects */}
      <div className="grid grid-2 gap-6 mb-6">
        <div className="card success-tint">
          <div className="card-header">
            <h3 className="card-title text-success">🌟 Best Subject</h3>
          </div>
          <div className="card-content">
            <p className="text-xl font-bold">{performance?.bestSubject || '-'}</p>
            <p className="text-2xl font-bold text-success">{performance?.bestSubjectMean?.toFixed(1)}%</p>
          </div>
        </div>
        <div className="card danger-tint">
          <div className="card-header">
            <h3 className="card-title text-danger">⚠️ Needs Improvement</h3>
          </div>
          <div className="card-content">
            <p className="text-xl font-bold">{performance?.worstSubject || '-'}</p>
            <p className="text-2xl font-bold text-danger">{performance?.worstSubjectMean?.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Subject Performance Table */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="card-title">Subject-wise Performance</h2>
        </div>
        <div className="card-content flush">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Mean</th>
                  <th>Risk Level</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {analysis?.subjectRiskSummaries?.map((subject, i) => (
                  <tr key={i}>
                    <td className="font-medium">{subject.subjectName}</td>
                    <td>{subject.currentTermMean?.toFixed(1)}%</td>
                    <td><span className={`badge ${subject.riskLevel === 'HIGH' ? 'danger' : subject.riskLevel === 'MEDIUM' ? 'warning' : 'success'}`}>
                      {subject.riskLevel}
                    </span></td>
                    <td>
                      <div className="flex items-center gap-1">
                        {subject.trend > 0 ? <ArrowUp size={14} className="text-success"/> : 
                         subject.trend < 0 ? <ArrowDown size={14} className="text-danger"/> : null}
                        <span className={`text-sm ${subject.trend > 0 ? 'text-success' : subject.trend < 0 ? 'text-danger' : ''}`}>
                          {Math.abs(subject.markChange || 0).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Assessment Breakdown Chart */}
      {assessmentBreakDown && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Assessment Performance</h2>
          </div>
          <div className="card-content">
            <PerformanceLineChart data={assessmentBreakDown.graphData || []} height={250} showLegend />
          </div>
        </div>
      )}

      {/* AI Analysis Summary */}
      <div className="card primary-tint mt-6">
        <div className="card-header">
          <h2 className="card-title flex items-center gap-2"><Brain size={18} /> AI Analysis</h2>
        </div>
        <div className="card-content">
          <p className="text-sm mb-3">{analysis?.parentSummary || analysis?.trajectoryMessage || "Analysis not available"}</p>
          {analysis?.highRiskSubjects?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-bold text-danger">⚠️ High Risk Subjects: {analysis.highRiskSubjects.join(', ')}</p>
            </div>
          )}
          <button className="btn btn-outline btn-sm mt-3" onClick={() => window.location.href = `/my-child/${child.admissionNumber}`}>
            View Detailed AI Recommendations →
          </button>
        </div>
      </div>
    </>
  );
};

// Admin Dashboard Component
const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, activeSessions: 0, auditEventsToday: 0, inactiveAccounts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const users = await api.get('/users');
        const logs = await api.get('/admin/logs');
        const today = new Date().toISOString().split('T')[0];
        const todaysLogs = logs.filter(l => l.timestamp?.startsWith(today));
        
        setStats({
          totalUsers: users.length,
          activeSessions: users.filter(u => u.isActive).length,
          auditEventsToday: todaysLogs.length,
          inactiveAccounts: users.filter(u => !u.isActive).length
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="grid grid-4 gap-4">
      <StatCard label="Total Users" value={stats.totalUsers} icon={Users} variant="primary"/>
      <StatCard label="Active Sessions" value={stats.activeSessions} icon={TrendingUp} variant="success"/>
      <StatCard label="Audit Events Today" value={stats.auditEventsToday} icon={BarChart3}/>
      <StatCard label="Inactive Accounts" value={stats.inactiveAccounts} icon={AlertTriangle} variant="warning"/>
    </div>
  );
};

// Main Dashboard Page Component
const DashboardPage1 = () => {
  const { user, token } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState("TERM_1");
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());

  // Wrap fetchDashboardData in useCallback to prevent recreation on every render
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const role = user?.[2];
      let response = null;

      if (role === "TEACHER") {
        response = await api.get(`/teacher/profile?term=${term}&academicYear=${academicYear}`);
      } else if (["PRINCIPAL", "DEPUTY_PRINCIPAL", "SENIOR_TEACHER"].includes(role)) {
        response = await api.get(`/principal/dashboard?term=${term}&academicYear=${academicYear}`);
      } else if (role === "PARENT") {
        response = await api.get(`/parent/children?term=${term}&academicYear=${academicYear}`);
      }

      setDashboardData(response);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error.message);
    } finally {
      setLoading(false);
    }
  }, [user, term, academicYear]); // Now these are the only dependencies

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, term, academicYear, fetchDashboardData]); // Added fetchDashboardData to dependencies

  const handleTermChange = (newTerm) => {
    setTerm(newTerm);
  };

  const handleYearChange = (newYear) => {
    setAcademicYear(newYear);
  };

  if (!user) return null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const role = user[2];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>{greeting}, {user[0]}</h1>
        <p className="subtitle">Here's your AI-powered overview for today</p>
      </div>

      {role === "TEACHER" && 
        <TeacherDashboard 
          teacherData={dashboardData} 
          loading={loading}
          term={term}
          academicYear={academicYear}
          onTermChange={handleTermChange}
          onYearChange={handleYearChange}
        />
      }
      
      {["PRINCIPAL", "DEPUTY_PRINCIPAL", "SENIOR_TEACHER"].includes(role) && 
        <PrincipalDashboard 
          principalData={dashboardData} 
          loading={loading}
          term={term}
          academicYear={academicYear}
          onTermChange={handleTermChange}
          onYearChange={handleYearChange}
        />
      }
      
      {role === "PARENT" && 
        <ParentDashboard 
          parentData={dashboardData} 
          loading={loading}
        />
      }
      
      {["ADMIN", "IT_HANDLER"].includes(role) && <AdminDashboard />}
    </div>
  );
};

export default DashboardPage1;