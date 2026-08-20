type Validator<T = string> = (value: T) => string | undefined

const required =
  (label: string): Validator<unknown> =>
  (value) => {
    const isEmpty =
      typeof value === 'string'
        ? !value.trim()
        : value === undefined || value === null || value === ''

    return isEmpty ? `${label} không được để trống` : undefined
  }

const emailFormat: Validator = (value) => {
  if (typeof value !== 'string') return undefined

  const email = value.trim()

  if (!email) return undefined

  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)
    ? undefined
    : 'Email không đúng định dạng'
}

const minLength =
  (min: number, label = 'Trường này'): Validator<unknown> =>
  (value) =>
    typeof value === 'string' && value.length < min
      ? `${label} phải có ít nhất ${min} ký tự`
      : undefined

const maxLength =
  (max: number, label = 'Trường này'): Validator<unknown> =>
  (value) =>
    typeof value === 'string' && value.length > max
      ? `${label} không được vượt quá ${max} ký tự`
      : undefined

const compose =
  <T>(...validators: Validator<T>[]): Validator<T> =>
  (value) => {
    for (const validate of validators) {
      const error = validate(value)
      if (error) return error
    }
    return undefined
  }

const passwordStrength: Validator = (value) => {
  if (!value) return undefined
  if (value.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự'
  return undefined
}

const confirmPassword =
  (getPassword: () => string): Validator =>
  (value) => {
    if (!value) return 'Mật khẩu nhập lại không được để trống'
    return value !== getPassword() ? 'Mật khẩu nhập lại không khớp' : undefined
  }

export const rules = {
  loginEmail: compose(required('Email'), emailFormat),
  loginPassword: required('Mật khẩu'),
  registerEmail: compose(required('Email'), emailFormat),
  name: compose(
    required('Tên hiển thị'),
    minLength(2, 'Tên hiển thị'),
    maxLength(50, 'Tên hiển thị'),
  ),
  registerPassword: compose(required('Mật khẩu'), passwordStrength),
  confirmPassword,
  required,
  emailFormat,
  minLength,
  maxLength,
  compose,
} as const
