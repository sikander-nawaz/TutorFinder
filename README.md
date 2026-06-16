# TutorFinder

Pakistan's #1 trusted tutoring platform — connecting students with verified, background-checked home and online tutors with a 2-day free trial.

**Live Demo:** https://tutor-finder-frontend-lac.vercel.app

---

## Features

### For Students
- Search tutors by subject, city, level, price range, and teaching mode (online / home visit)
- View tutor profiles with ratings, reviews, qualifications, and available courses
- Send tuition requests and manage them from a personal dashboard
- 2-day free trial before committing
- Identity verification flow

### For Tutors
- Register and submit verification documents
- Manage profile, subjects, availability, and hourly rate
- Create and manage courses
- Accept/reject student requests
- Track earnings and completed sessions

### For Admins
- User management (block/unblock accounts)
- Tutor verification workflow (review docs → schedule interview → approve/reject)
- Platform revenue tracking (10% commission on sessions)
- Manage all requests and courses

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, Tailwind CSS, Framer Motion |
| Backend | Express.js 5, TypeScript, esbuild |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (access + refresh tokens) via HTTP-only cookies |
| File Uploads | Cloudinary |
| Email | Resend |
| Monorepo | pnpm workspaces |
| Frontend Deploy | Vercel |
| Backend Deploy | Railway (Docker) |

---

## Project Structure

```
TutorFinder/
├── frontend/                  # Next.js 15 app (App Router)
│   ├── app/                   # Routes (about, chat, dashboard, tutors…)
│   └── src/
│       ├── components/        # Reusable UI components
│       ├── views/             # Page-level components
│       ├── hooks/             # Custom React hooks
│       └── lib/               # API client, utilities
├── backend/                   # Express.js API
│   └── src/
│       ├── controllers/       # Route handlers
│       ├── models/            # Mongoose schemas
│       ├── routes/            # API routes
│       ├── services/          # Business logic
│       ├── middleware/        # Auth, rate limiting, error handling
│       └── config/            # DB, Cloudinary, env validation
├── Dockerfile                 # Railway deployment
├── railway.json               # Railway config
└── pnpm-workspace.yaml        # Monorepo workspace
```

---

## Local Development

### Prerequisites
- Node.js 22+
- pnpm (`npm install -g pnpm`)
- MongoDB Atlas account

### Setup

```bash
# Clone the repo
git clone https://github.com/Shahmeer-8/tutor-finder.git
cd tutor-finder/TutorFinder

# Install dependencies
pnpm install

# Create backend environment file
cp backend/.env.example backend/.env
# Fill in your values (MongoDB URI, JWT secrets, Cloudinary, Resend)
```

### Run

```bash
# Backend (http://localhost:8080)
pnpm --filter @workspace/backend run dev

# Frontend (http://localhost:3000)
pnpm --filter @workspace/tutor-finder run dev
```

### Seed Demo Data

```bash
cd backend
node seed.mjs
```

This creates:
- **178 tutors** (168 approved, 4 docs submitted, 3 interview scheduled, 3 rejected)
- **40 students** (38 approved, 2 pending)
- **438 courses**, **240 requests**, **120 reviews**

**Demo accounts** (password: `Demo@1234`):

| Role | Email |
|---|---|
| Admin | admin@tutorfinder.pk |
| Tutor | ahmad.raza@demo.com |
| Student | ali.hassan.s@demo.com |

---

## Environment Variables

### Backend (`backend/.env`)

```env
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/TutorFinder
JWT_ACCESS_SECRET=<32+ random chars>
JWT_REFRESH_SECRET=<32+ random chars>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
CLOUDINARY_CLOUD_NAME=<value>
CLOUDINARY_API_KEY=<value>
CLOUDINARY_API_SECRET=<value>
RESEND_API_KEY=<value>
EMAIL_FROM=noreply@yourdomain.com
CLIENT_URL=https://your-frontend.vercel.app
```

### Frontend (Vercel Environment Variables)

```env
BACKEND_URL=https://your-backend.up.railway.app
```

---

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/tutors` | Public | Search tutors |
| GET | `/api/tutors/:id` | Public | Get tutor profile |
| GET | `/api/reviews/:tutorId` | Public | Get tutor reviews |
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/logout` | Auth | Logout |
| GET | `/api/profile` | Auth | Get own profile |
| PUT | `/api/profile` | Auth | Update profile |
| GET | `/api/requests` | Auth | List requests |
| POST | `/api/requests` | Auth | Create request |
| GET | `/api/courses` | Auth | List courses |
| POST | `/api/courses` | Auth | Create course |
| GET | `/api/earnings` | Auth (Tutor) | Earnings summary |
| GET | `/api/admin/users` | Auth (Admin) | All users |
| PUT | `/api/admin/verify/:id` | Auth (Admin) | Verify tutor |

---

## Deployment

### Backend (Railway)

1. Connect your GitHub repo to Railway
2. Set builder to **Dockerfile**
3. Add all backend environment variables in Railway's Variables tab
4. Generate a public domain under Networking settings

### Frontend (Vercel)

1. Import the GitHub repo into Vercel
2. Set **Root Directory** to `frontend`
3. Add `BACKEND_URL` environment variable pointing to your Railway URL
4. Deploy

---

## License

MIT
