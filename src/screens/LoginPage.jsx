import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
 CircleAlert,
 Eye,
 EyeOff,
 Loader2,
 Lock,
 LogIn,
 Mail,
 Package,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import FullPageLoader from '../components/FullPageLoader'

const AUTH_ERROR_MESSAGES = {
 invalid_credentials: 'Email o contraseña incorrectos.',
 email_not_confirmed: 'Tenés que confirmar tu email antes de ingresar.',
 over_request_rate_limit: 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.',
 user_banned: 'Tu usuario está bloqueado. Contactá al administrador.',
}

function translateAuthError(error) {
 if (!error) return 'No pudimos iniciar sesión. Intentá de nuevo.'

 if (error.code && AUTH_ERROR_MESSAGES[error.code]) {
  return AUTH_ERROR_MESSAGES[error.code]
 }

 if (/invalid login credentials/i.test(error.message ?? '')) {
  return 'Email o contraseña incorrectos.'
 }

 if (/email not confirmed/i.test(error.message ?? '')) {
  return 'Tenés que confirmar tu email antes de ingresar.'
 }

 return error.message || 'No pudimos iniciar sesión. Intentá de nuevo.'
}

function LoginPage() {
 const { session, loading, signIn } = useAuth()
 const navigate = useNavigate()
 const location = useLocation()
 const [email, setEmail] = useState('')
 const [password, setPassword] = useState('')
 const [showPassword, setShowPassword] = useState(false)
 const [error, setError] = useState('')
 const [submitting, setSubmitting] = useState(false)

 const from = location.state?.from
  ? `${location.state.from.pathname}${location.state.from.search ?? ''}${location.state.from.hash ?? ''}`
  : '/'

 if (loading) {
  return <FullPageLoader label="Verificando sesión..." />
 }

 if (session) {
  return <Navigate to={from} replace />
 }

 const handleSubmit = async (event) => {
  event.preventDefault()
  setError('')
  setSubmitting(true)

  try {
   await signIn(email, password)
   navigate(from, { replace: true })
  } catch (signInError) {
   setError(translateAuthError(signInError))
  } finally {
   setSubmitting(false)
  }
 }

 return (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-4 py-10">
   <div
    aria-hidden="true"
    className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-cream-300/70 blur-3xl"
   />
   <div
    aria-hidden="true"
    className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-rust-500/10 blur-3xl"
   />

   <div className="relative w-full max-w-md">
    <div className="mb-8 flex flex-col items-center text-center">
     <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-rust-600 text-cream-50 ">
      <Package size={28} aria-hidden="true" />
     </div>
     <h1 className="text-3xl font-bold tracking-tight text-brown-900">StockFX</h1>
     <p className="mt-1 text-sm text-brown-600">
      Ingresá para gestionar tu inventario
     </p>
    </div>

    <form
     onSubmit={handleSubmit}
     className="rounded-lg bg-white p-6 sm:p-8"
    >
     <div className="space-y-5">
      <div>
       <label htmlFor="email" className="block text-sm font-medium text-brown-700">
        Email
       </label>
       <div className="relative mt-1.5">
        <Mail
         size={18}
         className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brown-500"
         aria-hidden="true"
        />
        <input
         id="email"
         name="email"
         type="email"
         required
         autoComplete="email"
         autoFocus
         value={email}
         onChange={(event) => setEmail(event.target.value)}
         placeholder="tu@email.com"
         className="w-full rounded bg-cream-100 py-2.5 pl-10 pr-3 text-sm text-brown-900 placeholder:text-brown-500 focus:outline-none focus:ring-2 focus:ring-rust-500/20"
        />
       </div>
      </div>

      <div>
       <label htmlFor="password" className="block text-sm font-medium text-brown-700">
        Contraseña
       </label>
       <div className="relative mt-1.5">
        <Lock
         size={18}
         className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brown-500"
         aria-hidden="true"
        />
        <input
         id="password"
         name="password"
         type={showPassword ? 'text' : 'password'}
         required
         autoComplete="current-password"
         value={password}
         onChange={(event) => setPassword(event.target.value)}
         placeholder="••••••••"
         className="w-full rounded bg-cream-100 py-2.5 pl-10 pr-11 text-sm text-brown-900 placeholder:text-brown-500 focus:outline-none focus:ring-2 focus:ring-rust-500/20"
        />
        <button
         type="button"
         onClick={() => setShowPassword((visible) => !visible)}
         aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
         className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-brown-500 transition-colors hover:text-brown-700 focus:outline-none focus:ring-2 focus:ring-rust-500/20"
        >
         {showPassword ? (
          <EyeOff size={18} aria-hidden="true" />
         ) : (
          <Eye size={18} aria-hidden="true" />
         )}
        </button>
       </div>
      </div>

      {error && (
       <div
        role="alert"
        className="flex items-start gap-2 rounded bg-stock-red-bg px-3 py-2.5 text-sm text-wine-600"
       >
        <CircleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>{error}</span>
       </div>
      )}

      <button
       type="submit"
       disabled={submitting}
       className="flex w-full items-center justify-center gap-2 rounded bg-rust-600 px-4 py-2.5 text-sm font-semibold text-cream-50 transition-colors hover:bg-rust-700 focus:outline-none focus:ring-2 focus:ring-rust-500/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
       {submitting ? (
        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
       ) : (
        <LogIn size={18} aria-hidden="true" />
       )}
       {submitting ? 'Ingresando...' : 'Ingresar'}
      </button>
     </div>
    </form>

    <p className="mt-6 text-center text-xs text-brown-500">
     Acceso restringido. Si no tenés cuenta, contactá al administrador.
    </p>
   </div>
  </div>
 )
}

export default LoginPage
