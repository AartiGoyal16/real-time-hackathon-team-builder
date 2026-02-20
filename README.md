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
Real-time communication with Socket.io
Secure password hashing with bcrypt

Project Structure

hackTeam/
   -> backend/
   -> frontend/

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
This project is currently under development.
Backend core authentication and team APIs are implemented.
Socket.io integration is in progress.
Frontend setup is initialized using Vite (UI implementation pending).