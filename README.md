# 🔗 Cliq — Distributed URL Analytics & SaaS Platform

### A scalable MERN-based SaaS platform featuring advanced URL analytics, Link-in-Bio pages, QR generation, and role-based administration.

![React](https://img.shields.io/badge/Frontend-React_19-61dafb?style=for-the-badge\&logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge\&logo=node.js)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge\&logo=mongodb)
![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?style=for-the-badge\&logo=vite)

### 🌐 Live Applications

* **User Portal:** https://url-shortener-theta-self.vercel.app/
* **Admin Dashboard:** https://url-shortener-oawg.vercel.app/login

---

# 📌 Overview

Cliq is a full-stack SaaS platform that goes beyond traditional URL shortening by providing:

* Custom URL shortening and vanity aliases
* Real-time click analytics and reporting
* Dynamic QR code generation
* Link-in-Bio website builder
* Subscription-based premium features
* Dedicated admin monitoring dashboard

The platform is designed using a scalable distributed architecture with separate user and admin frontends connected to a centralized REST API.

---

# 🚀 Key Highlights

### High Performance URL Redirection

* MongoDB indexing on `shortId`
* Constant-time lookup performance
* Optimized redirect handling

### Dual Frontend Architecture

* Independent User Portal
* Separate Admin Dashboard
* Shared backend services through REST APIs

### QR Code Generation

* Server-side QR creation using Node.js
* Reduced browser workload
* Downloadable QR assets

### Optimized Build System

* Vite-based frontend architecture
* Fast HMR during development
* Lightweight production bundles

### Scalable Database Design

* Mongoose timestamps
* Schema migration support
* Legacy data fallback handling

---

# 🏗️ System Architecture

```text
                   ┌─────────────────┐
                   │   User Portal   │
                   │  React + Vite   │
                   └────────┬────────┘
                            │
                            ▼

                   ┌─────────────────┐
                   │  Express API    │
                   │   Node.js       │
                   └────────┬────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                                   ▼

 ┌─────────────────┐                ┌─────────────────┐
 │   MongoDB       │                │ Razorpay API    │
 │   Database      │                │ Payment System  │
 └─────────────────┘                └─────────────────┘

                            ▲
                            │

                   ┌─────────────────┐
                   │ Admin Dashboard │
                   │  React + Vite   │
                   └─────────────────┘
```

---

# ✨ Features

## 🔗 URL Management

* Short URL generation
* Custom aliases
* Link activation/deactivation
* 410 Gone handling for disabled links
* QR code generation

## 📱 Link-in-Bio Builder

* Personalized profile pages
* Social media aggregation
* Theme customization
* Free and Premium plan limits

## 📊 Analytics Dashboard

* Click tracking
* Geographic analytics
* Traffic visualization
* Historical data reports
* Interactive charts using Recharts

## 🔐 Authentication & Security

* JWT Authentication
* bcrypt password hashing
* Google OAuth Login
* Role-Based Access Control (RBAC)

## 💳 Subscription Management

* Razorpay payment integration
* Premium plan upgrades
* Automated feature unlocking

---

# 🛠️ Tech Stack

| Category       | Technologies                                          |
| -------------- | ----------------------------------------------------- |
| Frontend       | React 19, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend        | Node.js, Express.js                                   |
| Authentication | JWT, bcryptjs, Google OAuth                           |
| Database       | MongoDB, Mongoose                                     |
| Payments       | Razorpay                                              |
| QR Generation  | qrcode                                                |
| Deployment     | Vercel, Render                                        |

---

# 📂 Project Structure

```text
Cliq/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   └── middleware/
│
├── URL-SHORT/
│   └── User Frontend
│
├── admin-panel/
│   └── Admin Frontend
│
└── README.md
```

---

# ⚙️ Environment Variables

```env
PORT=8002
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174

GOOGLE_CLIENT_ID=your_google_client_id

RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

---

# 🚀 Local Setup

## 1. Clone Repository

```bash
git clone https://github.com/yourusername/url-shortener.git
cd url-shortener
```

## 2. Install Backend Dependencies

```bash
npm install
```

## 3. Start Backend

```bash
npm start
```

## 4. Start User Portal

```bash
cd URL-SHORT
npm install
npm run dev
```

## 5. Start Admin Dashboard

```bash
cd admin-panel
npm install
npm run dev
```
## 🔄 CI/CD Pipeline

Implemented automated CI/CD workflows using GitHub Actions.

### Continuous Integration
- Automatic dependency installation
- Build verification for all applications
- Code quality checks
- Pull Request validation

### Continuous Deployment
- User Portal deployed automatically to Vercel
- Admin Dashboard deployed automatically to Vercel
- Backend API deployed automatically to Render

### Workflow

Developer Push
    ↓
GitHub Actions
    ↓
Build & Validation
    ↓
Deployment
    ↓
Production Environment

---

# 📈 Future Enhancements

* Redis caching for redirects
* Custom domains support
* Team workspaces
* API usage plans
* AI-powered analytics insights
* Kubernetes deployment

---

# 👨‍💻 Author

**Shrenik Kondekar**

B.Tech CSE | Full Stack Developer

GitHub: https://github.com/yourusername
LinkedIn: https://linkedin.com/in/yourprofile


