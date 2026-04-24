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

porttrack-backend/
├── src/main/java/com/musketeers/porttrack/
│   ├── config/              # Config
│   ├── controller/          # REST API endpoints
│   ├── dto/
│   │   ├── request/         # Request DTOs
│   │   └── response/        # Response DTOs
│   ├── entity/              # JPA entities mapping database tables
│   ├── exception/           # Global exception handling
│   ├── repository/          # Spring Data JPA repositories
│   ├── security/            # JWT, authentication, authorization
│   ├── service/
│   │   ├── impl/            # Service implementations
│   │   ├── RoomService.java
│   │   ├── TradingService.java
│   │   ├── PortfolioService.java
│   │   └── UserService.java
│   ├── scheduler/           # Daily NAV cron jobs
│   └── PortTrackApplication.java
│
└── src/main/resources/
    ├── application.yml
    └── db/
        └── migration/

porttrack-frontend/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   └── layout/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── rooms/
│   │   ├── trading/
│   │   └── portfolio/
│   │
│   ├── hooks/
│   ├── routes/
│   ├── services/
│   │   ├── apiClient.ts
│   │   ├── authService.ts
│   │   ├── roomService.ts
│   │   ├── tradingService.ts
│   │   └── portfolioService.ts
│   │
│   ├── store/
│   ├── types/
│   ├── utils/
│   ├── pages/              # <-- thêm folder này
│   └── App.tsx
│
├── .env
└── package.json

## How to run
