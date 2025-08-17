# 🚀 **Vercel Frontend Deployment Guide**

## 📋 **Status: READY FOR DEPLOYMENT** (venter på backend)

### **✅ Frontend er klar:**
- Vite config optimalisert ✅
- Vercel scripts i package.json ✅
- vercel.json konfigurert ✅
- Build optimalisering ✅
- CORS headers konfigurert ✅
- Privacy policy (Aula) implementert ✅

### **🔗 Backend Dependency:**
- **Azure Web App:** `https://web-teknotassen.azurewebsites.net`
- **Health Check:** `/healthz`
- **API Base:** `/api/*`
- **Status:** 🟡 Backend klar for deployment test

---

## 🏗️ **Frontend Arkitektur**

### **Komponent Struktur**
```
src/
├── components/
│   ├── ui/              # shadcn/ui komponenter
│   ├── ChatInterface.tsx # Hovedchat UI med RAG
│   ├── DocumentUpload.tsx # Kurs opplasting modal
│   ├── FeatureCard.tsx  # Funksjoner oversikt
│   ├── Login.tsx        # Azure B2C login
│   ├── AulaNotice.tsx   # Privacy notice
│   └── Header.tsx       # Navigasjon
├── pages/
│   ├── Index.tsx        # Hovedside med tabs
│   ├── NotFound.tsx     # 404 side
│   └── Aula.tsx         # Full privacy policy
└── assets/
    ├── teknotassen-avatar.jpg
    └── vera-avatar.jpg
```

### **Routing Struktur**
- **`/`** - Hovedside (chat, features, technologies)
- **`/login`** - Azure B2C autentisering
- **`/aula`** - Privacy policy (offentlig tilgjengelig)
- **`/not-found`** - 404 side

---

## ⚙️ **Vercel Konfigurasjon**

### **vercel.json**
```json
{
  "buildCommand": "npm run build:vercel",
  "outputDirectory": "dist",
  "framework": "vite",
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

### **package.json Scripts**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:vercel": "vite build",
    "vercel-build": "vite build",
    "vercel-dev": "vite dev",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

### **Vite Config (vite.config.ts)**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@/components/ui']
        }
      }
    }
  }
})
```

---

## 🔐 **Environment Variables**

### **Required for Vercel**
```bash
# Azure B2C Authentication
NEXT_PUBLIC_OIDC_AUTHORITY=https://teknotassen.b2clogin.com/teknotassen.onmicrosoft.com/B2C_1_signupsignin
NEXT_PUBLIC_OIDC_CLIENT_ID=your-client-id-here
NEXT_PUBLIC_OIDC_TENANT_ID=teknotassen.onmicrosoft.com
NEXT_PUBLIC_OIDC_POLICY=B2C_1_signupsignin
NEXT_PUBLIC_REDIRECT_URI=https://teknotassen.vercel.app/auth/callback

# Backend API
NEXT_PUBLIC_BACKEND_URL=https://web-teknotassen.azurewebsites.net

# Feature Flags
NEXT_PUBLIC_ENABLE_UPLOAD=true
NEXT_PUBLIC_ENABLE_TTS=true
NEXT_PUBLIC_ENABLE_STT=true
```

### **Optional for Development**
```bash
# Local development
NEXT_PUBLIC_BACKEND_URL=http://localhost:8181
NEXT_PUBLIC_ENABLE_MOCK_DATA=true
```

---

## 🚀 **Deployment Steps**

### **1. Vercel CLI Setup**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project (first time)
vercel link
```

### **2. Environment Variables Setup**
```bash
# Set environment variables
vercel env add NEXT_PUBLIC_OIDC_AUTHORITY
vercel env add NEXT_PUBLIC_OIDC_CLIENT_ID
vercel env add NEXT_PUBLIC_OIDC_TENANT_ID
vercel env add NEXT_PUBLIC_OIDC_POLICY
vercel env add NEXT_PUBLIC_REDIRECT_URI
vercel env add NEXT_PUBLIC_BACKEND_URL
```

### **3. Deploy to Vercel**
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### **4. Automatic Deployments**
- **GitHub Integration:** Push til `main` branch
- **Preview Deployments:** Alle pull requests
- **Production:** Merge til `main`

---

## 🔧 **Build Optimization**

### **Bundle Analysis**
```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Analyze build
npm run build:analyze
```

### **Performance Optimizations**
- **Code Splitting:** React.lazy() for route-based splitting
- **Tree Shaking:** ES modules for unused code removal
- **Image Optimization:** Next.js Image component
- **Font Loading:** Font display swap for better performance

### **Caching Strategy**
```typescript
// Service Worker for offline support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
```

---

## 🌐 **CORS og API Integration**

### **Backend CORS Configuration**
```javascript
// backend/src/server.js
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://teknotassen.vercel.app', 'https://web-teknotassen.azurewebsites.net']
    : ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:3000'],
  credentials: true,
}));
```

### **Frontend API Calls**
```typescript
// src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8181';

export const apiClient = {
  async query(question: string, options?: QueryOptions) {
    const response = await fetch(`${API_BASE}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, ...options })
    });
    return response.json();
  },
  
  async uploadCourse(file: File, metadata: CourseMetadata) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    
    const response = await fetch(`${API_BASE}/api/courses/ingest`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  }
};
```

---

## 🎨 **UI/UX Features**

### **Responsive Design**
- **Mobile First:** Tailwind CSS breakpoints
- **Touch Friendly:** Large touch targets
- **Progressive Enhancement:** Core functionality works everywhere

### **Accessibility**
- **ARIA Labels:** Screen reader support
- **Keyboard Navigation:** Full keyboard support
- **Color Contrast:** WCAG AA compliance
- **Focus Management:** Visible focus indicators

### **Performance Indicators**
- **Loading States:** Skeleton screens
- **Progress Bars:** Upload progress
- **Error Boundaries:** Graceful error handling
- **Offline Support:** Service worker caching

---

## 🔍 **Testing og QA**

### **Local Testing**
```bash
# Start development server
npm run dev

# Run tests
npm run test

# Build test
npm run build

# Preview build
npm run preview
```

### **Vercel Preview Testing**
- **Preview URLs:** Automatisk generert for PRs
- **Environment Testing:** Separate preview environment
- **Performance Testing:** Vercel Analytics integration

### **Cross-Browser Testing**
- **Chrome/Edge:** Latest versions
- **Firefox:** Latest version
- **Safari:** macOS and iOS
- **Mobile:** Responsive design testing

---

## 📊 **Analytics og Monitoring**

### **Vercel Analytics**
```typescript
// Automatic performance monitoring
// No additional setup required
```

### **Error Tracking**
```typescript
// Error boundary for React components
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
  }
}
```

### **Performance Monitoring**
- **Core Web Vitals:** LCP, FID, CLS
- **Bundle Size:** Automatic tracking
- **Build Time:** Optimization monitoring
- **Deployment Speed:** CI/CD metrics

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. Build Failures**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run lint
```

#### **2. Environment Variables**
```bash
# Verify environment variables
vercel env ls

# Check in browser console
console.log(process.env.NEXT_PUBLIC_BACKEND_URL)
```

#### **3. CORS Issues**
- Verify backend CORS configuration
- Check domain in allowed origins
- Ensure credentials setting matches

#### **4. API Connection**
```bash
# Test backend health
curl https://web-teknotassen.azurewebsites.net/healthz

# Check network tab in browser
# Look for failed requests
```

### **Debug Commands**
```bash
# Vercel logs
vercel logs

# Build logs
vercel build --debug

# Environment check
vercel env pull .env.local
```

---

## 📈 **Performance Metrics**

### **Target Metrics**
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1
- **First Input Delay:** < 100ms

### **Optimization Techniques**
- **Image Optimization:** WebP format, lazy loading
- **Code Splitting:** Route-based and component-based
- **Tree Shaking:** Remove unused code
- **Caching:** Service worker, HTTP caching

---

## 🎯 **Go-Live Checklist**

### **Pre-Deployment**
- [ ] Backend health check passes
- [ ] Environment variables configured
- [ ] CORS settings verified
- [ ] Build succeeds locally
- [ ] Tests pass

### **Deployment**
- [ ] Vercel project linked
- [ ] Production deployment successful
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Health check endpoints responding

### **Post-Deployment**
- [ ] Frontend loads correctly
- [ ] API calls successful
- [ ] Authentication working
- [ ] Performance metrics acceptable
- [ ] Error monitoring active

---

## 🔮 **Future Enhancements**

### **Short Term**
- **PWA Support:** Service worker, offline functionality
- **Advanced Caching:** Redis integration
- **Real-time Updates:** WebSocket support

### **Long Term**
- **Micro-frontends:** Module federation
- **Edge Computing:** Vercel Edge Functions
- **AI Integration:** Client-side AI features

---

## 📞 **Support og Ressurser**

### **Vercel Resources**
- **Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **Support:** [vercel.com/support](https://vercel.com/support)
- **Community:** [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

### **Team Resources**
- **Frontend Lead:** Ann-Kristin
- **Backend Lead:** Kristil
- **DevOps:** CTO

---

## 🎉 **Deployment Status**

### **Current Status: 🔴 WAITING FOR BACKEND FIX**
- **Frontend:** ✅ Komplett og testet
- **Backend:** ❌ **LATEST DEPLOYMENT FAILED** - ImagePullFailure
- **Infrastructure:** ✅ Azure resources klar
- **Documentation:** ✅ Komplett

### **Backend Issue: Image Tag Mismatch**
**Problem:** GitHub Actions workflow was deploying with commit hash tag instead of `latest` tag.

**Status:** ✅ Fix applied, ready for retry

### **Next Steps**
1. **🔄 Backend Deployment Retry** - Trigger GitHub Actions workflow
2. **✅ Backend Health Check** - Verify `/healthz` endpoint
3. **🚀 Frontend Deployment** - Deploy to Vercel
4. **🔗 Integration Testing** - Test frontend-backend communication
5. **🎯 Go-Live** - Production deployment

---

**📝 Dette dokumentet oppdateres kontinuerlig med deployment status og learnings!**
