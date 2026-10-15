# Meme'd Campaign Payout Tracker

A full-stack campaign management platform that connects brands with content creators through milestone-based payouts. Brands can launch Instagram and YouTube campaigns, manage budgets, and track creator performance. Creators can discover available campaigns, submit content links, and earn payouts based on their post views.

## 🚀 Live Demo

- **Frontend:** https://memed-campaign-payout-tracker-six.vercel.app/
- **Backend API:** https://memed-payout-api-jgot.onrender.com
- **GitHub Repository:** https://github.com/bala-codes11/memed-campaign-payout-tracker

## ✨ Features

### Authentication
- User registration and login
- JWT-based authentication
- Role-based access for brands and creators

### Brand Dashboard
- Create Instagram and YouTube campaigns
- Configure view milestones and payout amounts
- Track total campaign budgets, spending, and remaining balances
- Monitor campaign status and payout targets

### Creator Dashboard
- Browse live campaigns with available budgets
- Submit public Instagram and YouTube post URLs
- Track submission views and earnings
- View submission and payout status

### Payout Management
- Calculate payouts based on the highest milestone reached
- Pay only the additional amount when a higher milestone is reached
- Prevent duplicate payments for already-paid milestones
- Enforce campaign budget limits
- Use MongoDB transactions for payout updates

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens (JWT) |
| Testing | Jest |

## 📁 Project Structure

```text
memed-campaign-payout-tracker/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   └── lib/
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

## ⚙️ Local Setup

### Prerequisites

- Node.js and npm
- MongoDB database
- Git

### 1. Clone the repository

```bash
git clone https://github.com/bala-codes11/memed-campaign-payout-tracker.git
cd memed-campaign-payout-tracker
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` as a template.

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
```

Start the backend in development mode:

```bash
npm run dev
```

To build and run the production version locally:

```bash
npm run build
npm start
```

### 3. Configure the frontend

Open a separate terminal:

```bash
cd frontend
npm install
```

Create a `.env.local` file using `.env.example` as a template.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## 🔌 API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| POST | `/api/campaigns` | Create a campaign |
| GET | `/api/campaigns/live` | Get live campaigns with available budgets |
| GET | `/api/campaigns/brand` | Get campaigns belonging to a brand |
| POST | `/api/submissions` | Submit content to a campaign |
| GET | `/api/submissions/me` | Get the creator's submissions |
| PATCH | `/api/submissions/:id/views` | Update views and calculate payouts |

Protected endpoints require valid authentication and appropriate role permissions.

## 🧪 Testing

Run the backend payout service tests:

```bash
cd backend
npm test
```

The test suite covers milestone payout calculations, incremental payouts, exhausted budgets, and budget-cap calculations.

## 🔐 Environment Variables

Configure your own environment variables using the provided example files. Never commit `.env` or `.env.local` files or expose database credentials and JWT secrets in the repository.

## ☁️ Deployment

- **Frontend hosting:** Vercel
- **Backend hosting:** Render
- **Database:** MongoDB Atlas

The frontend communicates with the deployed backend using the `NEXT_PUBLIC_API_URL` environment variable.

## 🔮 Future Improvements

- Automated view verification through social media APIs
- Payout history and transaction reports
- Campaign analytics and performance charts
- Notifications for milestone achievements
- Expanded integration and concurrency testing

## 📄 License

No license has been selected for this project yet.
