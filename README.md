# 🚀 **TeknoTassen - AI-Assistent for Teknisk Kunnskap**

> En RAG-drevet AI-assistent bygget med moderne teknologi for å hjelpe med teknisk kunnskap og kurs

## 📋 **Hva er TeknoTassen?**

TeknoTassen er en intelligent AI-assistent som bruker **Retrieval-Augmented Generation (RAG)** for å gi presise, kontekstuelle svar basert på kursinnhold og teknisk dokumentasjon.

### **🎯 Hovedfunksjoner**
- **🤖 RAG-Powered AI Chat** - Intelligent samtale basert på kursinnhold
- **📚 Kurs Opplasting** - Last opp markdown-filer med Nano/Unit struktur
- **🔍 Semantisk Søk** - Finn relevant informasjon med AI-embeddings
- **🎨 Moderne UI** - Responsivt design med Tailwind CSS og shadcn/ui
- **🔐 Sikker Autentisering** - Azure AD B2C med OIDC (Demo Mode tilgjengelig)
- **☁️ Cloud-Native** - Bygget for Azure og Vercel
- **🖼️ Bildehåndtering** - Viser bilder fra Markdown-filer og direkte URLer
- **🧠 Intelligent Respons** - Konsistent og forutsigbare svar fra TeknoTassen
- **💾 Persistent Lagring** - Dokumenter huskes mellom sesjoner

## 🏗️ **Teknologi Stack**

### **Frontend**
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** komponenter
- **React Router** for navigasjon
- **Lottie** for animasjoner

### **Backend**
- **Node.js** + **Express.js**
- **LangChain** for RAG pipeline
- **OpenAI API** for embeddings og chat
- **PostgreSQL** + **pgvector** for vector storage

### **Infrastruktur**
- **Azure Web App (Linux) for Containers** (Backend)
- **Azure PostgreSQL** med pgvector
- **Azure Blob Storage** for filer
- **Azure Key Vault** for secrets
- **Vercel** (Frontend)

## 🚀 **Hurtig Start**

### **Forutsetninger**
- Node.js 18+
- PostgreSQL med pgvector extension
- Azure konto (for production)
- OpenAI API key

### **Lokalt Utvikling**
```bash
# Klone repository
git clone https://github.com/your-username/dialog-builder-explorer.git
cd dialog-builder-explorer

# Installer dependencies
npm install
cd backend && npm install

# Start frontend (port 8080)
npm run dev

# Start backend (port 80)
cd backend && npm run dev
```

### **Environment Variables**
```bash
# Backend (.env)
OPENAI_API_KEY=your-openai-key
POSTGRES_URL=postgresql://user:pass@localhost:5432/teknotassen
NODE_ENV=development

# Frontend (.env.local)
NEXT_PUBLIC_BACKEND_URL=http://localhost:80
```

## 🤖 **TeknoTassen AI-Assistent**

### **🎯 Hva kan TeknoTassen?**
TeknoTassen er en intelligent AI-assistent som kan:
- **Svare på spørsmål** om velferdsteknologi (HEPRO Respons, Digital Tilsyn, DPIA, ROS, Varda Care, Aula)
- **Lese opplastede dokumenter** og gi presise svar basert på innholdet
- **Vise bilder** fra Markdown-filer og direkte URLer
- **Gi veiledning** gjennom komplekse prosesser steg for steg
- **Huske dokumenter** permanent mellom sesjoner

### **🔧 Demo Mode**
- **Fungerer uten backend** - perfekt for testing og demo
- **Intelligente forhåndsdefinerte svar** for vanlige spørsmål
- **Dokument-søk** i opplastede Markdown-filer
- **Bildehåndtering** med riktig formatering

### **📚 Dokumenttyper Støttet**
- **Markdown (.md)** med bilde-URLer
- **Direkte bilde-URLer** (jpg, jpeg, png, gif, webp)
- **Strukturerte seksjoner** med overskrifter (# ## ### ####)

## 📚 **Dokumentasjon**

### **📖 Komplett Teknisk Dokumentasjon**
- **[AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md)** - Detaljert Azure setup og deployment
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Frontend deployment til Vercel

### **🔧 Utvikling**
- **[Backend API](./backend/README.md)** - Backend endpoints og services
- **[Frontend Components](./src/components/)** - React komponenter
- **[Database Schema](./AZURE_DEPLOYMENT.md#database-schema)** - PostgreSQL tabeller og indekser

### **🚀 Deployment**
- **[Azure Backend](./AZURE_DEPLOYMENT.md#azure-deployment-pipeline)** - GitHub Actions pipeline
- **[Vercel Frontend](./VERCEL_DEPLOYMENT.md)** - Frontend deployment guide

## 🔧 **Nylige Forbedringer (Siste Chat)**

### **✅ TeknoTassen AI-Assistent**
- **Fikset hikkup på svar** - konsistent og forutsigbare responser
- **Forbedret søkealgoritme** - mer presis informasjon fra dokumenter
- **Persistent dokumentlagring** - dokumenter huskes permanent
- **Bildehåndtering** - viser bilder fra Markdown-filer og direkte URLer
- **Intelligent respons-logikk** - 3-prioritets system for svar

### **🎯 Respons-Prioritering**
1. **Dokumenter først** - søker i opplastede filer (score ≥ 2)
2. **Forhåndsdefinerte svar** - keyword matching for vanlige spørsmål
3. **Fallback-veiledning** - hjelpsom informasjon når ingenting matcher

### **🖼️ Bildehåndtering**
- **Markdown-bilder**: `![Alt Text](URL)` → vises med emoji og formatering
- **Direkte URLer**: `https://example.com/image.jpg` → automatisk bilde-gjenkjenning
- **HTML-formatering** - bilder vises med styling og fallback

## 🎯 **Prosjekt Status**

### **✅ Fullført**
- [x] Frontend UI med React + TypeScript
- [x] Backend API med Express + LangChain
- [x] RAG pipeline med OpenAI embeddings
- [x] Azure infrastruktur setup
- [x] GitHub Actions deployment pipeline
- [x] Alle kritiske kode-fixes implementert
- [x] TeknoTassen AI-assistent med intelligent respons
- [x] Bildehåndtering fra Markdown-filer
- [x] Persistent dokumentlagring
- [x] Demo Mode for testing
- [x] Responsiv chat-interface
- [x] Markdown parsing og formatering

### **🚧 Under Utvikling**
- [ ] Azure B2C autentisering (Demo Mode fungerer)
- [ ] Backend RAG-integrasjon (Frontend Demo Mode komplett)
- [ ] Database migrations
- [ ] Kurs opplasting og parsing
- [ ] TTS/STT integrasjon

### **📋 Planlagt**
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Advanced RAG features
- [ ] Multi-modal support

## 🐛 **Troubleshooting**

### **Vanlige Problemer**
- **Backend starter ikke:** Sjekk import statements og environment variables
- **Database connection failed:** Verifiser PostgreSQL connection string
- **Azure deployment feiler:** Sjekk GitHub Secrets og RBAC permissions

### **Debug Commands**
```bash
# Backend health check
curl http://localhost:80/healthz

# Database connection test
curl http://localhost:80/api/courses/test-db

# Azure Web App logs
az webapp log tail --name web-teknotassen --resource-group teknotassen-rg
```

## 🤝 **Bidrag**

### **Utvikling**
1. Fork repository
2. Opprett feature branch (`git checkout -b feature/amazing-feature`)
3. Commit endringer (`git commit -m 'Add amazing feature'`)
4. Push til branch (`git push origin feature/amazing-feature`)
5. Opprett Pull Request

### **Rapportere Bugs**
- Bruk GitHub Issues
- Inkluder detaljert beskrivelse og repro steps
- Legg til logs og error messages

## 📄 **Lisens**

Dette prosjektet er lisensiert under MIT License - se [LICENSE](LICENSE) filen for detaljer.

## 📞 **Kontakt**

### **Team**
- **Kristil** - Backend development, Azure infrastructure
- **Ann-Kristin** - Frontend development, project management

### **Ressurser**
- **GitHub:** [dialog-builder-explorer](https://github.com/your-username/dialog-builder-explorer)
- **Azure Portal:** [web-teknotassen](https://web-teknotassen.azurewebsites.net)
- **Vercel:** [teknotassen.vercel.app](https://teknotassen.vercel.app)

---

## 🎉 **Takk for at du bruker TeknoTassen!**

Hvis du liker dette prosjektet, vennligst gi det en ⭐ på GitHub!

---

**📝 Sist oppdatert:** August 2025  
**🔧 Status:** Backend klar for deployment, Frontend klar for Vercel
