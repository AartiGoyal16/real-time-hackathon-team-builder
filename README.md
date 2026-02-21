Real-Time Hackathon Team Builder

A full-stack MERN application that enables developers to connect, build teams, and collaborate in real-time during hackathons.

Tech Stack

Frontend

React (Vite)
Axios
Socket.io-client

Backend

Node.js
Express.js
MongoDB
Mongoose
JWT Authentication
Socket.io

Features
User registration & login (JWT authentication)
Create and update user profile
Create and manage teams
Protected routes using middleware
Real-time chat using Socket.io
Secure password hashing with bcrypt

Project Structure

hackTeam/
   -> backend/   #Express Server, APIs, Socket.io, MongoDB 
   -> frontend/  #React (Vite) client application

## API Endpoints

Auth:
POST /api/auth/register - Register new user
POST /api/auth/login -Login user

User:
GET /api/user/profile - Get loggedin user profile (Protected)
PUT /api/user/update -Update user profile (Protected)

Team:
POST /api/team/create - Create a new team (Protected)
GET /api/team/all - Get all teams (Protected)
POST /api/team/join/:teamId - Join a team (Protected)
POST /api/team/leave/:teamId - Leave a team (Protected)
GET /api/team/recommend - Get recommend teams (Protected)

Messages:
GET /api/message/:teamId - Get message history of a team (Protected)

Installation

Backend
cd backend
npm install
npm run dev

Frontend
cd frontend
npm install
npm run dev

Environment Variables (backend/config.env)
Create a config.env file inside the backend folder
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key



Project Status
Backend: Completed (including real-time messaging with Socket.io)
Frontend: In Progress