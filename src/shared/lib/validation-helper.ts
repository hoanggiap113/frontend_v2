export function isValidEmail(value: string) {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
    value.trim(),
  )
}

export function getPasswordConfirmationError({
  confirmPassword,
  password,
  required = true,
}: {
  confirmPassword: string
  password: string
  required?: boolean
}) {
  if (required && !password) return 'Mật khẩu không được để trống'
  if (password && password.length < 6) {
    return 'Mật khẩu phải có ít nhất 6 ký tự'
  }
  if (confirmPassword !== password) return 'Mật khẩu nhập lại không khớp'
  return ''
}
