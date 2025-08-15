# 🚀 TeknoTassen - Vercel Deployment Guide

## 📋 Forutsetninger

- **Vercel konto** - [Registrer deg her](https://vercel.com/signup)
- **GitHub repository** - TeknoTassen kode
- **OIDC provider** - Azure AD eller ID-porten

## 🚀 Deployment på Vercel

### **Steg 1: Koble til GitHub**

1. Gå til [Vercel Dashboard](https://vercel.com/dashboard)
2. Klikk "New Project"
3. Velg "Import Git Repository"
4. Velg `dialog-builder-explorer` repository
5. Klikk "Import"

### **Steg 2: Konfigurer prosjekt**

```bash
# Framework Preset
Framework Preset: Vite

# Build Settings
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### **Steg 3: Miljøvariabler**

Legg til følgende miljøvariabler i Vercel:

```bash
# OIDC konfigurasjon
VITE_OIDC_ISSUER=https://login.microsoftonline.com/YOUR_TENANT_ID/v2.0
VITE_OIDC_CLIENT_ID=your-azure-ad-client-id
VITE_TENANT_ID=your-azure-ad-tenant-id

# API konfigurasjon
VITE_API_URL=https://your-api-domain.com

# App konfigurasjon
VITE_APP_NAME=TeknoTassen
VITE_APP_ENVIRONMENT=production
```

### **Steg 4: Deploy**

1. Klikk "Deploy"
2. Vent på build og deployment
3. Din app er nå live på `https://your-project.vercel.app`

## 🔧 Azure AD OIDC Oppsett

### **1. Registrer app i Azure AD**

1. Gå til [Azure Portal](https://portal.azure.com)
2. Azure Active Directory → App registrations
3. New registration
4. Navn: `TeknoTassen`
5. Redirect URI: `https://your-domain.vercel.app/auth/callback`

### **2. Konfigurer OIDC**

```json
{
  "authority": "https://login.microsoftonline.com/YOUR_TENANT_ID/v2.0",
  "client_id": "YOUR_CLIENT_ID",
  "redirect_uri": "https://your-domain.vercel.app/auth/callback",
  "scope": "openid profile email"
}
```

### **3. Hent konfigurasjon**

- **Tenant ID**: Azure AD → Overview → Tenant ID
- **Client ID**: App registration → Overview → Application (client) ID

## 🇳🇴 ID-porten Oppsett (Norge)

### **1. Registrer app i ID-porten**

1. Gå til [ID-porten Utvikler](https://difi.github.io/idporten-oidc-docs/)
2. Følg registreringsprosessen
3. Redirect URI: `https://your-domain.vercel.app/auth/callback`

### **2. Konfigurer OIDC**

```json
{
  "authority": "https://oidc-ver2.difi.no/idporten-oidc-provider",
  "client_id": "YOUR_IDPORTEN_CLIENT_ID",
  "redirect_uri": "https://your-domain.vercel.app/auth/callback",
  "scope": "openid profile"
}
```

## 🌐 Subdomene og Custom Domain

### **1. Vercel Custom Domain**

1. Prosjekt → Settings → Domains
2. Legg til: `teknotassen.your-domain.com`
3. Følg DNS-instruksjoner

### **2. Kommune-spesifikke subdomener**

```bash
# Eksempel subdomener
https://oslo.teknotassen.no
https://bergen.teknotassen.no
https://trondheim.teknotassen.no
```

## 🔗 iframe Integrasjon

### **1. Teams Integration**

```html
<iframe 
  src="https://your-domain.vercel.app"
  width="100%" 
  height="700px"
  frameborder="0"
  allow="microphone; camera; geolocation"
></iframe>
```

### **2. SharePoint Integration**

```html
<iframe 
  src="https://your-domain.vercel.app"
  style="width: 100%; height: 700px; border: none;"
></iframe>
```

### **3. Intranett Integration**

```html
<div class="teknotassen-iframe">
  <iframe 
    src="https://your-domain.vercel.app"
    width="100%" 
    height="700px"
    title="TeknoTassen - Velferdsteknologi Assistent"
  ></iframe>
</div>
```

## 🛡️ Sikkerhet

### **1. Content Security Policy**

Vercel.json inneholder allerede riktig CSP:

```json
{
  "Content-Security-Policy": "frame-ancestors 'self' *; default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
}
```

### **2. X-Frame-Options**

```json
{
  "X-Frame-Options": "ALLOWALL"
}
```

## 📱 Responsiv Design

### **1. iframe Optimalisering**

- **Minimal høyde**: 600px
- **Optimal høyde**: 700px
- **Padding**: 16px i iframe-modus
- **Header**: Skjules i iframe-modus

### **2. Mobile Optimalisering**

- **Touch-friendly** knapper
- **Responsive** layout
- **Optimal** for 320px+ bredde

## 🚀 Performance

### **1. Build Optimalisering**

- **Code splitting** med Vite
- **Lazy loading** av komponenter
- **Tree shaking** for ubrukt kode

### **2. Vercel Edge Functions**

```typescript
// api/auth.ts
export default function handler(req, res) {
  // OIDC callback håndtering
  res.status(200).json({ message: 'Auth callback' });
}
```

## 🔍 Troubleshooting

### **1. Build Feil**

```bash
# Sjekk dependencies
npm install

# Clean build
rm -rf dist node_modules
npm install
npm run build
```

### **2. OIDC Feil**

- Sjekk redirect URI i Azure AD/ID-porten
- Verifiser client ID og tenant ID
- Test med Postman først

### **3. iframe Problemer**

- Sjekk CSP headers
- Verifiser X-Frame-Options
- Test i ulike browsere

## 📞 Support

- **Vercel Support**: [Vercel Help](https://vercel.com/help)
- **Azure AD**: [Microsoft Docs](https://docs.microsoft.com/azure/active-directory)
- **ID-porten**: [Difi Dokumentasjon](https://difi.github.io/idporten-oidc-docs/)

---

**🎉 Gratulerer! Din TeknoTassen app er nå deployet på Vercel med OIDC og iframe-støtte!**
