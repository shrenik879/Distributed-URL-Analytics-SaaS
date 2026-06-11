# 🔗 Cliq: Distributed URL Analytics & SaaS Platform

<div align="center">

### A Scalable MERN-Based SaaS Platform for URL Management, Analytics, QR Generation, and Link-in-Bio Pages

![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=for-the-badge\&logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge\&logo=node.js)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge\&logo=mongodb)
![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?style=for-the-badge\&logo=vite)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

### 🌐 Live Applications

**User Portal:** https://url-shortener-theta-self.vercel.app/

**Admin Dashboard:** https://url-shortener-oawg.vercel.app/login

</div>

---

# 📌 Overview

Cliq is a production-ready Software as a Service (SaaS) platform that extends traditional URL shortening with powerful analytics, QR code generation, custom aliases, subscription management, and personalized Link-in-Bio pages.

The platform follows a distributed architecture consisting of a centralized Node.js API serving two independent React applications:

* User Portal
* Admin Dashboard

The system is designed to support scalable traffic handling, role-based access control, subscription-based monetization, and real-time analytics visualization.

---

# 🚀 Key Technical Achievements

### ⚡ O(1) Redirection Performance

Implemented MongoDB indexing on the `shortId` field to ensure constant-time URL lookup performance regardless of database size.

### 🏗️ Distributed Dual-Frontend Architecture

Designed a centralized REST API consumed by two independent React applications:

* User Portal
* Admin Dashboard

This architecture improves maintainability, scalability, and separation of concerns.

### 📱 Server-Side QR Generation

Generated QR codes using the Node.js `qrcode` package on the backend to reduce browser-side computation and improve client performance.

### ⚡ Optimized Frontend Performance

Migrated from Create React App to Vite for:

* Faster development startup
* Instant Hot Module Replacement
* Smaller production bundles

### 🛡️ Robust Data Handling

Implemented schema migration safeguards and fallback mechanisms to prevent application crashes during data evolution.

---

# 🏗️ System Architecture

```text
                    ┌──────────────────┐
                    │   User Portal    │
                    │ React + Vite     │
                    └────────┬─────────┘
                             │
                             ▼

                    ┌──────────────────┐
                    │  Node.js API     │
                    │ Express Backend  │
                    └────────┬─────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                                     ▼

 ┌──────────────────┐                 ┌──────────────────┐
 │     MongoDB      │                 │     Razorpay     │
 │    Database      │                 │ Payment Gateway  │
 └──────────────────┘                 └──────────────────┘

                             ▲
                             │

                    ┌──────────────────┐
                    │ Admin Dashboard  │
                    │ React + Vite     │
                    └──────────────────┘
```

---

# ✨ Core Features

## 🔗 Advanced URL Management

* Short URL generation
* Custom vanity aliases
* Link activation and deactivation
* 410 Gone response for disabled links
* Downloadable QR codes

### Example

```text
Original URL:
https://myportfolio.com/projects

Short URL:
https://cliq.link/myportfolio
```

---

## 📱 Link-in-Bio Builder

Users can create personalized landing pages containing:

* Portfolio links
* Social media links
* Contact information
* Theme customization

### Premium Features

* More links
* Advanced themes
* Extended customization options

---

## 📊 Real-Time Analytics

Track and visualize:

* Total clicks
* Daily traffic
* Click timestamps
* Geographic distribution
* Historical trends

### Analytics Dashboard

Built using:

* Recharts
* Responsive visualizations
* Interactive charts

---

## 🔐 Authentication & Security

### Authentication Methods

* Email + Password Login
* Google OAuth Login

### Security Features

* JWT Authentication
* bcrypt Password Hashing
* Role-Based Access Control (RBAC)
* Protected Admin Routes

---

## 💳 Subscription Management

Integrated Razorpay payment gateway for:

* Premium plan upgrades
* Subscription handling
* Feature unlocking
* Payment verification

---

# 🔄 CI/CD Pipeline

Implemented automated deployment workflow using GitHub, Vercel, and Render.

### Continuous Integration

* Dependency installation
* Build verification
* Pull request validation

### Continuous Deployment

* Automatic User Portal deployment
* Automatic Admin Dashboard deployment
* Automatic Backend deployment

### Workflow

```text
Developer Push
      │
      ▼

GitHub Repository
      │
      ▼

Build Verification
      │
      ▼

Deployment Pipeline
      │
      ├──► Vercel (User Portal)
      │
      ├──► Vercel (Admin Dashboard)
      │
      └──► Render (Backend API)
```

---

# 💻 Tech Stack

| Category        | Technologies                                                        |
| --------------- | ------------------------------------------------------------------- |
| Frontend        | React 19, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide React |
| Backend         | Node.js, Express.js                                                 |
| Authentication  | JWT, bcryptjs, Google OAuth                                         |
| Database        | MongoDB, Mongoose                                                   |
| Payments        | Razorpay                                                            |
| QR Generation   | qrcode                                                              |
| Deployment      | Vercel, Render                                                      |
| Version Control | Git, GitHub                                                         |

---

# 📂 Project Structure

```text
Distributed-URL-Analytics-SaaS
│
├── URL-SHORT/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── admin-panel/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── controllers/
├── middlewares/
├── models/
├── routes/
├── service/
├── views/
│
├── connect.js
├── index.js
├── package.json
└── README.md
```

---

# ⚙️ Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=8002

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174

GOOGLE_CLIENT_ID=your_google_client_id

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

---

# 🚀 Local Setup

## Clone Repository

```bash
git clone https://github.com/shrenik879/Distributed-URL-Analytics-SaaS.git

cd Distributed-URL-Analytics-SaaS
```

---

## Install Backend Dependencies

```bash
npm install
```

---

## Run Backend Server

```bash
npm start
```

Backend runs at:

```text
http://localhost:8002
```

---

## Run User Portal

Open a new terminal:

```bash
cd URL-SHORT

npm install

npm run dev
```

User Portal runs at:

```text
http://localhost:5173
```

---

## Run Admin Dashboard

Open another terminal:

```bash
cd admin-panel

npm install

npm run dev
```

Admin Dashboard runs at:

```text
http://localhost:5174
```

---

# 📸 Screenshots

## User Dashboard

Add screenshot here:

```text
/assets/user-dashboard.png
```

## Analytics Dashboard

Add screenshot here:

```text
/assets/analytics-dashboard.png
```

## Admin Dashboard

Add screenshot here:

```text
/assets/admin-dashboard.png
```

---

# 🎯 Future Enhancements

* Redis Caching
* Custom Domains
* Team Workspaces
* API Access Plans
* AI-Powered Analytics
* Kubernetes Deployment
* Multi-Region Infrastructure

---

# 🤝 Contributing

Contributions, feature requests, and suggestions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Open a Pull Request

---

# 👨‍💻 Author

### Shrenik Kondekar

B.Tech Computer Science Engineering

Full Stack Developer

GitHub:
https://github.com/shrenik879

LinkedIn:
(https://www.linkedin.com/in/shrenik-kondekar/)

---

⭐ If you found this project useful, consider giving it a star.


