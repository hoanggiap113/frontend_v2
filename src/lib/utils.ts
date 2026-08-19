import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function mockDelay(ms = 180) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
