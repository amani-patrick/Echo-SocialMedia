# EchoSols Frontend (client/)

Single-page React app powered by Vite that talks to the API gateway and all backend microservices.

## Features

- JWT auth flow (register/login) wired to the user-service via the gateway.
- Feed with post creation, reactions, and inline comments.
- Profile editing, friendship management, notifications drawer.
- React Context + custom hooks (`useAuth`, `useApi`, `useAsync`, `useSocket`) for advanced state management.
- Socket-ready hook for real-time notifications (falls back to polling).

## Getting Started

```bash
cd client
cp env.example .env         # edit if gateway runs on another host
npm install
npm run dev                 # launches Vite dev server on http://localhost:5173
```

To build for production:

```bash
npm run build
npm run preview
```

The app expects the API gateway to be reachable at `VITE_API_URL` (default `http://localhost:8080`). You can point `VITE_SOCKET_URL` at a Socket.IO endpoint if/when real-time notifications are available.

