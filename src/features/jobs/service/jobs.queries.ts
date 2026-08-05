import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { jobsService } from './jobs.service'
import { queryKeys } from '#/shared/service/query-keys'
import type { JobUpsertPayload } from '../types/job'

export const JOB_STATUS_POLL_INTERVAL_MS = 5000

export function useJobsQuery(workspaceId: string) {
  return useQuery({
    enabled: Boolean(workspaceId),
    queryKey: queryKeys.jobs(workspaceId || 'default'),
    queryFn: () => jobsService.list(workspaceId),
    refetchInterval: JOB_STATUS_POLL_INTERVAL_MS,
  })
}

export function useJobDetailQuery(workspaceId: string, jobId: string) {
  return useQuery({
    enabled: Boolean(workspaceId),
    queryKey: queryKeys.jobDetail(workspaceId || 'default', jobId),
    queryFn: () => jobsService.get(workspaceId, jobId),
    refetchInterval: JOB_STATUS_POLL_INTERVAL_MS,
  })
}

export function useJobRunsQuery(workspaceId: string, jobId: string) {
  return useQuery({
    enabled: Boolean(workspaceId),
    queryKey: queryKeys.jobRuns(workspaceId || 'default', jobId),
    queryFn: () => jobsService.runs(workspaceId, jobId),
    refetchInterval: JOB_STATUS_POLL_INTERVAL_MS,
  })
}

export function useJobResultsQuery(workspaceId: string, jobId: string) {
  return useQuery({
    enabled: Boolean(workspaceId),
    queryKey: queryKeys.jobResults(workspaceId || 'default', jobId),
    queryFn: () => jobsService.results(workspaceId, jobId),
  })
}

export function useCreateJobMutation(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: JobUpsertPayload) => jobsService.create(workspaceId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.jobs(workspaceId || 'default') })
    },
  })
}

export function useUpdateJobMutation(workspaceId: string, jobId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: JobUpsertPayload) => jobsService.update(workspaceId, jobId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.jobs(workspaceId || 'default') }),
        queryClient.invalidateQueries({ queryKey: queryKeys.jobDetail(workspaceId || 'default', jobId) }),
      ])
    },
  })
}

export function useTriggerJobMutation(workspaceId: string, jobId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => jobsService.trigger(workspaceId, jobId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.jobs(workspaceId || 'default') }),
        queryClient.invalidateQueries({ queryKey: queryKeys.jobDetail(workspaceId || 'default', jobId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.jobRuns(workspaceId || 'default', jobId) }),
      ])
    },
  })
}

export function useDeleteJobMutation(workspaceId: string, jobId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => jobsService.remove(workspaceId, jobId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.jobs(workspaceId || 'default') })
    },
  })
}
