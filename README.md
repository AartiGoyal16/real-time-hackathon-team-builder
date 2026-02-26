## Overview

This project allows developers to:
- Discover hackathon teammates
- Create and join teams
- Chat in real-time
- Manage user profiles securely

## Real-Time Hackathon Team Builder

A full-stack MERN application that enables developers to connect, build teams, and collaborate in real-time during hackathons.

## Tech Stack

### Frontend
- Next.js (APP Router)
- React
- TypeScript
- Axios
- Socket.io-client
- Tailwind CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication (httpOnly cookie-based)
- Socket.io

## Features
- User registration & login using JWT stored in httpOnly cookies
- Create and update user profile
- Create and manage teams
- Protected routes using middleware
- Real-time chat using Socket.io
- Secure password hashing with bcrypt

## Security Features

- JWT stored in httpOnly cookies
- Protected routes using authentication middleware
- Secure password hashing with bcrypt
- CORS configured with credentials support


## Project Structure

hackTeam/
│
├── backend/        # Express APIs, Socket.io, MongoDB
└── frontend/       # Next.js application
    ├── app/        # App Router pages
    ├── components/ # Reusable UI components
    ├── public/     # Static assets
    └── lib/        # Utility functions

## API Endpoints

### Auth
- POST /api/auth/register – Register new user
- POST /api/auth/login – Login user

### User
- GET /api/user/profile – Get logged-in user profile (Protected)
- PUT /api/user/update – Update user profile (Protected)

### Team
- POST /api/team/create – Create a new team (Protected)
- GET /api/team/all – Get all teams (Protected)
- POST /api/team/join/:teamId – Join a team (Protected)
- POST /api/team/leave/:teamId – Leave a team (Protected)
- GET /api/team/recommend – Get recommended teams (Protected)

### Messages
- GET /api/message/:teamId – Get message history of a team (Protected)

## Installation

### Backend
cd backend
npm install
npm run dev

### Frontend (Next.js)
cd frontend
npm install
npm run dev

Frontend runs on: http://localhost:3000  
Backend runs on: http://localhost:5000 

> Note: The backend is configured with CORS and credentials enabled for secure httpOnly cookie authentication.

## Environment Variables (backend/config.env)
Create a config.env file inside the backend folder
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=your_client_connection_string


## Recent Updates
 - Migrated frontend from Vite to Next.js for better routing and scalability
 - Added TypeScript support
 - Integrated Tailwind CSS
 - Implemented real-time messaging system


## Project Status
Backend: Completed (including real-time messaging with Socket.io)
Frontend: In Development (Next.js with App Router)