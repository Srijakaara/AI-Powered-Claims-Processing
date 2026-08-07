export type RoleId = 'operational' | 'auditor' | 'executive' | 'admin'

export type AuthedUser = {
  id: RoleId
  label: string
  personName: string
  email: string
  route: string
}

const AUTH_KEY = 'trustshield:auth'

export function getAuthedUser(): AuthedUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    return raw ? (JSON.parse(raw) as AuthedUser) : null
  } catch {
    return null
  }
}

export function setAuthedUser(user: AuthedUser) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user))
}

export function clearAuthedUser() {
  localStorage.removeItem(AUTH_KEY)
}

export function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p.replace('.', ''))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
