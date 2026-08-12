# Orders & Settlement Management System

A full-stack web application built with Next.js, React, and MongoDB for managing customer orders, tracking line items, and recording financial settlements.

---

## 🚀 Features

- **User Authentication:** JWT-based signup/login flow with secure HTTP-only cookies and protected route middleware.
- **Financial Dashboard:** Real-time metrics tracking Total Orders, Total Invoiced, Total Collected, and Outstanding Balance.
- **Order Management:** Create orders with dynamic multi-item line descriptions, quantities, unit prices, and auto-computed subtotals.
- **Status Filtering:** Filter orders dynamically by status (`unpaid`, `partially_paid`, `paid`).
- **Settlement & Payment Tracking:** Record full or partial payments against orders with automatic balance recalculation and overpayment validation.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router, Server Actions / Route Handlers)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** MongoDB with Mongoose ORM
- **Authentication:** JSON Web Tokens (JWT) & bcrypt.js

---

## 📋 Local Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (Local or MongoDB Atlas connection string)

### Steps

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd <repository-folder-name>
   npm install
   Create a .env.local file in the root directory and add:
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
   npm run dev
   Open http://localhost:3000 in your browser. 