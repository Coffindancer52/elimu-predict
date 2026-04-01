import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, GraduationCap, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface StudentFormData {
  admissionNo: string;
  fullName: string;
  className: string;
  stream: string;
  dateOfBirth: string;
  parentFullName: string;
  parentIdNumber: string;
  parentPhone: string;
  parentEmail: string;
  parentRelationship: string;
}

const INITIAL: StudentFormData = {
  admissionNo: "",
  fullName: "",
  className: "",
  stream: "",
  dateOfBirth: "",
  parentFullName: "",
  parentIdNumber: "",
  parentPhone: "",
  parentEmail: "",
  parentRelationship: "",
};

const AddStudentDialog = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<StudentFormData>(INITIAL);

  const set = (field: keyof StudentFormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: api.post("/students", form)
    toast.success("Student registered successfully", {
      description: `${form.fullName} linked to parent ${form.parentFullName}`,
    });
    setForm(INITIAL);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <GraduationCap className="h-5 w-5 text-primary" />
            Register New Student
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Student Details */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Student Information</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-foreground text-xs">Admission No</Label>
                  <Input required placeholder="e.g. ADM2024006" value={form.admissionNo} onChange={(e) => set("admissionNo", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-foreground text-xs">Full Name</Label>
                  <Input required placeholder="e.g. John Kamau" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-foreground text-xs">Class</Label>
                  <Select onValueChange={(v) => set("className", v)}>
                    <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
                    <SelectContent>
                      {["Form 1A", "Form 1B", "Form 2A", "Form 2B", "Form 3A", "Form 3B", "Form 4A", "Form 4B"].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-foreground text-xs">Stream</Label>
                  <Select onValueChange={(v) => set("stream", v)}>
                    <SelectTrigger><SelectValue placeholder="Stream" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="East">East</SelectItem>
                      <SelectItem value="West">West</SelectItem>
                      <SelectItem value="North">North</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-foreground text-xs">Date of Birth</Label>
                  <Input required type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Parent/Guardian Details */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              Parent / Guardian Details
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Required for parent portal access. These details will be verified by the Admin before the parent can log in.
            </p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-foreground text-xs">Parent Full Name</Label>
                  <Input required placeholder="e.g. Mary Kamau" value={form.parentFullName} onChange={(e) => set("parentFullName", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-foreground text-xs">National ID Number</Label>
                  <Input required placeholder="e.g. 12345678" value={form.parentIdNumber} onChange={(e) => set("parentIdNumber", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-foreground text-xs">Phone Number</Label>
                  <Input required type="tel" placeholder="e.g. 0712345678" value={form.parentPhone} onChange={(e) => set("parentPhone", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-foreground text-xs">Email (Optional)</Label>
                  <Input type="email" placeholder="e.g. parent@email.com" value={form.parentEmail} onChange={(e) => set("parentEmail", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground text-xs">Relationship</Label>
                <Select onValueChange={(v) => set("parentRelationship", v)}>
                  <SelectTrigger><SelectValue placeholder="Select relationship" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Father">Father</SelectItem>
                    <SelectItem value="Mother">Mother</SelectItem>
                    <SelectItem value="Guardian">Guardian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
            <strong className="text-foreground">Security note:</strong> The parent account will be created pending Admin verification. 
            The parent must provide their National ID and linked student admission number to access the portal.
          </div>

          <Button type="submit" className="w-full">
            <GraduationCap className="h-4 w-4 mr-2" />
            Register Student & Link Parent
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentDialog;
