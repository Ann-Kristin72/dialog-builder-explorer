import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Loader2, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadProps {
  onDocumentUploaded?: () => void;
}

interface Document {
  id: string;
  title: string;
  description: string;
  content: string;
  chunks: string[];
  created_at: string;
}

export const DocumentUpload = ({ onDocumentUploaded }: DocumentUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill title from filename
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      setDocumentTitle(fileName);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      setDocumentTitle(fileName);
    }
  };

  const handleDragAreaClick = () => {
    fileInputRef.current?.click();
  };

  const processDocument = async (text: string, title: string, description: string) => {
    try {
      console.log("Processing document:", { title, description, textLength: text.length });
      
      // Split document into chunks for better search
      const chunks = text.match(/.{1,1000}(?:\s|$)/g) || [text];
      console.log("Document split into", chunks.length, "chunks");
      
      const documentData: Document = {
        id: Date.now().toString(),
        title,
        description,
        content: text,
        chunks: chunks,
        created_at: new Date().toISOString(),
      };

      console.log("Storing document in localStorage...");
      
      // Get existing documents from localStorage
      const existingDocs = JSON.parse(localStorage.getItem('knowledge_documents') || '[]');
      
      // Add new document
      existingDocs.push(documentData);
      
      // Save back to localStorage
      localStorage.setItem('knowledge_documents', JSON.stringify(existingDocs));
      
      console.log("Document successfully stored in localStorage");

      toast({
        title: "Dokument lastet opp! 📚",
        description: `${title} er nå tilgjengelig for TeknoTassen`,
      });

      onDocumentUploaded?.();
    } catch (error) {
      console.error('Error storing document:', error);
      
      toast({
        title: "Oops! Noe gikk galt",
        description: "Kunne ikke lagre dokumentet. Prøv igjen!",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentTitle.trim()) {
      toast({
        title: "Fyll ut alle felt",
        description: "Last opp en fil og gi den en tittel",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    console.log("Starting file upload:", selectedFile.name, selectedFile.type, selectedFile.size);

    try {
      let text: string;
      
      if (selectedFile.type === 'application/pdf') {
        // For PDF files, we'll need to handle them differently
        toast({
          title: "PDF-støtte",
          description: "PDF-filer støttes ikke ennå. Bruk .txt eller .md filer.",
          variant: "destructive",
        });
        return;
      } else {
        // For text files
        text = await selectedFile.text();
        console.log("File content read, length:", text.length);
      }
      
      await processDocument(text, documentTitle, documentDescription);
      
      // Reset form
      setSelectedFile(null);
      setDocumentTitle("");
      setDocumentDescription("");
      if (fileInputRef.current) fileInputRef.current.value = '';
      
    } catch (error) {
      console.error("Error reading file:", error);
      
      let errorMessage = "Kunne ikke lese filen. Kontroller at det er en tekstfil.";
      
      if (error instanceof Error) {
        if (error.message.includes("FileReader")) {
          errorMessage = "Filen kunne ikke leses. Prøv en annen fil.";
        } else {
          errorMessage = `Feil ved fil-lesing: ${error.message}`;
        }
      }
      
      toast({
        title: "Feil ved lesing av fil",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Last opp kunnskapsdokumenter
        </CardTitle>
        <CardDescription>
          Legg til dokumenter som TeknoTassen kan bruke for å svare mer presist på spørsmål om 
          Hepro Respons, Nattugla, Varda Care og andre velferdsteknologier.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="document-title">Dokumenttittel *</Label>
          <Input
            id="document-title"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            placeholder="F.eks. Hepro Respons Admin 2025"
            disabled={isUploading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="document-description">Beskrivelse (valgfritt)</Label>
          <Input
            id="document-description"
            value={documentDescription}
            onChange={(e) => setDocumentDescription(e.target.value)}
            placeholder="Kort beskrivelse av dokumentets innhold"
            disabled={isUploading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file-upload">Velg fil *</Label>
          
          {/* Drag and Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragOver 
                ? 'border-tech-blue bg-tech-blue/10' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleDragAreaClick}
          >
            <UploadCloud className={`h-12 w-12 mx-auto mb-3 ${
              isDragOver ? 'text-tech-blue' : 'text-muted-foreground'
            }`} />
            
            {selectedFile ? (
              <div>
                <p className="font-medium text-foreground">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {Math.round(selectedFile.size / 1024)} KB
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Klikk for å velge annen fil
                </p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-foreground mb-1">
                  Dra filen hit eller klikk for å velge
                </p>
                <p className="text-sm text-muted-foreground">
                  Støtter .txt, .md, .pdf filer
                </p>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <Input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept=".txt,.md,.pdf"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
        </div>

        <Button 
          onClick={handleUpload} 
          disabled={!selectedFile || !documentTitle.trim() || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Laster opp...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Last opp dokument
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};