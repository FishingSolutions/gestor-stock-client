import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import AppShell from '../components/layout/AppShell/AppShell'
import HomePage from '../screens/HomePage'
import LoginPage from '../screens/LoginPage'
import ProductsPage from '../screens/ProductsPage/ProductsPage'
import MovimientosPage from '../screens/MovimientosPage/MovimientosPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        {/* Layout persistente: la sidebar no se remonta al navegar. */}
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/movimientos" element={<MovimientosPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
