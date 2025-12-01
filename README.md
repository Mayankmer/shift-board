Here’s a **clean, professional, GitHub-ready** reformatted README:

---

# **Employee Shift Board**

A full-stack HR utility for managing employee work shifts with **role-based access control**, built for the *Assignment C* requirement.

---

## 🚀 **Live Demo**

👉 **[Insert Your Vercel Deployment Link Here]**

---

## 🛠️ **Tech Stack**

**Frontend**

* Next.js (App Router)
* React
* Tailwind CSS

**Backend**

* Next.js API Routes (Serverless)

**Database**

* PostgreSQL (Neon DB)

**Authentication**

* JWT (JSON Web Tokens) + Bcrypt Hashing

---

## ✨ **Features**

### 🔐 Role-Based Access Control

* **Admin**

  * View all shifts
  * Assign new shifts
* **User**

  * View only their own shifts

### 🧩 Critical Business Rules

* Prevents overlapping shifts for the same employee
* Enforces minimum shift duration: **4 hours**

### 🔒 Security

* Passwords hashed with **bcrypt**
* Protected API routes using **JWT verification**

---

## ⚙️ **Setup Instructions**

### **Prerequisites**

* Node.js (v18+)
* PostgreSQL database (NeonDB recommended)

---

### **1. Clone the Repository**

```sh
git clone https://github.com/Mayankmer/shift-board.git
cd employee-shift-board
```

### **2. Install Dependencies**

```sh
npm install
```

### **3. Configure Environment Variables**

Create a `.env.local` file in the project root:

```
DATABASE_URL=postgres://user:password@ep-host.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your_super_secret_key_here
```

---

### **4. Database Setup**

Run the SQL from `sql/schema.sql` (or use the schema below) in your SQL editor to create tables and seed the Admin.

### **5. Start the App**

```sh
npm run dev
```

Then visit **[http://localhost:3000](http://localhost:3000)**

---

## 🗄️ **Database Schema & Seed**

```sql
-- Create Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    employee_code VARCHAR(50),
    department VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Shifts
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Admin 
INSERT INTO users (name, email, password, role, employee_code, department)
VALUES 
('Admin', 'admin@admin.com', 'yourhashedpassword', 'admin', 'ADM001', 'HR');
```

---

## 📡 **API Documentation**

### **Auth**

**POST /api/login** — Authenticate user & return JWT
**POST /api/signup** — Create a new user *(role defaults to `user`)*

---

### **Shifts**

**GET /api/shifts**

* Admin → returns *all* shifts
* User → returns *their* shifts only

**POST /api/shifts (Admin Only)**
Payload:

```json
{
  "userId": "",
  "date": "",
  "startTime": "",
  "endTime": ""
}
```

Validations:

* No overlapping shifts
* Minimum duration: **4 hours**

---

### **Employees**

**GET /api/employees (Admin Only)**
Returns list of employees for dropdowns / shift assignment.

---


## 👤 **Test Credentials**

| Role  | Email           | Password     |
| ----- | ----------------| ------------ |
| Admin | [admin@test.com]|admin123|
| User  | [test1@test.com]|test123|

---


