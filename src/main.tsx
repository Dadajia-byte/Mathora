import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AppRoutes from '@/routers/routes';
import '@/styles/global.scss'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <AppRoutes />
  </StrictMode>,
)
