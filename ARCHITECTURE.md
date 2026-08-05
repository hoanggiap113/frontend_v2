# Frontend Architecture Rules

## Dependency direction

```text
router ─┐
app ────┼──> features ───> shared
feature ┘

shared không phụ thuộc vào app hoặc feature.
```

## Public API

Mỗi feature phải có `index.ts` ở root. Đây là public API dành cho **feature khác**. Không export route page từ root barrel để tránh kéo page, app store và router vào cùng dependency graph.

```ts
// features/jobs/index.ts
export * from './components'
export * from './service'
export * from './types'
```

Các secondary entrypoint được dùng có chủ đích:

```text
#/features/<feature>/pages    chỉ dành cho router
#/features/<feature>/store    chỉ dành cho app shell
#/features/<feature>/service  chỉ dành cho app shell khi khởi tạo phiên
```

## Import rules

```ts
// Feature khác: import qua public API root
import { jobsService } from '#/features/jobs'

// Router: import page qua secondary entrypoint
import { JobsListPage } from '#/features/jobs/pages'

// App shell: import phần khởi tạo cần thiết
import { authReducer } from '#/features/auth/store'

// Bên trong feature: relative import
import { jobsService } from '../service/jobs.service'

// Shared module
import { PageContainer } from '#/shared/ui'
```

Không dùng:

```ts
import { jobsService } from '#/features/jobs/service/jobs.service'
```

## Feature responsibilities

- `pages`: adapter mỏng nối route, hook và view.
- `components`: component render và component theo nghiệp vụ, ưu tiên nhận data/callback qua props.
- `hooks`: orchestration, query/mutation và stateful behavior có thể test độc lập.
- `service`: HTTP calls và TanStack Query hooks.
- `lib`: pure helper chỉ thuộc feature.
- `types`: contract và model của feature.
- `data`: mock hoặc fixture của feature.
- `index.ts`: public API.

## Router responsibilities

Route không chứa business logic. Route chỉ nên chứa:

- Khai báo URL.
- Đọc path/search params.
- Kiểm tra điều kiện.
- Render page được export bởi feature.

## Testing strategy

- Test `lib` bằng unit test thuần.
- Test hook/service với QueryClient test wrapper.
- Test component render bằng props cố định.
- Test container ở mức integration.
- Test route riêng tại `src/router/routes`.

## Automatic validation

```bash
pnpm architecture
```

Không tắt rule khi gặp lỗi. Hãy sửa dependency direction hoặc bổ sung export vào public API.
