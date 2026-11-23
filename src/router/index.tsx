import { createRouter } from '@tanstack/react-router'
import InternalServerRedirect from '../components/errors/InternalServerRedirect'
import NotFoundPage from '../components/errors/NotFoundPage'
import { queryClient } from '#/lib/config/queryClient'
import { routeTree } from './routeTree.gen'

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultErrorComponent: InternalServerRedirect,
  defaultNotFoundComponent: NotFoundPage,
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
