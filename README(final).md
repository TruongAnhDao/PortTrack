# PortTrack
Group code: G05

## Team members
- Nguyen Anh Thu  2312380036 - Team Leader & Database Coordinator
- To Ha Vy - 2313380039 - Backend 1 – Authentication, Security, and Trading Room Management
- Pham Quoc Thai - 2313380033 - Backend 2: Trading Operations, Portfolio Management, and Stock Price Integration
- Pham Linh Nhan - 2312380024 - Frontend 1 – Authentication, Dashboard, and User Flow
- Dang Ngoc Linh - 2312380018 - Frontend 2 – Room Management, Trading, Portfolio, and Transaction History

## Project overview
PortTrack is a web-based stock investment simulation platform developed for educational purposes. It allows students to practice stock trading with virtual capital, manage portfolios, and track investment performance. Lecturers can monitor trading activities and evaluate students’ results transparently.

## Problem solved
Students need a realistic environment to practice investment and portfolio management, while lecturers need a tool to monitor and assess their performance. PortTrack provides a centralized platform that supports both learning and evaluation.

## Target users
- Portfolio Management lecturers
- Students learning investment and portfolio management
The platform is used during investment simulation activities and classroom projects.

## Main features
- User registration and login
- Create public/private investment rooms
- Join existing rooms by room code
- Virtual stock trading (BUY / SELL)
- Portfolio management
- Transaction history
- Daily NAV tracking
- Ranking and performance comparison

## How to run
**1. Start the Backend (Spring Boot)**
- Open Terminal, navigate to `cd porttrack-backend`
- Make sure Java 17 is installed and the MySQL is set correcctly in `application.properties`.
- Run:
  - Windows: `.\mvnw spring-boot:run` or run file app
  - Mac/Linux: `./mvnw spring-boot:run`
- Server will be available at: `http://localhost:8081`

**2. Start the Frontend (ReactJS + Vite)**
- Open another Terminal, navigate to `cd porttrack-frontend`
- Install dependencies (first time only): `npm install`, `npm install axios react-router-dom`

- Start the frontend application: `npm run dev`
- Open browser and visit: `http://localhost:5173`

## Demo steps
- Register or log in.
- Create or join an investment room.
- Buy and sell stocks.
- View portfolio performance and transaction history.
- Check rankings and investment results.

## Demo link
- Demo link: 
- Demo account: 

## Data notes
The system uses user-generated data and real-time stock market data for investment simulation. All portfolio and transaction data are stored in MySQL.

## Additional notes
This README provides a brief overview of the project and instructions for running the system. Detailed development information can be found in the project documentation. 

