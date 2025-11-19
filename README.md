# EchoSols Social Media Platform

A scalable full-stack social media platform built with the MERN stack, organized into microservices.  
This project demonstrates modern standards for web, API, DevOps, and microservices architecture.

---

## Features

- User authentication and profile management (JWT-based)
- Create/read/delete/edit posts with media upload
- Comment on posts, nested reply threads
- Follow/unfollow users, see friend/follow feed
- Notifications (likes, comments, new followers)
- Real-time updates (WebSockets/Socket.io)
- Pagination, search, and feeds
- Full Docker Compose support for local development
- Includes unit/integration/end-to-end tests
- CI/CD with GitHub Actions
- Clean architecture and RESTful API gateway

---

## Technologies Used

- **Frontend:** React (hooks, context API, axios)
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **Authentication:** JWT + bcrypt
- **Realtime:** Socket.io
- **DevOps:** Docker, Docker Compose, .env configs, GitHub Actions

---

## Project

echosols-social-media/
user-service/
post-service/
comment-service/
friendship-service/
notification-service/
client/
docker-compose.yml
README.md


Each service is a standalone Node.js+Express app with its own database connection and business logic.

---

## Development Setup

### 1. Prerequisites

- [Node.js](https://nodejs.org/) & npm
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- [Git](https://git-scm.com/)

### 2. Clone the Repo

```bash
git clone https://github.com/your-username/echosols-social-media.git
cd echosols-social-media
```


### 3. Environment Variables

Each service contains an example `.env.example`.
- Copy to `.env` and customize as needed in each folder.

### 4. Run with Docker Compose

Spin up all services and the database:
docker-compose up --build
- Frontend: [http://localhost:3000](http://localhost:3000)
- User Service: [http://localhost:4000](http://localhost:4000)
- Post Service: [http://localhost:5000](http://localhost:5000)
- (Ports may be adjusted in `docker-compose.yml`)

### 5. Running Locally (Manual Dev Mode)

For hot reload while coding, run each service separately:
```bash
# User Service
cd user-service
npm install
npm run dev

# Post Service
cd post-service
npm install
npm run dev

# Comment Service
cd comment-service
npm install
npm run dev

# Friendship Service
cd friendship-service
npm install
npm run dev

# Notification Service
cd notification-service
npm install
npm run dev
```

### 6. Frontend

```bash
# Frontend
cd client
npm install
npm run dev
```
