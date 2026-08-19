import { useRouterState } from '@tanstack/react-router'
import { ROUTE_TITLES } from '#/constant'

export function useRouteTitle(): string {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  return ROUTE_TITLES.find((item) => item.match.test(pathname))?.title ?? 'Trang chủ'
}
