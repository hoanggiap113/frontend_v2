import { createRouter } from '@tanstack/react-router'
import { queryClient } from '#/app/query/queryClient'
import InternalServerPage from '../components/errors/InternalServerPage'
import NotFoundPage from '../components/errors/NotFoundPage'
import { routeTree } from './routeTree.gen'

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultErrorComponent: InternalServerPage,
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
