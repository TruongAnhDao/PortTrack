# Deploy PortTrack

Phương án miễn phí đề xuất:

- Frontend: Vercel
- Backend: Render
- Database: TiDB Cloud Starter hoặc một MySQL provider tương thích

Schema database vẫn được quản lý thủ công bằng `CREATE_TABLE.TXT`. Backend giữ
`spring.jpa.hibernate.ddl-auto=none` và không tự tạo hay sửa bảng.

## 1. Chuẩn bị database

1. Tạo database cloud.
2. Chạy `CREATE_TABLE.TXT` trên database mới, hoặc import bản dump của database hiện tại.
3. Lưu lại JDBC URL, username và password.

JDBC URL phải có dạng do nhà cung cấp database hướng dẫn, ví dụ:

```text
jdbc:mysql://host:4000/port_track?sslMode=VERIFY_IDENTITY
```

Không đưa password database vào Git.

## 2. Deploy backend lên Render

Repository đã có `render.yaml` và `porttrack-backend/Dockerfile`.

1. Push repository lên GitHub.
2. Trong Render chọn **New > Blueprint** và kết nối repository.
3. Điền các biến môi trường:

```text
DB_URL=<JDBC URL cua database cloud>
DB_USERNAME=<database username>
DB_PASSWORD=<database password>
JWT_SECRET=<Base64 secret toi thieu 32 bytes>
FRONTEND_ORIGINS=<URL frontend Vercel>
ENTRADE_API_URL=https://services.entrade.com.vn/chart-api/v2/ohlcs/stock
```

Tạo JWT secret trên PowerShell:

```powershell
$bytes = New-Object byte[] 32
$rng = [Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$rng.Dispose()
[Convert]::ToBase64String($bytes)
```

Trong lần deploy đầu, có thể đặt tạm:

```text
FRONTEND_ORIGINS=http://localhost:5173
```

Sau khi backend chạy, kiểm tra:

```text
https://<render-service>.onrender.com/api/health
```

Kết quả mong đợi:

```json
{"status":"UP"}
```

## 3. Deploy frontend lên Vercel

1. Import cùng GitHub repository vào Vercel.
2. Chọn **Root Directory** là `porttrack-frontend`.
3. Framework preset: Vite.
4. Thêm biến môi trường:

```text
VITE_API_URL=https://<render-service>.onrender.com
```

5. Deploy frontend.

`vercel.json` đã cấu hình rewrite để React Router hoạt động khi tải trực tiếp
các route con.

## 4. Cập nhật CORS

Sau khi có URL Vercel, sửa biến Render:

```text
FRONTEND_ORIGINS=https://<vercel-project>.vercel.app
```

Nếu cần nhiều origin, phân tách bằng dấu phẩy:

```text
FRONTEND_ORIGINS=http://localhost:5173,https://<vercel-project>.vercel.app
```

Sau đó redeploy backend.

## Chạy local sau thay đổi bảo mật

Backend không còn chứa password database và JWT secret trong source code.
Máy local có thể dùng file `porttrack-backend/.env` bị Git bỏ qua và chạy:

```powershell
cd porttrack-backend
.\run-local.cmd
```

Frontend vẫn mặc định gọi `http://localhost:8081`. Có thể tạo file `.env` trong
`porttrack-frontend` dựa trên `.env.example` khi cần URL khác.

## Bảo mật mật khẩu

- Mật khẩu tài khoản được hash bằng BCrypt.
- Mật khẩu phòng riêng mới hoặc được đổi cũng được hash bằng BCrypt.
- Mật khẩu phòng cũ đang lưu dạng rõ vẫn hoạt động và tự chuyển sang BCrypt sau
  lần nhập đúng tiếp theo.
- Password kết nối database không thể hash vì backend cần dùng để đăng nhập DB;
  nó được bảo vệ bằng secret/environment variable của nền tảng deploy.
