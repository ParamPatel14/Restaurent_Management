# Restaurant Management System

A comprehensive web-based application for managing restaurant operations, including menu management, table reservations, kitchen workflow, billing, and business analytics.

## 🚀 Features

### Public Interface
- **Digital Menu**: Browse categories and items (Appetizers, Main Course, etc.) with prices and availability.
- **Table Reservation**: Book tables for specific dates, times, and party sizes.

### Admin / Staff Interface
- **Authentication**: Secure login for staff and management.
- **Dashboard**: Quick overview of restaurant status.
- **Table Management**: View and manage reservations, check table conflicts.
- **Order Management**: Create and manage orders (Dine-in).
- **Kitchen Display System (KDS)**: Real-time order updates for kitchen staff (Pending -> Preparing -> Ready).
- **Billing & Cashier**: Finalize orders, process payments, and generate bills.
- **Analytics**: Business intelligence dashboard showing revenue, popular items, and order stats.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS v3
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Charts**: Recharts

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **Driver**: psycopg2-binary
- **Real-time**: WebSockets (for Kitchen Display)

## 📋 Prerequisites

- **Node.js** (v16+)
- **Python** (v3.10+)
- **PostgreSQL** (v13+)

## ⚙️ Installation & Setup

### 1. Database Setup

1.  Open pgAdmin or your terminal and create a new database named `restaurant_db`.
2.  The application will automatically handle schema creation, but ensure your credentials are correct.

### 2. Backend Setup

Navigate to the `backend` directory:

```bash
cd backend
```

Create a virtual environment:

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory with your database credentials:

```env
DB_NAME=restaurant_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

Run the backend server:

```bash
uvicorn app.main:app --reload
```
*The backend runs on `http://localhost:8000`*

### 3. Frontend Setup

Open a new terminal and navigate to the `frontend` directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```
*The frontend runs on `http://localhost:5173`*

## 📖 Usage Guide

### Accessing the Application
- **Public Home**: [http://localhost:5173](http://localhost:5173) - View Menu and Book Tables.
- **Admin Login**: [http://localhost:5173/login](http://localhost:5173/login)

### Admin Credentials
To access the management features (Kitchen, Orders, Analytics, etc.), use the following credentials:
- **Username**: `admin`
- **Password**: `1234`

### Workflow Example
1.  **Customer** books a table via the "Book Table" page.
2.  **Admin** sees the reservation in "Reservations" tab.
3.  **Staff** creates an order for the table in "Orders" page.
4.  **Kitchen** sees the new order on the "Kitchen" display and updates status (Preparing -> Ready).
5.  **Waiter** marks the order as Served.
6.  **Cashier** goes to "Billing", selects the table, and processes payment.
7.  **Manager** views the daily revenue in "Analytics".

## 📂 Project Structure

```
Restaurent_Management/
├── backend/
│   ├── app/
│   │   ├── api/          # API Endpoints (orders, tables, etc.)
│   │   ├── core/         # Config and Database connection
│   │   ├── db/           # SQL Schemas
│   │   ├── schemas/      # Pydantic Models
│   │   └── main.py       # Entry point
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # Auth and Cart context
│   │   ├── pages/        # Route pages (Menu, Login, Dashboard, etc.)
│   │   ├── App.jsx       # Main component with Routes
│   │   └── main.jsx      # Entry point
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```
