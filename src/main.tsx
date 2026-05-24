import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from '@/components/ui/Toast'
import { RegionProvider } from '@/contexts/RegionContext'

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <RegionProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </RegionProvider>
    </ClerkProvider>
  </StrictMode>,
)
