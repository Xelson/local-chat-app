import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RootLayout } from '~/pages/root'
import { ChatPage } from '~/pages/chat'

createRoot(document.body).render(
  <StrictMode>
    <RootLayout>
      <ChatPage />
    </RootLayout>
  </StrictMode>
)
