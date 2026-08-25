import { useMutation } from '@tanstack/react-query'
import { authService } from '#/lib/services/authService'

export function useAuth() {
  const loginMutation = useMutation({
    mutationFn: authService.login,
  })

  const registerMutation = useMutation({
    mutationFn: authService.register,
  })

  return {
    loginMutation,
    registerMutation,
  }
}
