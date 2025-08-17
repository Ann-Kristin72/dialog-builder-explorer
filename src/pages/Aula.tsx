import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AulaPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tilbake
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Aula – Hvordan vi håndterer dine data
            </h1>
          </div>
          
          <p className="text-gray-600 text-lg">
            Din personvern og datasikkerhet er viktig for oss. Her kan du lese om hvordan vi håndterer dine data.
          </p>
        </div>

        {/* Content Cards */}
        <div className="space-y-6">
          {/* Data Collection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-blue-600">🔹</span>
                Hvordan vi samler data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>Vi lagrer kun det som er nødvendig for kursgjennomføring:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Navn og e-post for identifikasjon</li>
                <li>Kursprogresjon og resultater</li>
                <li>Påloggingsdata (Azure B2C med MFA)</li>
              </ul>
              <p className="text-sm text-gray-600 mt-2">
                Vi samler <strong>ikke</strong> tredjeparts-cookies eller ekstern sporing.
              </p>
            </CardContent>
          </Card>

          {/* Data Storage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-green-600">🔹</span>
                Hvordan vi lagrer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>Data lagres trygt i Azure West Europe (EU/EØS):</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li><strong>PostgreSQL:</strong> brukere, kursdata og progresjon</li>
                <li><strong>Blob Storage:</strong> kursinnhold (tekst, video, bilder)</li>
                <li><strong>Key Vault:</strong> passord og API-nøkler</li>
              </ul>
              <p className="text-sm text-gray-600 mt-2">
                Alt er kryptert både i ro (at rest) og under overføring (in transit).
              </p>
            </CardContent>
          </Card>

          {/* Access Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-purple-600">🔹</span>
                Hvem har tilgang
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Kun autoriserte ansatte i Dynamisk Helse</li>
                <li>MFA (Multi-Factor Authentication) påkrevd</li>
                <li>Rollebasert tilgang (RBAC)</li>
                <li>Ingen data selges eller deles med tredjeparter</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-orange-600">🔹</span>
                Dine rettigheter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li><strong>Innsyn:</strong> du kan be om oversikt over alle data vi lagrer om deg</li>
                <li><strong>Sletting:</strong> du kan be om sletting (retten til å bli glemt)</li>
                <li><strong>Kontaktpunkt:</strong> [sett inn e-post til databehandleransvarlig]</li>
              </ul>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-indigo-600">🔹</span>
                Tekniske detaljer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li><strong>Backend:</strong> Azure Web App med Node.js/Express</li>
                <li><strong>Database:</strong> Azure PostgreSQL med pgvector for AI-embeddings</li>
                <li><strong>Storage:</strong> Azure Blob Storage for kursfiler</li>
                <li><strong>Security:</strong> Azure Key Vault for sensitive data</li>
                <li><strong>Authentication:</strong> Azure AD B2C med OIDC</li>
                <li><strong>Encryption:</strong> AES-256 for data i ro, TLS 1.3 for overføring</li>
              </ul>
            </CardContent>
          </Card>

          {/* GDPR Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-red-600">🔹</span>
                GDPR compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li><strong>Legal basis:</strong> Kontrakt (kursgjennomføring)</li>
                <li><strong>Data retention:</strong> Slettes automatisk etter 5 år</li>
                <li><strong>Data portability:</strong> Eksport av dine data på forespørsel</li>
                <li><strong>Right to be forgotten:</strong> Full sletting av alle data</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card className="mt-8 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="text-center">
              <ShieldCheck className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                Kort sagt
              </h2>
              <p className="text-green-700 text-lg">
                Vi samler kun det vi må, vi lagrer det trygt, og du har full kontroll over dine egne data.
              </p>
              <p className="text-sm text-green-600 mt-2">
                Sist oppdatert: Januar 2025
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
