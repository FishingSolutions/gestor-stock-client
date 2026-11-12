import { supabase } from './supabase'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(
  /\/$/,
  '',
)

/**
 * Error de la API con el status HTTP, para poder distinguir 401 / 403 / 409.
 */
export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw new ApiError('No pudimos verificar tu sesión.', 401)
  }

  const token = data.session?.access_token

  if (!token) {
    throw new ApiError('Tu sesión expiró. Volvé a iniciar sesión.', 401)
  }

  return token
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const token = await getAccessToken()

  let response

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error

    throw new ApiError(
      'No pudimos conectar con el servidor. Revisá que el backend esté corriendo.',
      0,
    )
  }

  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text()

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && payload.error) ||
      (typeof payload === 'string' && payload) ||
      `La API respondió con el código ${response.status}.`

    throw new ApiError(message, response.status)
  }

  return payload
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) =>
    request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) =>
    request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
}
