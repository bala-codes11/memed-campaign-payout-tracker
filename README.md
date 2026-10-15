# Meme'd Campaign Payout Tracker

A full-stack web application that connects brands and content creators through social media campaigns with milestone-based payouts. Brands can create campaigns, manage budgets, and track spending, while creators can join campaigns, submit post links, and earn money based on their post views.

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Role-based access for brands and creators

### Brand Dashboard
- Create campaigns for Instagram and YouTube
- Define view milestones and corresponding payouts
- Track campaign budgets, total spending, and remaining balances
- View campaign submissions and creator performance

### Creator Dashboard
- Browse live campaigns with available budgets
- Submit Instagram and YouTube post links
- Track post views and earnings
- View submission and payout status

### Payout Management
- Calculate payouts based on the highest milestone reached
- Pay only the additional amount when a higher milestone is reached
- Prevent duplicate payments for already-paid milestones
- Enforce campaign budget limits
- Use database transactions for payout updates

## Tech Stack

**Frontend**
- Next.js
- React
- TypeScript
- CSS

**Backend**
- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)

**Testing**
- Jest
- TypeScript

## Project Structure

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
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   └── lib/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js and npm
- MongoDB database
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd memed-campaign-payout-tracker
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the URL of your GitHub repository.

### 2. Configure and Run the Backend

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` as a template and configure the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
```

Start the backend using the development script defined in `backend/package.json`.

### 3. Configure and Run the Frontend

Open a separate terminal:

```bash
cd frontend
npm install
```

Create a `.env.local` file using `.env.example` as a template.

Configure the frontend API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend using the development script defined in `frontend/package.json`.

### 4. Run Tests

From the backend directory:

```bash
npm test
```

The payout service tests cover milestone calculations, incremental payouts, and budget limits.

## API Overview

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| POST | `/api/campaigns` | Create a campaign |
| GET | `/api/campaigns/live` | List live campaigns with available budgets |
| GET | `/api/campaigns/brand` | Retrieve the brand's campaigns |
| POST | `/api/submissions` | Submit a post to a campaign |
| GET | `/api/submissions/me` | Retrieve the creator's submissions |
| PATCH | `/api/submissions/:id/views` | Update post views and calculate payouts |

Protected endpoints require valid authentication. Access also depends on the user's role.

## Environment Variables

Never commit `.env` or `.env.local` files to GitHub. Configure your own credentials using the provided example files.

## Deployment

**Frontend:** To be added  
**Backend API:** To be added

Deployment links will be added after the application is deployed.

## Future Improvements

- Automated view verification through social media APIs
- Payout history and transaction reports
- Campaign analytics and performance charts
- Notifications for milestone achievements
- Enhanced concurrency and integration testing

## License

No license has been selected yet.
