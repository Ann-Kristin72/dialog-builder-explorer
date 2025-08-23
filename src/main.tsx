import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// ENV snapshot logging for validering av Vercel deployment
console.log("🔍 ENV snapshot", {
  VITE_OIDC_AUTHORITY: import.meta.env.VITE_OIDC_AUTHORITY,
  VITE_OIDC_CLIENT_ID: import.meta.env.VITE_OIDC_CLIENT_ID,
  VITE_REDIRECT_URI: import.meta.env.VITE_REDIRECT_URI,
  VITE_API_URL: import.meta.env.VITE_API_URL,
});

// API base URL logging for CORS debugging
console.log("🌐 API_BASE", import.meta.env.VITE_API_URL);

createRoot(document.getElementById("root")!).render(<App />);
