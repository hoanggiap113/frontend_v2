import { createRouter } from '@tanstack/react-router'
import { queryClient } from '#/app/query/queryClient'
import { NotFoundPage } from '#/shared/components'
import { routeTree } from './routeTree.gen'

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultNotFoundComponent: NotFoundPage,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
