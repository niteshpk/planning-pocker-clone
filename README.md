# Planning Poker Application

A complete Planning Poker application with React frontend and Next.js backend using MongoDB for data persistence.

## Project Structure

```
pocker/
├── client/          # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── stores/      # API-based Zustand stores
│   │   ├── lib/
│   │   │   └── api-client.ts     # API client for backend
│   │   └── types/
│   └── package.json
└── server/          # Next.js backend API
    ├── app/api/     # API routes
    ├── lib/         # Database connection
    ├── prisma/      # Database schema
    ├── types/       # TypeScript types
    └── utils/       # Utility functions
```

## Features

### Frontend (Client)
- **React 18** with TypeScript and Vite
- **Zustand** for state management (API-based)
- **Tailwind CSS** for styling
- **WebRTC** for real-time communication
- **API Integration** for all data operations

### Backend (Server)
- **Next.js 14** with App Router
- **Prisma ORM** with MongoDB
- **TypeScript** throughout
- **RESTful API** endpoints
- **CORS** configured for frontend

### Core Functionality
- ✅ Create and join planning poker rooms
- ✅ User management (host/participant roles)
- ✅ Story management (CRUD operations)
- ✅ Voting with multiple card systems (Fibonacci, T-shirt, etc.)
- ✅ Vote reveal/hide functionality
- ✅ Real-time state synchronization
- ✅ Data persistence in MongoDB
- ✅ Multi-user support across browsers

## Quick Start

### 1. Start the Backend (Required)

The application requires the backend server with MongoDB:

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB connection string

# Generate Prisma client and push schema
npm run db:generate
npm run db:push

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000`

### 2. Start the Frontend

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Set up environment variables
echo "VITE_API_URL=http://localhost:3000/api" > .env

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Rooms
- `POST /api/rooms` - Create room
- `GET /api/rooms/[code]` - Get room details
- `PUT /api/rooms/[code]` - Update room
- `POST /api/rooms/[code]/join` - Join room
- `POST /api/rooms/[code]/reveal-votes` - Reveal votes
- `POST /api/rooms/[code]/clear-votes` - Clear votes

### Stories
- `POST /api/rooms/[code]/stories` - Create story
- `PUT /api/stories/[id]` - Update story
- `DELETE /api/stories/[id]` - Delete story

### Users & Voting
- `PUT /api/users/[id]` - Update user
- `POST /api/users/[id]/vote` - Cast vote
- `DELETE /api/users/[id]/vote` - Clear vote

### Voting Systems
- `GET /api/voting-systems` - Get available voting systems

## Development

### Frontend Development
```bash
cd client
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend Development
```bash
cd server
npm run dev         # Start dev server
npm run build       # Build for production
npm run db:studio   # Open Prisma Studio
npm run db:push     # Push schema changes
```

## Environment Variables

### Client (.env)
```
VITE_API_URL=http://localhost:3000/api
```

### Server (.env)
```
DATABASE_URL="mongodb://localhost:27017/planning-poker"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
```

## Database Schema

### Room
- Unique room code (6 characters)
- Room name and host information
- Voting system configuration
- Vote reveal state

### User
- User name and connection status
- Host/participant role
- Current vote and voting state
- Associated room

### Story
- Title and description
- Estimation value
- Active state for current voting
- Associated room

### VotingSystem
- System name (Fibonacci, T-shirt, etc.)
- Available values array

## Architecture

The application uses a client-server architecture:

- **Frontend**: React SPA that communicates with the backend via REST APIs
- **Backend**: Next.js API server with MongoDB database
- **State Management**: Zustand stores that sync with the API
- **Data Flow**: All operations go through API endpoints for persistence

## Deployment

### Frontend (Vercel/Netlify)
1. Build the client: `cd client && npm run build`
2. Deploy the `dist` folder
3. Set environment variable: `VITE_API_URL=https://your-api-domain.com/api`

### Backend (Vercel/Railway/Heroku)
1. Deploy the `server` directory
2. Set environment variables (DATABASE_URL, etc.)
3. Run database migrations: `npm run db:push`

### MongoDB Setup
- Use MongoDB Atlas for cloud hosting
- Or set up local MongoDB with replica set for transactions
- Ensure connection string is properly configured

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with both frontend and backend running
5. Submit a pull request

## License

MIT License - see LICENSE file for details