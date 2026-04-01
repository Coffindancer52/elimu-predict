import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, FlaskConical, Calculator, Globe, Palette, Dumbbell, Laptop, Sprout, Scale, Languages, Music, Hammer } from "lucide-react";
import { useState } from "react";

const SUBJECTS = [
  // Group 1: Languages
  { id: 1, code: "ENG101", name: "English", category: "Languages", compulsory: true },
  { id: 2, code: "KIS101", name: "Kiswahili", category: "Languages", compulsory: true },

  // Group 2: Sciences
  { id: 3, code: "MAT101", name: "Mathematics", category: "Sciences", compulsory: true },
  { id: 4, code: "PHY101", name: "Physics", category: "Sciences", compulsory: false },
  { id: 5, code: "CHE101", name: "Chemistry", category: "Sciences", compulsory: false },
  { id: 6, code: "BIO101", name: "Biology", category: "Sciences", compulsory: false },

  // Group 3: Humanities
  { id: 7, code: "HIS101", name: "History & Government", category: "Humanities", compulsory: false },
  { id: 8, code: "GEO101", name: "Geography", category: "Humanities", compulsory: false },
  { id: 9, code: "CRE101", name: "Christian Religious Education (CRE)", category: "Humanities", compulsory: false },
  { id: 10, code: "IRE101", name: "Islamic Religious Education (IRE)", category: "Humanities", compulsory: false },
  { id: 11, code: "HRE101", name: "Hindu Religious Education (HRE)", category: "Humanities", compulsory: false },

  // Group 4: Technical & Applied
  { id: 12, code: "AGR101", name: "Agriculture", category: "Technical", compulsory: false },
  { id: 13, code: "BST101", name: "Business Studies", category: "Technical", compulsory: false },
  { id: 14, code: "CST101", name: "Computer Studies", category: "Technical", compulsory: false },
  { id: 15, code: "HME101", name: "Home Science", category: "Technical", compulsory: false },
  { id: 16, code: "ART101", name: "Art & Design", category: "Technical", compulsory: false },
  { id: 17, code: "WDW101", name: "Woodwork", category: "Technical", compulsory: false },
  { id: 18, code: "MTW101", name: "Metalwork", category: "Technical", compulsory: false },
  { id: 19, code: "BLC101", name: "Building & Construction", category: "Technical", compulsory: false },
  { id: 20, code: "PWR101", name: "Power Mechanics", category: "Technical", compulsory: false },
  { id: 21, code: "ELC101", name: "Electricity", category: "Technical", compulsory: false },
  { id: 22, code: "DND101", name: "Drawing & Design", category: "Technical", compulsory: false },
  { id: 23, code: "AVT101", name: "Aviation Technology", category: "Technical", compulsory: false },

  // Group 5: Creative Arts & PE
  { id: 24, code: "MUS101", name: "Music", category: "Creative Arts", compulsory: false },
  { id: 25, code: "FRN101", name: "French", category: "Languages", compulsory: false },
  { id: 26, code: "GER101", name: "German", category: "Languages", compulsory: false },
  { id: 27, code: "ARB101", name: "Arabic", category: "Languages", compulsory: false },
  { id: 28, code: "KSL101", name: "Kenya Sign Language", category: "Languages", compulsory: false },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Languages: <Languages className="h-5 w-5 text-primary" />,
  Sciences: <FlaskConical className="h-5 w-5 text-primary" />,
  Humanities: <Globe className="h-5 w-5 text-primary" />,
  Technical: <Hammer className="h-5 w-5 text-primary" />,
  "Creative Arts": <Music className="h-5 w-5 text-primary" />,
};

const CATEGORIES = ["Languages", "Sciences", "Humanities", "Technical", "Creative Arts"];

const SubjectsPage = () => (
  <div className="animate-fade-in">
    <div className="mb-6">
      <h1 className="text-2xl font-heading font-bold text-foreground">Subjects</h1>
      <p className="text-muted-foreground text-sm mt-1">View and manage subject assignments</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {MOCK_SUBJECTS.map((s) => (
        <Card key={s.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-mono text-xs text-muted-foreground">{s.code}</p>
                <h3 className="font-heading font-semibold text-foreground">{s.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">Teacher: {s.teacher}</p>
                <p className="text-xs text-muted-foreground">Class: {s.className}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default SubjectsPage;
