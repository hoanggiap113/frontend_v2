import { Clock3 } from '#/components/ui/icons'

export function SyncScoringNotice() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/80 px-4 py-3 text-sm text-indigo-800 shadow-[0_10px_28px_rgba(79,70,229,0.08)] sm:flex-row sm:items-center">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm">
        <Clock3 size={18} />
      </div>
      <div className="leading-6">
        <span className="font-bold">Lưu ý khi chấm điểm:</span> Tin nhắn mới
        đồng bộ cần một khoảng thời gian trước khi AI đánh giá. Kết quả QC và
        phân loại sẽ tự cập nhật sau khi job xử lý hoàn tất.
      </div>
    </div>
  )
}
