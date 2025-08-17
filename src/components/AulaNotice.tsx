import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck } from "lucide-react"

interface AulaNoticeProps {
  showLink?: boolean;
}

export default function AulaNotice({ showLink = true }: AulaNoticeProps) {
  return (
    <Card className="mt-4 border-l-4 border-green-600 bg-green-50">
      <CardContent className="flex items-start gap-3 p-4 text-sm text-gray-700">
        <ShieldCheck className="h-5 w-5 text-green-700 shrink-0" />
        <div>
          <p className="mb-1">
            🔒 Vi samler kun det som er nødvendig for kursene dine
            (navn, e-post, progresjon). Alt lagres trygt i EU (Azure),
            kryptert og beskyttet. Du har alltid rett til innsyn og sletting.
          </p>
          {showLink && (
            <a
              href="/aula"
              className="text-green-700 hover:underline font-medium cursor-pointer"
            >
              Les mer →
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
