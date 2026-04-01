export type Role = 'GUEST' | 'HOST'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatarUrl?: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  name: string
  email: string
  password: string
  role?: Role
  image?: File
}
