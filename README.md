<div align="center">
  <img src="https://res.cloudinary.com/dt1yngqg0/image/upload/q_auto/f_auto/v1759509871/project-attachments/thibgrv3e2vhyalkhxlk.jpg" alt="AYB Hub Cover" width="100%" />
</div>

---

# AYB Hub — Smart Business Collaboration Platform

**AYB Hub** is a powerful and scalable fullstack SaaS solution built to help small and medium-sized teams manage projects, tasks, chats, clients, billing, and real-time collaboration — all from one unified platform.

Built with performance, user experience, and modern DevOps in mind, AYB Hub is the ultimate workspace for agile teams and startups.

---

## Tech Stack

| Layer | Tech Used |
|---|---|
| **Frontend** | React.js (Vite), TailwindCSS, React Router, Axios |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose), Socket.io |
| **Auth** | JWT + OAuth (Google, Facebook) |
| **Payments** | Stripe / PayPal Integration |
| **DevOps** | Docker, Docker Compose, NGINX, GitHub Actions |
| **Deployment** | Hetzner VPS (Dockerized), CI/CD Ready |

---

## Core Features

| Admin Tools | Team Collaboration | Shared Features |
|---|---|---|
| Role Management | Team Creation & Join Requests | Realtime Chat (Socket.io) |
| Realtime Notifications | Kanban Task Board | File Uploads (Cloudinary) |
| Analytics Dashboard | Projects by Client | Calendar & Deadlines |
| Profile & Settings | Team/Project Switching | Dark/Light Mode |
| Billing & Invoicing | Team Activity Logs | Email Notifications |

---

## Project Structure

### Frontend (React + Vite)

```
├── components/     # Reusable UI Elements
├── features/       # Logic grouped by domain (auth, team, etc.)
├── pages/          # Page-level components
├── layout/         # App shell (sidebar, navbar)
├── hooks/          # Custom React hooks
├── context/        # Global state using Context API
├── services/       # Axios API requests
├── assets/         # Icons, images, styles
├── App.jsx
└── main.jsx
```

### Backend (Node.js + Express)

```
Server/
├── controllers/    # Business logic for each route
├── routes/         # Express routes (auth, team, project, chat)
├── models/         # Mongoose models (User, Project, Task, Team)
├── middlewares/    # Token verification, error handling, etc.
├── config/         # DB, Cloudinary, email configs
├── sockets/        # Realtime chat & notifications (Socket.io)
├── utils/          # Reusable helpers (token, OTP, mailer)
├── app.js
└── server.js
```

The app uses `.env` files for secure configuration.

### Environment Variables Example

```env
PORT=3000
MONGO_URI=...
TOKEN_KEY=...
SESSION_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
EMAIL_SENDER=...
EMAIL_PASS=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## License

This project is not open-source.  
All rights reserved &copy; 2025 Ayoub Ameur.  
Please do not copy, modify, or redistribute any part of this codebase without written permission.

---

## Credits

Designed & developed by **Ayoub Ameur**  
Fullstack Developer & UI/UX Designer

## Contact

Want to hire me, collaborate, or ask about AYB Hub?

- Email: [ayoubyameury@gmail.com](mailto:ayoubyameury@gmail.com)
- LinkedIn: [linkedin.com/in/ayoubameur](https://www.linkedin.com/in/ayoubameur)
