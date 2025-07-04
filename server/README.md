# Planning Poker Server

Backend API for the Planning Poker application built with Next.js, Prisma, and MongoDB.

## Features

- **Room Management**: Create, join, and manage planning poker rooms
- **User Management**: Handle user joining, leaving, and updating
- **Story Management**: Create, update, and delete user stories
- **Voting System**: Cast votes, reveal votes, and clear votes
- **Multiple Voting Systems**: Fibonacci, T-shirt sizes, Powers of 2, etc.
- **Real-time Data**: API endpoints for real-time synchronization

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: MongoDB with Prisma ORM
- **Language**: TypeScript
- **API**: RESTful API endpoints

## Setup

### Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud instance)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your MongoDB connection string:
```
DATABASE_URL="mongodb://localhost:27017/planning-poker"
```

3. Generate Prisma client:
```bash
npm run db:generate
```

4. Push database schema:
```bash
npm run db:push
```

### Development

Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Production

Build and start:
```bash
npm run build
npm start
```

## API Endpoints

### Voting Systems
- `GET /api/voting-systems` - Get all voting systems

### Rooms
- `POST /api/rooms` - Create a new room
- `GET /api/rooms/[roomCode]` - Get room details
- `PUT /api/rooms/[roomCode]` - Update room
- `DELETE /api/rooms/[roomCode]` - Delete room
- `POST /api/rooms/[roomCode]/join` - Join a room
- `POST /api/rooms/[roomCode]/reveal-votes` - Reveal votes
- `POST /api/rooms/[roomCode]/clear-votes` - Clear all votes

### Stories
- `POST /api/rooms/[roomCode]/stories` - Create a story
- `PUT /api/stories/[storyId]` - Update story
- `DELETE /api/stories/[storyId]` - Delete story

### Users
- `PUT /api/users/[userId]` - Update user
- `DELETE /api/users/[userId]` - Remove user

### Voting
- `POST /api/users/[userId]/vote` - Cast vote
- `DELETE /api/users/[userId]/vote` - Clear vote

## Database Schema

### Room
- `id`: Unique identifier
- `roomCode`: 6-character room code
- `name`: Room name
- `hostId`: Host user ID
- `isVotingRevealed`: Whether votes are revealed
- `currentStoryId`: Currently active story
- `votingSystemName`: Selected voting system

### User
- `id`: Unique identifier
- `name`: User name
- `isHost`: Whether user is the host
- `isConnected`: Connection status
- `vote`: Current vote value
- `hasVoted`: Whether user has voted
- `roomId`: Associated room

### Story
- `id`: Unique identifier
- `title`: Story title
- `description`: Story description
- `estimate`: Final estimate
- `isActive`: Whether story is currently being voted on
- `roomId`: Associated room

### VotingSystem
- `id`: Unique identifier
- `name`: System name (Fibonacci, T-shirt, etc.)
- `values`: Array of voting values

## Client Integration

Copy the `api-client.ts` file to your frontend project and use it to communicate with the API:

```typescript
import { apiClient } from './lib/api-client';

// Create a room
const response = await apiClient.createRoom({
  name: 'Sprint Planning',
  hostName: 'John Doe',
  votingSystem: 'Fibonacci'
});

// Join a room
const joinResponse = await apiClient.joinRoom('ABC123', 'Jane Doe');

// Cast a vote
await apiClient.castVote(userId, '5');
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio

## Environment Variables

- `DATABASE_URL` - MongoDB connection string
- `NEXTAUTH_URL` - Application URL (for production)
- `NEXTAUTH_SECRET` - Secret for authentication (if needed)
- `ALLOWED_ORIGINS` - CORS allowed origins