# Aula – Hvordan vi håndterer dine data

## 🔹 Hvordan vi samler data
- Vi lagrer kun det som er nødvendig for kursgjennomføring (navn, e-post, progresjon, resultater).
- Pålogging skjer gjennom Azure B2C med multifaktorautentisering.
- Vi samler ikke tredjeparts-cookies eller ekstern sporing.

## 🔹 Hvordan vi lagrer
- Data lagres i Azure West Europe (EU/EØS).
- PostgreSQL: brukere, kursdata og progresjon.
- Blob Storage: kursinnhold (tekst, video, bilder).
- Key Vault: passord og API-nøkler.
- Alt er kryptert både i ro (at rest) og under overføring (in transit).

## 🔹 Hvem har tilgang
- Kun autoriserte ansatte i Dynamisk Helse, med MFA og rollebasert tilgang.
- Ingen data selges eller deles med tredjeparter.

## 🔹 Dine rettigheter
- **Innsyn:** du kan be om oversikt over alle data vi lagrer om deg.  
- **Sletting:** du kan be om sletting (retten til å bli glemt).  
- **Kontaktpunkt:** [sett inn e-post til databehandleransvarlig]

## 🔹 Tekniske detaljer
- **Backend:** Azure Web App med Node.js/Express
- **Database:** Azure PostgreSQL med pgvector for AI-embeddings
- **Storage:** Azure Blob Storage for kursfiler
- **Security:** Azure Key Vault for sensitive data
- **Authentication:** Azure AD B2C med OIDC
- **Encryption:** AES-256 for data i ro, TLS 1.3 for overføring

## 🔹 GDPR compliance
- **Legal basis:** Kontrakt (kursgjennomføring)
- **Data retention:** Slettes automatisk etter 5 år
- **Data portability:** Eksport av dine data på forespørsel
- **Right to be forgotten:** Full sletting av alle data

---

✨ **Kort sagt:** Vi samler kun det vi må, vi lagrer det trygt, og du har full kontroll over dine egne data.

*Sist oppdatert: Januar 2025*
