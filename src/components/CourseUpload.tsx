import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CourseUploadProps {
  onCourseUploaded?: () => void;
}

export const CourseUpload = ({ onCourseUploaded }: CourseUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [technology, setTechnology] = useState("");
  const [tags, setTags] = useState("");
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (file.type !== 'text/markdown' && file.type !== 'text/plain') {
        toast({
          title: "Feil filtype",
          description: "Kun markdown (.md) og tekstfiler (.txt) er tillatt",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Fil for stor",
          description: "Filen må være mindre enn 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Auto-fill title from filename
      if (!courseTitle) {
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        setCourseTitle(fileName);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !courseTitle || !technology) {
      toast({
        title: "Mangler informasjon",
        description: "Fyll ut tittel og teknologi",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', courseTitle);
      formData.append('technology', technology);
      if (tags) {
        formData.append('tags', tags);
      }

      const response = await fetch('http://localhost:3001/api/courses/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Opplasting feilet');
      }

      const result = await response.json();
      
      setUploadStatus('success');
      toast({
        title: "Kurs lastet opp! 📚",
        description: `${courseTitle} er nå tilgjengelig for TeknoTassen (${result.chunkCount} chunks)`,
      });

      // Reset form
      setSelectedFile(null);
      setCourseTitle("");
      setTechnology("");
      setTags("");
      
      onCourseUploaded?.();
      
    } catch (error) {
      console.error('Error uploading course:', error);
      setUploadStatus('error');
      toast({
        title: "Opplasting feilet",
        description: error instanceof Error ? error.message : "Ukjent feil",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setCourseTitle("");
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Last opp kurs for TeknoTassen
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Last opp markdown-filer med kunnskap som TeknoTassen kan bruke for å svare på spørsmål.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="course-file">Kursfil (Markdown/Text) *</Label>
          <div className="flex items-center gap-2">
            <Input
              id="course-file"
              type="file"
              accept=".md,.txt,text/markdown,text/plain"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            {selectedFile && (
              <Button
                variant="outline"
                size="sm"
                onClick={removeFile}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {selectedFile && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
            </div>
          )}
        </div>

        {/* Course Title */}
        <div className="space-y-2">
          <Label htmlFor="course-title">Kursittel *</Label>
          <Input
            id="course-title"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            placeholder="F.eks. HEPRO Respons Admin 2025"
            disabled={isUploading}
          />
        </div>

        {/* Technology */}
        <div className="space-y-2">
          <Label htmlFor="technology">Teknologi *</Label>
          <Input
            id="technology"
            value={technology}
            onChange={(e) => setTechnology(e.target.value)}
            placeholder="F.eks. HEPRO Respons, Varda Care, Nattugla"
            disabled={isUploading}
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (valgfritt)</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="F.eks. admin, implementering, GDPR"
            disabled={isUploading}
          />
          <p className="text-xs text-muted-foreground">
            Separer tags med komma
          </p>
        </div>

        {/* Upload Button */}
        <Button 
          onClick={handleUpload}
          disabled={isUploading || !selectedFile || !courseTitle || !technology}
          className="w-full"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Laster opp...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Last opp kurs
            </>
          )}
        </Button>

        {/* Status */}
        {uploadStatus !== 'idle' && (
          <div className={`flex items-center gap-2 p-3 rounded-md ${
            uploadStatus === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {getStatusIcon()}
            <span className="text-sm font-medium">
              {uploadStatus === 'success' 
                ? 'Kurs lastet opp vellykket!' 
                : 'Feil ved opplasting'
              }
            </span>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 p-3 rounded-md">
          <h4 className="font-medium text-blue-900 mb-2">💡 Hvordan fungerer det?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Kurset blir delt opp i mindre biter (chunks)</li>
            <li>• Hver bit får en AI-embedding for rask søking</li>
            <li>• TeknoTassen bruker disse for å svare presist</li>
            <li>• Støtter markdown med bilder, kode og formatering</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
