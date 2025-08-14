import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DocumentUpload } from "./DocumentUpload";
import { Trash2, FileText, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  title: string;
  description?: string;
  content: string;
  created_at: string;
}

export const KnowledgeManager = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const { toast } = useToast();

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      // Load documents from localStorage instead of Supabase
      const storedDocs = localStorage.getItem('knowledge_documents');
      const data = storedDocs ? JSON.parse(storedDocs) : [];
      setDocuments(data);
      console.log("Loaded", data.length, "documents from localStorage");
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: "Kunne ikke laste dokumenter",
        description: "Sjekk at localStorage fungerer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDocument = async (id: string, title: string) => {
    try {
      // Remove document from localStorage
      const storedDocs = JSON.parse(localStorage.getItem('knowledge_documents') || '[]');
      const updatedDocs = storedDocs.filter((doc: Document) => doc.id !== id);
      localStorage.setItem('knowledge_documents', JSON.stringify(updatedDocs));
      
      setDocuments(updatedDocs);
      toast({
        title: "Dokument slettet",
        description: `"${title}" ble fjernet fra kunnskapsbasen`,
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Feil ved sletting",
        description: "Kunne ikke slette dokumentet",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('no-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <DocumentUpload onDocumentUploaded={loadDocuments} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Kunnskapsbase ({documents.length} dokumenter)
          </CardTitle>
          <CardDescription>
            Dokumenter som TeknoTassen kan bruke for å gi bedre svar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Laster dokumenter...</p>
          ) : documents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Ingen dokumenter lastet opp ennå. Last opp ditt første dokument over! 📚
            </p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <h3 className="font-medium">{doc.title}</h3>
                      {doc.description && (
                        <p className="text-sm text-muted-foreground">{doc.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(doc.created_at)}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(doc.content.length / 1000)}k tegn
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                      >
                        {expandedDoc === doc.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDocument(doc.id, doc.title)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {expandedDoc === doc.id && (
                    <div className="mt-3 p-3 bg-muted/50 rounded text-sm">
                      <p className="whitespace-pre-wrap line-clamp-10">
                        {doc.content.substring(0, 500)}
                        {doc.content.length > 500 && "..."}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};