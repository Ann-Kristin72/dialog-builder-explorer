import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadProps {
  onDocumentUploaded?: () => void;
}

export const DocumentUpload = ({ onDocumentUploaded }: DocumentUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
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

  const processDocument = async (text: string, title: string, description: string) => {
    try {
      // Split document into chunks for better search
      const chunks = text.match(/.{1,1000}(?:\s|$)/g) || [text];
      
      const documentData = {
        title,
        description,
        content: text,
        chunks: chunks,
        created_at: new Date().toISOString(),
      };

      const backendUrl = import.meta.env.VITE_API_URL || 'https://web-teknotassen-erf2emgebjh7cydy.norwayeast-01.azurewebsites.net';
      console.log('🌐 Using backend URL for upload:', backendUrl);
      
      const response = await fetch(`${backendUrl}/api/courses/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

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

    try {
      const text = await selectedFile.text();
      await processDocument(text, documentTitle, documentDescription);
      
      // Reset form
      setSelectedFile(null);
      setDocumentTitle("");
      setDocumentDescription("");
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: "Feil ved lesing av fil",
        description: "Kunne ikke lese filen. Kontroller at det er en tekstfil.",
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
          <Input
            id="file-upload"
            type="file"
            accept=".txt,.md,.pdf"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          {selectedFile && (
            <p className="text-sm text-muted-foreground">
              Valgt fil: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
            </p>
          )}
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