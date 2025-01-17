import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app'
import '@/styles/global.scss'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
