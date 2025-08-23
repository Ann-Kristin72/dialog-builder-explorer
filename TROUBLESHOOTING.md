# 🔍 TROUBLESHOOTING GUIDE - TEKNOTASSEN AZURE AD B2C

## 📋 **OPPSUMMERING**
Komplett guide for debugging Azure AD B2C integrasjon problemer i TeknoTassen frontend.

---

## 🚨 **KRITISKE PROBLEMER OG LØSNINGER**

### **1. INFINITE SPINNER PROBLEM**

#### **Symptomer:**
- Appen spinner for evig på "Initialiserer Azure AD B2C..."
- Ingen console logging vises
- Ready state settes aldri til true

#### **Årsaker:**
- `waitForReady()` metoden venter på noe som allerede eksisterer
- MSAL initialisering henger fast
- Race condition mellom MSAL og demo mode

#### **Løsninger:**
```typescript
// I AuthContext, sørg for at ready settes ALLTID
finally {
  setIsLoading(false);
  setReady(true); // ALWAYS set to true to avoid infinite spinner
}
```

---

### **2. DEMO MODE FALLBACK PROBLEM**

#### **Symptomer:**
- Console viser "🔧 Demo mode enabled - using local authentication"
- Azure AD B2C callback ignoreres
- Frontend faller tilbake til localStorage

#### **Årsaker:**
- AuthBootstrap kjøres ikke
- Race condition - demo mode "vinner" over MSAL
- Callback detection feiler

#### **Løsninger:**
```typescript
// CTO's AuthBootstrap pattern
useEffect(() => {
  (async () => {
    // Wait for MSAL to be ready FIRST
    await authService.waitForReady();
    
    // Handle redirect promise FIRST
    const resp = await authService.handleRedirectPromise();
    
    // Auto-login if no account
    if (!acct) {
      await authService.loginRedirectWithQueryMode();
      return;
    }
  })();
}, []);
```

---

### **3. CALLBACK DETECTION PROBLEM**

#### **Symptomer:**
- Azure AD B2C returnerer med `code=` parameter
- Men frontend faller tilbake til demo mode
- Ingen MSAL logging vises

#### **Årsaker:**
- Hash vs query params mismatch
- `window.location.href.includes('code=')` fungerer ikke
- Callback detection feiler

#### **Løsninger:**
```typescript
// Bruk både href og hash for callback detection
const hasCallback = window.location.href.includes('code=') || 
                   window.location.hash.includes('code=') ||
                   window.location.href.includes('id_token=') || 
                   window.location.hash.includes('id_token=');
```

---

### **4. MSAL KONFIGURASJON PROBLEM**

#### **Symptomer:**
- Console viser "🌐 Authority: B2C_1_B2C_1A_" (bare policy navn)
- MSAL feiler med authority feil
- Redirect fungerer ikke

#### **Årsaker:**
- Authority mangler full URL
- Policy navn er feil
- Environment variables er ikke satt

#### **Løsninger:**
```typescript
// Riktig authority format
authority: 'https://teknotassenb2c.b2clogin.com/teknotassenb2c.onmicrosoft.com/B2C_1_B2C_1A_'

// Environment variables
VITE_OIDC_CLIENT_ID=your-client-id
VITE_OIDC_AUTHORITY=https://teknotassenb2c.b2clogin.com/teknotassenb2c.onmicrosoft.com/B2C_1_B2C_1A_
VITE_REDIRECT_URI=https://your-vercel-url.vercel.app
```

---

## 🔍 **CONSOLE LOGGING GUIDE**

### **Forventet MSAL Logging:**
```
🔐 Azure AD B2C mode enabled - using MSAL authentication
🔑 Client ID: [client-id]
🌐 Authority: [full-authority-url]
✅ MSAL initialized successfully
[MSAL] [timestamp] : [] : @azure/msal-browser@version : Info - MSAL.js was last initialized by version: version
```

### **Forventet AuthBootstrap Logging:**
```
🔍 Starting CTO AuthBootstrap...
✅ MSAL is ready, proceeding with auth bootstrap
✅ Got redirect response, setting active account
🔍 No account found, starting login...
```

### **Vanlige Feil Logging:**
```
❌ MSAL initialization failed: [error]
❌ Auth bootstrap error: [error]
❌ Complete login error: [error]
```

---

## 🛠️ **DEBUGGING STEPS**

### **Steg 1: Verifiser Vercel Deploy**
1. **Sjekk Vercel dashboard** - Er deploy ferdig?
2. **Sjekk commit hash** - Matcher den siste push?
3. **Sjekk "Deployment Protection"** - Er den deaktivert?

### **Steg 2: Browser Cache Clearing**
1. **Hard refresh** - Ctrl+F5 (Windows) eller Cmd+Shift+R (Mac)
2. **Clear browser cache** - Developer Tools → Application → Storage
3. **Incognito/Private mode** - Test uten cache

### **Steg 3: Console Logging Sjekk**
1. **Åpne Developer Tools** - F12
2. **Console tab** - Se etter MSAL og AuthBootstrap logging
3. **Network tab** - Sjekk om JavaScript filer lastes

### **Steg 4: Environment Variables**
1. **Sjekk Vercel** - Er alle variabler satt?
2. **Sjekk .env filer** - Lokale variabler
3. **Verifiser verdier** - Er de riktige?

---

## 📋 **CHECKLIST FOR NY CHAT**

### **Umiddelbar Diagnostikk:**
- [ ] **Vercel deploy status** - Er deploy ferdig?
- [ ] **Console logging** - Viser AuthBootstrap?
- [ ] **Browser cache** - Hard refresh testet?
- [ ] **Environment variables** - Er alle satt?

### **Azure AD B2C Sjekk:**
- [ ] **App Registration** - Redirect URIs riktige?
- [ ] **User Flows** - Publisert og kjører?
- [ ] **Client ID** - Matcher Vercel?
- [ ] **Authority URL** - Full URL, ikke bare policy?

### **Kode Verifisering:**
- [ ] **AuthBootstrap** - Implementert i AuthContext?
- [ ] **Public metoder** - Eksisterer i AuthService?
- [ ] **MSAL config** - Riktig authority format?
- [ ] **Ready state** - Settes til true?

---

## 🎯 **FORVENTET RESULTAT**

### **Etter Riktig Implementering:**
1. **Appen starter** - Ingen infinite spinner
2. **MSAL initialiseres** - Console logging vises
3. **AuthBootstrap kjører** - Auto-login hvis ingen konto
4. **Azure AD B2C redirect** - Login flow starter
5. **Callback håndteres** - Bruker logges inn
6. **Dashboard vises** - Ingen demo mode fallback

---

## 📚 **NYTTIGE KOMMANDOER**

### **Git Status:**
```bash
git status
git log --oneline -5
git diff HEAD~1
```

### **Vercel Deploy:**
```bash
vercel --prod
vercel logs
```

### **Local Testing:**
```bash
npm run dev
npm run build
npm run preview
```

---

## 🚨 **KRITISKE FILER Å SJEKKE**

### **Hovedfiler:**
- `src/services/authService.ts` - MSAL konfigurasjon
- `src/contexts/AuthContext.tsx` - AuthBootstrap implementasjon
- `src/App.tsx` - Routing struktur
- `env.example` - Environment variables

### **Konfigurasjon:**
- `tailwind.config.ts` - Design system
- `vercel.json` - Vercel konfigurasjon
- `package.json` - Dependencies

---

*Sist oppdatert: 23. august 2025*
*Status: Komplett troubleshooting guide*
