import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { workspacesService } from './workspaces.service'
import { queryKeys } from '#/shared/service/query-keys'
import type { Workspace } from '../types/workspace'

export function useWorkspacesQuery() {
  return useQuery({
    queryKey: queryKeys.workspaces,
    queryFn: () => workspacesService.list(),
  })
}

export function useCreateWorkspaceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Pick<Workspace, 'name' | 'slug'>) => workspacesService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.workspaces })
    },
  })
}

export function useDeleteWorkspaceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (workspaceId: string) => workspacesService.remove(workspaceId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.workspaces })
    },
  })
}
