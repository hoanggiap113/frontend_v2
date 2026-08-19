import { useToast } from '#/app/providers/ToastProvider'
import { getApiErrorMessage } from '#/lib/helpers/api-error-helper'
import {
  useCreateWorkspaceMutation,
  useDeleteWorkspaceMutation,
} from '../../lib/hooks/workspaces.queries'
import { useAppDispatch } from '#/app/store/hooks'
import { setCurrentWorkspaceId } from './workspaceSlice'
import type { Workspace } from '../../lib/types/workspace'

interface UseWorkspaceActionsOptions {
  onWorkspaceCreated?: () => void
}

export function useWorkspaceActions({
  onWorkspaceCreated,
}: UseWorkspaceActionsOptions = {}) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const createMutation = useCreateWorkspaceMutation()
  const deleteMutation = useDeleteWorkspaceMutation()

  const selectWorkspace = (workspace: Workspace) => {
    dispatch(setCurrentWorkspaceId(workspace.id))
    toast({
      title: 'Đã chuyển workspace',
      description: `Bạn đang thao tác trong ${workspace.name}.`,
      variant: 'info',
    })
  }

  const createWorkspace = (payload: Pick<Workspace, 'name' | 'slug'>) => {
    createMutation.mutate(payload, {
      onSuccess: (workspace) => {
        onWorkspaceCreated?.()
        dispatch(setCurrentWorkspaceId(workspace.id))
        toast({
          title: 'Đã tạo workspace',
          description: `${workspace.name} đã được chọn làm workspace hiện tại.`,
          variant: 'success',
        })
      },
      onError: (error) => {
        toast({
          title: 'Không tạo được workspace',
          description: getApiErrorMessage(
            error,
            'Vui lòng kiểm tra lại thông tin và thử lại.',
          ),
          variant: 'error',
        })
      },
    })
  }

  const deleteWorkspace = (workspaceId: string) => {
    deleteMutation.mutate(workspaceId, {
      onSuccess: () => {
        toast({
          title: 'Đã xóa workspace',
          description: 'Danh sách workspace đã được cập nhật.',
          variant: 'success',
        })
      },
      onError: (error) => {
        toast({
          title: 'Không xóa được workspace',
          description: getApiErrorMessage(error, 'Vui lòng thử lại sau.'),
          variant: 'error',
        })
      },
    })
  }

  return {
    createMutation,
    deleteMutation,
    createWorkspace,
    deleteWorkspace,
    selectWorkspace,
  }
}
