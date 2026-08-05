# Refactor notes

## Thay đổi kiến trúc

- Chuyển source từ cấu trúc ngang `pages/components/services/types` sang `src/features/<feature>`.
- Mỗi feature có public API root `index.ts`, cùng secondary entrypoint `pages`, `service` hoặc `store` khi router/app cần import có kiểm soát.
- Di chuyển code dùng chung vào `src/shared`.
- Di chuyển root store, provider, query client và admin layout vào `src/app`.
- Di chuyển toàn bộ route vào `src/router/routes`.
- Chuyển từ TanStack Start sang Vite SPA sử dụng trực tiếp `@tanstack/react-router`.
- Cấu hình file-based route generation và automatic code splitting.
- Thêm `scripts/check-architecture.mjs` để ngăn import sai ranh giới.

## Tách container và render component

`useChannelsPage` điều phối query, mutation, Facebook OAuth, filter và pagination. `ChannelsPage` chỉ nối hook với `ChannelsPageView`; view chỉ nhận props và render giao diện, phù hợp để test độc lập.

Các dashboard panel, message conversation component, job detail panel và workspace component tiếp tục đóng vai trò presentational component theo cùng nguyên tắc.

## Không thay đổi

- Không thay đổi endpoint.
- Không thay đổi request/response contract.
- Không thay đổi Redux state shape.
- Không thay đổi business logic của query và mutation.
- Không tự bổ sung các chức năng chưa được triển khai.
