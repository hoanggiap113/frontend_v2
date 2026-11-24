# Chat Quality Agent Frontend

Frontend quản trị cho Chat Quality Agent Platform, xây dựng bằng React, TypeScript, Vite, TanStack Router, TanStack Query, Redux Toolkit, Tailwind CSS và Ant Design.

## Folder structure
```text
src/
├── app/
│   ├── layout/                 # Admin layout, header và sidebar
│   ├── providers/              # Redux, Query, Ant Design, Toast
│   ├── query/                  # QueryClient và devtools
│   └── store/                  # Root store và global UI state
│
├── features/
│   ├── auth/
│   ├── channels/
│   ├── chatbot/
│   ├── dashboard/
│   ├── invitations/
│   ├── jobs/
│   ├── mcp/
│   ├── messages/
│   ├── users/
│   └── workspaces/
│
├── router/
│   ├── routes/                 # TanStack Router file-based routes
│   ├── context.ts
│   ├── index.tsx
│   └── routeTree.gen.ts       
│
├── shared/
│   ├── components/             # Loading, Toast, Placeholder...
│   ├── config/                 # Environment configuration
│   ├── hooks/                  # Hook dùng chung
│   ├── lib/                    # Helper thuần
│   ├── service/                # HTTP client, endpoints, query keys
│   ├── types/                  # Type dùng chung
│   └── ui/                     # UI primitives và icon adapter
│
├── main.tsx
└── styles.css
```

## Cấu trúc một feature

```text
features/channels/
├── components/               
├── hooks/                      
├── service/                   
├── lib/                       
├── pages/                     
├── types/                      
├── data/                     
└── index.ts                    
```

## Cài đặt và chạy local

Yêu cầu Node.js version >= 22
```bash
corepack enable
cp .env.example .env
pnpm install
pnpm dev
```

PowerShell:

```powershell
corepack enable
Copy-Item .env.example .env
pnpm install
pnpm dev
```

Ứng dụng chạy tại `http://localhost:3000`.

## Luồng đăng nhập và workspace

Sau khi đăng nhập, người dùng chọn workspace tại `/tenants`. Trang chọn workspace đứng ngoài layout quản trị. Chọn một workspace sẽ mở trang quản trị chung, còn các đường dẫn quản trị được điều hướng về bước chọn workspace nếu tab hiện tại chưa có lựa chọn.

## Source code validation

Kiểm tra ranh giới kiến trúc:

```bash
pnpm architecture
```

Kiểm tra toàn bộ:

```bash
pnpm validate
```

`pnpm validate` lần lượt chạy:

```text
architecture → typecheck → lint → build
```

Script kiến trúc sẽ báo lỗi khi:

- `shared` phụ thuộc ngược vào feature hoặc app.
- Một feature import sâu vào thư mục nội bộ của feature khác thay vì public API root.
- Router import feature ngoài entrypoint `pages`, hoặc app shell import ngoài `service`/`store`.
- File trong cùng feature dùng absolute self-import thay vì relative import.
- Xuất hiện lại các folder cũ như `src/pages`, `src/components`, `src/services` hoặc `src/routes`.
- Feature thiếu `components`, `hooks`, `service`, `lib` hoặc `index.ts`.

## Biến môi trường

```env
PORT=3000
VITE_WEBHOOK_API_URL=
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_AGENT_API_BASE_URL=http://localhost:8000/api/v1
```

## Docker

```bash
docker compose up frontend --build
```

Dừng container:

```bash
docker compose down
```
