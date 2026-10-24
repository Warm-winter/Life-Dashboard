import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { bootstrap } from './lib/bootstrap'
import './styles/tokens.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/fx.css'

const boot = bootstrap()
const container = document.getElementById('root')

if (container) {
  createRoot(container).render(
    <StrictMode>
      <App initialEntries={boot.entries} initialSettings={boot.settings} />
    </StrictMode>,
  )
}
