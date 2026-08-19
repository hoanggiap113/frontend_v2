import { configureStore } from '@reduxjs/toolkit'
import authReducer from '#/features/auth/authSlice'
import uiReducer from '#/app/store/uiSlice'
import workspaceReducer from '#/features/workspaces/workspaceSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    workspace: workspaceReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const selectAuthUser = (state: RootState) => state.auth.user
export const selectIsAuthenticated = (state: RootState) => Boolean(state.auth.accessToken)
export const selectSidebarCollapsed = (state: RootState) => state.ui.sidebarCollapsed
export const selectGlobalSearch = (state: RootState) => state.ui.globalSearch
export const selectTheme = (state: RootState) => state.ui.theme
export const selectWorkspaces = (state: RootState) => state.workspace.items
export const selectCurrentWorkspaceId = (state: RootState) => state.workspace.currentWorkspaceId
export const selectCurrentWorkspace = (state: RootState) =>
  state.workspace.items.find((item) => item.id === state.workspace.currentWorkspaceId) ?? null
export const selectCurrentWorkspaceRole = (state: RootState) =>
  selectCurrentWorkspace(state)?.myRole ?? null
export const selectCanInviteMembers = (state: RootState) => {
  const role = selectCurrentWorkspaceRole(state)
  return role === 'OWNER' || role === 'ADMIN'
}
export const selectCanManageMemberRoles = (state: RootState) =>
  selectCurrentWorkspaceRole(state) === 'OWNER'
export const selectCanLeaveCurrentWorkspace = (state: RootState) => {
  const role = selectCurrentWorkspaceRole(state)
  return Boolean(role) && role !== 'OWNER'
}
