import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Sidebar from './Sidebar'
import Header from './Header'
import { useRouteTitle } from '#/lib/useRouteTitle'
import { useAppDispatch, useAppSelector } from '#/app/store/hooks'
import {
  selectAuthUser,
  selectCurrentWorkspace,
  selectCurrentWorkspaceId,
  selectSidebarCollapsed,
} from '#/app/store/index'
import { setUser } from '#/features/auth'
import { toggleSidebar } from '#/app/store/uiSlice'
import { setCurrentWorkspaceId, setWorkspaces } from '#/features/workspaces'
import { queryKeys } from '#/lib/services/query-keys'
import { workspacesService } from '#/lib/services/workspaces.service'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const sidebarCollapsed = useAppSelector(selectSidebarCollapsed)
  const pageTitle = useRouteTitle()
  const currentWorkspaceId = useAppSelector(selectCurrentWorkspaceId)
  const currentWorkspace = useAppSelector(selectCurrentWorkspace)
  const authUser = useAppSelector(selectAuthUser)

  const { data } = useQuery({
    queryKey: queryKeys.workspaces,
    queryFn: () => workspacesService.list(),
  })

  useEffect(() => {
    if (!data) return
    dispatch(setWorkspaces(data))
    if (!currentWorkspaceId && data[0]) {
      dispatch(setCurrentWorkspaceId(data[0].id))
    }
  }, [currentWorkspaceId, data, dispatch])

  useEffect(() => {
    if (!authUser || !currentWorkspace?.myRole) return
    if (authUser.role === currentWorkspace.myRole) return

    dispatch(
      setUser({
        ...authUser,
        role: currentWorkspace.myRole,
      }),
    )
  }, [authUser, currentWorkspace?.myRole, dispatch])

  return (
    <div className="app-shell">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="app-shell__main">
        <Header onToggleSidebar={() => dispatch(toggleSidebar())} pageTitle={pageTitle} />
        <main className="app-shell__content app-scrollbar">{children}</main>
      </div>
    </div>
  )
}
