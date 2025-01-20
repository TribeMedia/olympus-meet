export interface LoginFormData {
  identifier: string
  password: string
  service: string
}

export interface AuthError {
  message: string
  code?: string
}

