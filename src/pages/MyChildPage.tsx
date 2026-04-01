import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, GraduationCap, ShieldCheck, TrendingUp, TrendingDown, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Mock data – replace with API call
const MOCK_CHILD = {
  admissionNo: "ADM2024001",
  fullName: "Brian Otieno",
  className: "Form 3A",
  stream: "East",
  parentIdVerified: true,
  subjects: [
    { name: "Mathematics", score: 72, grade: "B", trend: "up" },
    { name: "English", score: 65, grade: "B-", trend: "down" },
    { name: "Kiswahili", score: 78, grade: "B+", trend: "up" },
    { name: "Biology", score: 58, grade: "C+", trend: "stable" },
    { name: "Chemistry", score: 44, grade: "C-", trend: "down" },
    { name: "Physics", score: 61, grade: "B-", trend: "up" },
  ],
  overallMean: 63,
  riskLevel: "Medium",
  aiRecommendation: "Brian shows strong performance in languages but needs focused support in Chemistry. Consider extra tutorials and practice papers for science subjects.",
};

const MyChildPage = () => {
  const { user } = useAuth();
  const [searchForm, setSearchForm] = useState({ admissionNo: "", studentName: "" });
  const [verified, setVerified] = useState(false);
  const [child, setChild] = useState<typeof MOCK_CHILD | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: api.post("/parent/verify-child", { ...searchForm, parentId: user?.id })
    // For demo, just show mock data
    setChild(MOCK_CHILD);
    setVerified(true);
  };

  const riskColor = child?.riskLevel === "High" ? "destructive" : child?.riskLevel === "Medium" ? "secondary" : "default";

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">My Child's Progress</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Enter your child's details to view their academic progress. Only verified parents can access this information.
        </p>
      </div>

      {!verified ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Verify Your Identity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground mb-2">
                For security, you must provide the student's admission number and full name. 
                These must match the records linked to your account during registration.
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Student Admission Number</Label>
                <Input
                  required
                  placeholder="e.g. ADM2024001"
                  value={searchForm.admissionNo}
                  onChange={(e) => setSearchForm({ ...searchForm, admissionNo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Student Full Name</Label>
                <Input
                  required
                  placeholder="e.g. Brian Otieno"
                  value={searchForm.studentName}
                  onChange={(e) => setSearchForm({ ...searchForm, studentName: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Verify & View Progress
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : child ? (
        <div className="space-y-5">
          {/* Student Info Card */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{child.fullName}</h2>
                    <p className="text-sm text-muted-foreground">{child.className} • {child.stream} Stream</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{child.admissionNo}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Overall Mean</p>
                  <p className="text-2xl font-bold text-foreground">{child.overallMean}%</p>
                  <Badge variant={riskColor} className="mt-1">{child.riskLevel} Risk</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-primary" />
                Subject Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-3 font-semibold text-foreground">Subject</th>
                    <th className="text-center p-3 font-semibold text-foreground">Score</th>
                    <th className="text-center p-3 font-semibold text-foreground">Grade</th>
                    <th className="text-center p-3 font-semibold text-foreground">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {child.subjects.map((s) => (
                    <tr key={s.name} className="border-b border-border last:border-0">
                      <td className="p-3 text-foreground">{s.name}</td>
                      <td className="p-3 text-center text-foreground font-medium">{s.score}%</td>
                      <td className="p-3 text-center">
                        <Badge variant="outline">{s.grade}</Badge>
                      </td>
                      <td className="p-3 text-center">
                        {s.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mx-auto" />
                        ) : s.trend === "down" ? (
                          <TrendingDown className="h-4 w-4 text-red-500 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* AI Recommendation */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-2">🤖 AI Recommendation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{child.aiRecommendation}</p>
            </CardContent>
          </Card>

          <Button variant="outline" onClick={() => { setVerified(false); setChild(null); }}>
            ← Back to Verification
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default MyChildPage;
