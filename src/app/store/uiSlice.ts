import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

function getInitialTheme(): 'light' | 'dark' | 'auto' {
  if (typeof window === 'undefined') return 'auto'
  const stored = window.localStorage.getItem('theme')
  return stored === 'light' || stored === 'dark' || stored === 'auto' ? stored : 'auto'
}

interface UiState {
  theme: 'light' | 'dark' | 'auto'
  sidebarCollapsed: boolean
  globalSearch: string
}

const initialState: UiState = {
  theme: getInitialTheme(),
  sidebarCollapsed: false,
  globalSearch: '',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload
    },
    setGlobalSearch(state, action: PayloadAction<string>) {
      state.globalSearch = action.payload
    },
    setTheme(state, action: PayloadAction<UiState['theme']>) {
      state.theme = action.payload
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('theme', action.payload)
      }
    },
  },
})

export const { toggleSidebar, setSidebarCollapsed, setGlobalSearch, setTheme } = uiSlice.actions
export default uiSlice.reducer
