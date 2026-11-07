export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api'

export const getAuthHeader = () => {
  return sessionStorage.getItem('crm_auth') || ''
}

export const setAuthHeader = (header) => {
  sessionStorage.setItem('crm_auth', header)
}

export const removeAuthHeader = () => {
  sessionStorage.removeItem('crm_auth')
}

export const isAuthenticated = () => {
  return Boolean(sessionStorage.getItem('crm_auth'))
}

export const apiFetch = async (path, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }

  const auth = getAuthHeader()
  if (auth && !headers['Authorization']) {
    headers['Authorization'] = auth
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers
  })

  if (res.status === 401) {
    removeAuthHeader()
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await res.json() : null

  if (!res.ok) {
    const errorMsg = data && (data.error || (data.details && Object.values(data.details).join(', ')))
      ? data.error || Object.values(data.details).join(', ')
      : `Request failed with status ${res.status}`
    throw new Error(errorMsg)
  }

  return data
}
