import { createSlice  } from '@reduxjs/toolkit'
import type {PayloadAction} from '@reduxjs/toolkit';
import {
  persistCurrentTenantId,
  readCurrentTenantId,
} from '#/lib/browser-storage'
import type { Workspace } from '../../lib/types/workspace'

function readCurrentWorkspaceId() {
  return readCurrentTenantId()
}

interface WorkspaceState {
  items: Workspace[]
  currentWorkspaceId: string
}

const initialState: WorkspaceState = {
  items: [],
  currentWorkspaceId: readCurrentWorkspaceId(),
}

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setWorkspaces(state, action: PayloadAction<Workspace[]>) {
      state.items = action.payload
      const currentStillAvailable = action.payload.some(
        (item) => item.id === state.currentWorkspaceId,
      )
      if (!currentStillAvailable) {
        state.currentWorkspaceId = action.payload[0]?.id ?? ''
        persistCurrentTenantId(state.currentWorkspaceId)
      }
    },
    setCurrentWorkspaceId(state, action: PayloadAction<string>) {
      state.currentWorkspaceId = action.payload
      persistCurrentTenantId(action.payload)
    },
  },
})

export const { setWorkspaces, setCurrentWorkspaceId } = workspaceSlice.actions
export default workspaceSlice.reducer
