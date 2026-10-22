# NUR COFFEE — nền tảng thương mại cà phê

Cửa hàng + Coffee Studio (B2B/OEM) + marketplace nhà bán được duyệt, một codebase **Next.js 15 (App Router) · TypeScript · PostgreSQL 17 · Prisma 6 · Zod · Tailwind CSS 4**, kiến trúc modular monolith, có worker hàng đợi bền vững (transactional outbox).

> Trạng thái: chạy được end-to-end ở môi trường **development/demo** với cổng thanh toán **sandbox**. Chưa đủ điều kiện bán thật — xem [docs/02-business-decisions.md](docs/02-business-decisions.md) và mục “Kích hoạt production”.

## Chạy local (Windows/macOS/Linux, không cần Docker)

Yêu cầu: Node.js 22 LTS.

```bash
npm ci
```

```bash
cp .env.example .env
```

```bash
npm run setup
```

`setup` = khởi tạo PostgreSQL 17 cục bộ (binary chính thức qua gói npm `@embedded-postgres/*`, dữ liệu ở `.data/pg`, cổng 54329) → `prisma migrate deploy` → seed idempotent. Lần sau chỉ cần `npm run db:start`.

```bash
npm run build && npm start
```

```bash
npm run worker
```

Mở http://localhost:3000. Tài khoản demo được sinh ngẫu nhiên khi seed và ghi vào `.data/demo-credentials.txt` (không commit, chỉ dùng khi `ENABLE_DEMO=true` và `APP_ENV≠production`). Đặt `DEMO_PASSWORD` trong `.env` nếu muốn mật khẩu cố định.

| Vai trò demo | Email |
|---|---|
| Quản trị Nur (ADMIN/OPS/FINANCE/CONTENT/SUPPORT) | admin@nur.test |
| Khách mua | buyer@nur.test |
| Chủ quán (tổ chức “Quán Cà Phê Demo”) | cafe@nur.test |
| Nhà bán demo 1 / 2 | seller@nur.test / seller2@nur.test |

Với Docker: `docker compose up --build` (file có sẵn, **chưa được chạy thử** trong phiên phát triển vì máy không có Docker).

## Lệnh

| Lệnh | Việc |
|---|---|
| `npm run db:start` / `db:stop` | Bật/tắt PostgreSQL cục bộ |
| `npm run db:migrate` | Áp migration (không phá dữ liệu) |
| `npm run db:seed` | Seed idempotent (chạy lại không nhân bản) |
| `npm run dev` / `build` / `start` | Web |
| `npm run worker` | Worker: gửi thông báo (test-sink), hết hạn giữ hàng, nhắc mua định kỳ, đối soát thanh toán |
| `npm run typecheck` · `npx eslint .` | Kiểm tra tĩnh |
| `npm run test:unit` | Unit test nghiệp vụ (không cần DB) |
| `npm run test:integration` | Integration test trên DB `nur_test` (PostgreSQL thật) |
| `npm run test:e2e` | Hành trình HTTP trên server đang chạy (`E2E_BASE_URL`) |
| `npm run test:load` | Kiểm thử tải (biến `LOAD_*`) |
| `npm run backup` / `restore` | pg_dump / diễn tập restore sang DB riêng (cần PostgreSQL client tools) |

## Cấu trúc

```
prisma/            schema, migrations (kèm CHECK, trigger sổ cái chỉ-ghi-thêm), seed + seed-data (10 mã mix)
src/domain/        nghiệp vụ thuần, có unit test: policy, pricing, menu, packaging, allocation, search, taste
src/server/        db, auth/session, http (mã lỗi, request ID, CSRF origin check), outbox, worker
src/server/services catalog, cart, checkout, payments, ledger, studio, production, sellers, subscriptions, misc, files
src/app/           trang (tiếng Việt) + /api/v1 (hợp đồng typed bằng Zod)
src/components/    UI; components/studio = Coffee Studio
tests/             unit · integration · e2e · load
docs/              bản đồ yêu cầu, quyết định cần Nur chốt, kiến trúc, API, hướng dẫn admin, báo cáo kiểm thử
```

## Tài liệu

- [docs/01-requirements-map.md](docs/01-requirements-map.md) — yêu cầu → màn hình → dữ liệu/API → test, và trạng thái từng module
- [docs/02-business-decisions.md](docs/02-business-decisions.md) — dữ liệu đã xác nhận / đề xuất / mâu thuẫn và quyết định Nur cần chốt
- [docs/03-architecture.md](docs/03-architecture.md) — kiến trúc, sơ đồ dữ liệu, bất biến, cache, worker, bảo mật
- [docs/04-api.md](docs/04-api.md) — hợp đồng API
- [docs/05-admin-guide.md](docs/05-admin-guide.md) — vận hành: chính sách, giá, nhà bán, đối soát, sản xuất, CMS, backup
- [docs/06-test-report.md](docs/06-test-report.md) — kết quả kiểm thử thực tế và phần chưa xác minh

## Kích hoạt production (chưa làm)

1. Nur chốt các quyết định trong `docs/02-business-decisions.md`, nhập bảng giá thật (giá nhân/rang, yield, chi phí công đoạn, bao bì, thuế) và kích hoạt chính sách qua Admin.
2. Hợp đồng + adapter cổng thanh toán thật (VNPay/MoMo/ZaloPay/ngân hàng — cần kiểm tra tài liệu và hợp đồng; adapter sandbox hiện tại bị khóa khi `APP_ENV=production`).
3. Nhà cung cấp email/SMS/Zalo, vận chuyển; object storage (S3-compatible) + CDN; PostgreSQL managed có PITR; giám sát lỗi/latency.
4. Hoàn thiện các trang chính sách (đang là BẢN NHÁP) và nghĩa vụ pháp lý về website TMĐT/sàn, dữ liệu cá nhân, hóa đơn — cần tư vấn pháp lý tại thời điểm triển khai.
5. `APP_ENV=production`, `ENABLE_DEMO=false`, secrets thật; seed chỉ tạo dữ liệu tham chiếu (không demo).
