export async function mockDelay(ms = 180) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
