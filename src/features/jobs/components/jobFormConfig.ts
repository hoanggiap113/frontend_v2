import { chatbotModelOptions } from '#/features/chatbot'
import type {
  JobItem,
  JobRuleInput,
  JobRuleSeverity,
  JobUpsertPayload,
} from '../types/job'
import type {
  JobOutputOption,
  JobScheduleOption,
  JobStatusOption,
  JobTypeOption,
} from '../types/job-form'

export const jobFormSteps = [
  'Chọn loại',
  'Chọn kênh',
  'Quy tắc cho AI',
  'Đầu ra',
  'Lịch chạy',
  'Xác nhận',
] as const

export const jobTypes: JobTypeOption[] = [
  {
    value: 'qc_analysis',
    title: 'Phân tích chất lượng CSKH',
    description:
      'Đánh giá chất lượng trả lời của nhân viên và phát hiện vi phạm quy tắc.',
  },
  {
    value: 'classification',
    title: 'Phân loại chat',
    description:
      'Phân loại cuộc chat theo chủ đề như feedback, hỏi giá hoặc khiếu nại.',
  },
]

export const statusOptions: JobStatusOption[] = [
  { value: 'draft', label: 'Nháp' },
  { value: 'active', label: 'Kích hoạt' },
  { value: 'inactive', label: 'Tạm dừng' },
]

export const outputOptions: JobOutputOption[] = [
  {
    value: 'Dashboard',
    title: 'Dashboard',
    description: 'Lưu kết quả để xem trực tiếp trong hệ thống.',
  },
  {
    value: 'Telegram alert',
    title: 'Telegram',
    description: 'Gửi cảnh báo nhanh cho nhóm vận hành.',
  },
  {
    value: 'Email summary',
    title: 'Email summary',
    description: 'Gửi báo cáo tổng hợp theo lịch.',
  },
  {
    value: 'Slack summary',
    title: 'Slack',
    description: 'Đẩy summary vào kênh nội bộ.',
  },
  {
    value: 'Tag CRM',
    title: 'CRM tag',
    description: 'Gắn tag để hệ thống khác xử lý tiếp.',
  },
]

export const scheduleOptions: JobScheduleOption[] = [
  {
    value: 'after_sync',
    title: 'Chạy thủ công sau khi sync',
    description: 'Chạy thủ công khi bạn bấm chạy thử.',
  },
  {
    value: 'cron',
    title: 'Theo cron',
    description: 'Chạy theo lịch cố định, ví dụ mỗi sáng 7h.',
  },
]

export const aiModelOptions = [
  ...chatbotModelOptions.gemini.map((item) => ({
    ...item,
    provider: 'GEMINI',
  })),
  {
    value: 'claude-sonnet-4-6',
    label: 'Claude Sonnet 4.6',
    provider: 'CLAUDE',
  },
] as const

export const aiProviderOptions = [
  {
    value: 'GEMINI',
    label: 'Google Gemini',
    description: 'Dùng Gemini API key từ cấu hình workspace hoặc hệ thống.',
  },
  {
    value: 'CLAUDE',
    label: 'Claude',
    description: 'Dùng Claude proxy và token cố định từ file .env backend.',
  },
] as const

export function getAiModelOptions(provider: string) {
  return aiModelOptions.filter((item) => item.provider === provider)
}

export const severityOptions: Array<{
  value: JobRuleSeverity
  label: string
  apiValue: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  weight: number
  tone: string
}> = [
  {
    value: 'low',
    label: 'Low',
    apiValue: 'LOW',
    weight: 1,
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  {
    value: 'medium',
    label: 'Medium',
    apiValue: 'MEDIUM',
    weight: 3,
    tone: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  {
    value: 'high',
    label: 'High',
    apiValue: 'HIGH',
    weight: 4,
    tone: 'border-orange-200 bg-orange-50 text-orange-700',
  },
  {
    value: 'critical',
    label: 'Critical',
    apiValue: 'CRITICAL',
    weight: 5,
    tone: 'border-rose-200 bg-rose-50 text-rose-700',
  },
]

export function getSeverityOption(severity: JobRuleSeverity) {
  return (
    severityOptions.find((item) => item.value === severity) ??
    severityOptions[1]
  )
}

export const defaultRuleItems: JobRuleInput[] = [
  {
    id: 'rule_1',
    title: 'Chào hỏi lịch sự',
    content:
      'Nhân viên phải chủ động chào hỏi khách hàng ngay trong tin nhắn đầu tiên phản hồi.',
    severity: 'high',
  },
  {
    id: 'rule_2',
    title: 'Thời gian phản hồi',
    content:
      'Nhân viên phải trả lời trong vòng 5 phút kể từ tin nhắn cuối của khách.',
    severity: 'high',
  },
  {
    id: 'rule_3',
    title: 'Giải đáp đầy đủ',
    content:
      'Nhân viên phải trả lời đúng trọng tâm, đầy đủ câu hỏi và cung cấp thông tin chính xác.',
    severity: 'medium',
  },
  {
    id: 'rule_4',
    title: 'Kết thúc chuyên nghiệp',
    content:
      'Nhân viên nên hỏi khách còn cần hỗ trợ gì không, cảm ơn khách và kết thúc lịch sự.',
    severity: 'medium',
  },
]

export const defaultBusinessContext =
  'Đây là cửa hàng demo, chuyên tư vấn và bán sản phẩm/dịch vụ cho khách hàng qua kênh chat.'

export const defaultRules = defaultRuleItems.map(
  (rule) => `${rule.title}: ${rule.content}`,
)

export const defaultClassificationRules = [
  'Hỏi giá: khách hỏi giá, ưu đãi, chi phí hoặc chương trình khuyến mãi.',
  'Khiếu nại: khách phản ánh trải nghiệm xấu, lỗi sản phẩm hoặc thái độ phục vụ.',
  'Tư vấn sản phẩm: khách cần thông tin về sản phẩm, dịch vụ hoặc cách sử dụng.',
  'Hậu mãi: khách hỏi bảo hành, đổi trả, giao hàng hoặc hỗ trợ sau mua.',
]

export const defaultSkipRules = [
  'Bỏ qua cuộc chat dưới 2 tin nhắn.',
  'Bỏ qua cuộc chat chỉ có sticker, ảnh hoặc file không có nội dung text.',
  'Bỏ qua cuộc chat chỉ có tin nhắn tự động từ hệ thống.',
]

function toRuleItems(rules: string[] | undefined): JobRuleInput[] {
  const source = rules?.filter(Boolean)
  if (!source?.length) return defaultRuleItems

  return source.map((rule, index) => {
    const [rawTitle, ...contentParts] = rule.split(':')
    const title = rawTitle.trim() || `Rule ${index + 1}`
    const content = contentParts.join(':').trim() || rule.trim()

    return {
      id: `rule_${index + 1}`,
      title,
      content,
      severity: 'medium',
    }
  })
}

export function normalizeJobFormState(
  form: Partial<JobUpsertPayload>,
): JobUpsertPayload {
  const rulesSummary =
    form.rulesSummary && form.rulesSummary.length > 0
      ? form.rulesSummary
      : defaultRules

  const ruleItems =
    form.ruleItems && form.ruleItems.length > 0
      ? form.ruleItems
      : toRuleItems(rulesSummary)

  return {
    name: form.name ?? '',
    description: form.description ?? '',
    type: form.type ?? 'qc_analysis',
    status: form.status ?? 'draft',
    provider: form.provider ?? 'GEMINI',
    model:
      form.model ??
      getAiModelOptions(form.provider ?? 'GEMINI')[0]?.value ??
      'gemini-3.5-flash',
    scheduleType: form.scheduleType ?? 'after_sync',
    scheduleValue: form.scheduleValue ?? 'Chạy thủ công',
    channels: form.channels ?? [],
    outputs: form.outputs ?? ['Dashboard'],
    rulesSummary,
    businessContext: form.businessContext ?? defaultBusinessContext,
    ruleItems,
  }
}

export function toJobFormState(job?: JobItem): JobUpsertPayload {
  const provider = job?.provider ?? 'GEMINI'
  const fallbackModel =
    getAiModelOptions(provider)[0]?.value ??
    aiModelOptions[0]?.value ??
    'gemini-3.5-flash'

  return normalizeJobFormState({
    name: job?.name ?? '',
    description: job?.description ?? '',
    type: job?.type ?? 'qc_analysis',
    status: job?.status ?? 'draft',
    provider,
    model: job?.model ?? fallbackModel,
    scheduleType: job?.scheduleType ?? 'after_sync',
    scheduleValue: job?.scheduleValue ?? 'Chạy thủ công',
    channels: job?.channels ?? [],
    outputs: job?.outputs ?? ['Dashboard'],
    rulesSummary: job?.rulesSummary ?? defaultRules,
    businessContext: job?.businessContext ?? defaultBusinessContext,
    ruleItems: job?.ruleItems,
  })
}

export function scheduleValueFor(type: JobUpsertPayload['scheduleType']) {
  if (type === 'after_sync') return 'Chạy thủ công'
  if (type === 'realtime') return 'Realtime'
  return '0 0 7 * * *'
}
