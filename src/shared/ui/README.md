# Shared UI

Thư mục này chứa các thành phần trình bày dùng lại trên nhiều page.

| Component | Mục đích |
|---|---|
| `AppButton` | Wrapper cho Ant Design Button, giữ class và kích thước thống nhất |
| `AppCard` | Wrapper cho Ant Design Card với border/radius/shadow chung |
| `PageContainer` | Giới hạn chiều rộng và khoảng cách nội dung của page |
| `PageHeader` | Tiêu đề, mô tả, eyebrow và vùng actions |
| `SectionCard` | Khối nội dung có title/description/extra |
| `FilterBar` | Thanh bộ lọc co giãn, hỗ trợ nhóm trái/phải |
| `MetricTile` | Ô số liệu dùng cho dashboard/list summary |
| `EmptyState` | Trạng thái chưa có dữ liệu |
| `StatusTag` | Trạng thái màu và trạng thái có dot |
| `icons.tsx` | Adapter icon dựa trên `@ant-design/icons` |

## Quy ước

- Component dùng ở từ hai feature trở lên nên đặt tại đây.
- Component chứa nghiệp vụ cụ thể phải đặt trong `components/<feature>`.
- Không đưa API call, Redux logic hoặc query logic vào UI primitives.
- Màu, radius và spacing chung nên cấu hình ở Ant Design theme hoặc `styles.css`, không copy vào từng page.
