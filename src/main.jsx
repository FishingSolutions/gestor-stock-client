import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

const PAGES_BASE = '/gestor-stock-client'

// En GitHub Pages, cualquier ruta que no sea la raíz entra por 404.html.
// Ese archivo guarda la ruta pedida en sessionStorage y redirige al index;
// acá la restauramos para que el router entre directo a esa sección.
const redirectRoute = sessionStorage.getItem('stockfx:spa-redirect')
sessionStorage.removeItem('stockfx:spa-redirect')
if (redirectRoute) {
  window.history.replaceState(null, '', PAGES_BASE + redirectRoute)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* basename = subcarpeta donde vive la app en GitHub Pages, para que
        las rutas queden /gestor-stock-client/productos y no /productos. */}
    <BrowserRouter basename={PAGES_BASE}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
