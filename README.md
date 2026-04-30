# PortTrack

A web-based stock investment simulation platform designed for educational purposes.  
Users can create or join investment rooms, receive virtual capital, trade stocks, and track portfolio performance over time.

---

## Project Overview

This project simulates a real-world stock investment environment to help users practice portfolio management and investment strategies.

Each user can:
- create a room
- join public or private rooms
- receive virtual capital
- buy and sell stocks
- monitor profit/loss and portfolio growth

The system is designed for academic projects and learning purposes.

---

## Main Features

- User registration and login
- Create public/private investment rooms
- Join existing rooms by room code
- Virtual stock trading (BUY / SELL)
- Portfolio management
- Transaction history
- Daily NAV tracking
- Ranking and performance comparison

---

## Database Structure

Main tables:
- `users`: manage user accounts
- `rooms`: manage investment rooms
- `portfolios`: manage each user’s portfolio in a room
- `portfolio_items`: stocks currently held
- `transactions`: buy/sell history
- `daily_nav_history`: daily portfolio value

---

## Tech Stack

### Frontend
- React
- HTML / CSS / JavaScript

### Backend
- Spring Boot
- Spring Data JPA
- REST API

### Database
- MySQL

### Tools
- Git / GitHub
- VS Code 

---
## Project structure

PortTrack/
├── CREATE_TABLE.TXT                     # Chứa lệnh SQL tạo database và các bảng
├── Cấu trúc dữ liệu.txt                 # Giải thích chi tiết ý nghĩa các trường dữ liệu
├── README.md                            # Thông tin giới thiệu chung về toàn bộ dự án
│
├── porttrack-backend/                   # THƯ MỤC BACKEND (SPRING BOOT)
│   ├── .gitattributes                   # Cấu hình Git (xử lý lỗi dấu xuống dòng giữa Windows/Mac)
│   ├── .gitignore                       # Chặn các file rác (thư mục target, log) không đưa lên Git
│   ├── .mvn/wrapper/
│   │   └── maven-wrapper.properties     # Cấu hình phiên bản Maven cụ thể cho dự án
│   ├── mvnw                             # Script giúp chạy Maven trên Mac/Linux mà không cần cài đặt
│   ├── mvnw.cmd                         # Script giúp chạy Maven trên Windows mà không cần cài đặt
│   ├── pom.xml                          # File khai báo thư viện Java (Web, JPA, MySQL...)
│   ├── src/main/java/.../PorttrackApplication.java  # File chạy chính (Main class) của Backend
│   ├── src/main/resources/
│   │   └── application.properties       # Nơi điền cổng (port), tên đăng nhập/mật khẩu MySQL
│   └── src/test/.../PorttrackApplicationTests.java  # File dành để viết code tự động kiểm thử (Unit Test)
│
└── porttrack-frontend/                  # THƯ MỤC FRONTEND (REACTJS + VITE)
    ├── .gitignore                       # Chặn thư mục node_modules siêu nặng không đẩy lên Git
    ├── README.md                        # Hướng dẫn cách cài đặt và chạy Frontend
    ├── eslint.config.js                 # Cấu hình "cảnh sát" kiểm tra lỗi cú pháp và chuẩn format code
    ├── index.html                       # File HTML gốc duy nhất, chứa thẻ <div id="root">
    ├── package-lock.json                # "Khóa" chính xác phiên bản của từng thư viện đang dùng
    ├── package.json                     # Khai báo tên dự án, thư viện (react, axios...) và lệnh chạy (npm run dev)
    ├── public/
    │   ├── favicon.svg                  # Icon nhỏ hiển thị trên tab của trình duyệt
    │   └── icons.svg                    # File gom các icon vector (SVG) dùng chung cho trang web
    ├── src/
    │   ├── App.css                      # CSS định dạng riêng cho Component App
    │   ├── App.tsx                      # Component React mẹ, chứa khung sườn giao diện
    │   ├── index.css                    # CSS áp dụng chung cho toàn bộ trang web
    │   ├── main.tsx                     # Điểm vào đầu tiên, nhúng code React vào index.html
    │   └── assets/                      # Thư mục chứa tài nguyên hình ảnh
    │       ├── hero.png                 # Ảnh minh họa/banner có thể dùng cho trang chủ
    │       ├── react.svg                # File logo của React
    │       └── vite.svg                 # File logo của Vite
    ├── tsconfig.app.json                # Cấu hình TypeScript dành riêng cho code giao diện React
    ├── tsconfig.json                    # Cấu hình TypeScript tổng quát cho toàn dự án
    ├── tsconfig.node.json               # Cấu hình TypeScript dành cho môi trường build (Vite/Node)
    └── vite.config.ts                   # File cấu hình công cụ đóng gói Vite (chỉnh port, plugin...)


Lưu ý: Khi code màn nào hay chức năng nào thì cần phải chia folder và sắp xếp thật hợp lí vị trí file

## How to run
**1. Khởi động Backend (Spring Boot)**
- Mở Terminal, di chuyển vào thư mục `cd porttrack-backend`
- Đảm bảo đã cài Java 17 và cấu hình MySQL đúng trong `application.properties`.
- Chạy lệnh:
  - Windows: `.\mvnw spring-boot:run`
  - Mac/Linux: `./mvnw spring-boot:run`
- Server sẽ chạy tại: `http://localhost:8080`

**2. Khởi động Frontend (ReactJS + Vite)**
- Mở một Terminal khác, di chuyển vào thư mục `cd porttrack-frontend`
- Cài đặt thư viện (chỉ chạy lần đầu): `npm install`
- Khởi động giao diện: `npm run dev`
- Truy cập trình duyệt tại: `http://localhost:5173`