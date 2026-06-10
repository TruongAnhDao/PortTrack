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

Không đưa password database vào Git.

## 2. Deploy backend lên Render

Repository đã có `render.yaml` và `porttrack-backend/Dockerfile`.

1. Push repository lên GitHub.
2. Trong Render chọn **New > Blueprint** và kết nối repository.
3. Điền các biến môi trường:

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
https://porttrack.onrender.com.onrender.com/api/health
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
VITE_API_URL=https://porttrack.onrender.com
```

5. Deploy frontend.

`vercel.json` đã cấu hình rewrite để React Router hoạt động khi tải trực tiếp
các route con.

## 4. Cập nhật CORS

Sau khi có URL Vercel, sửa biến Render:

```text
FRONTEND_ORIGINS=https://port-track-xi.vercel.app/
```

Sau đó redeploy backend.

## Chạy local sau thay đổi bảo mật

Backend không chứa password database và JWT secret trong source code.
Khi chạy local, thiết lập các biến môi trường cần thiết rồi chạy:

```powershell
cd porttrack-backend
.\mvnw.cmd spring-boot:run
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
