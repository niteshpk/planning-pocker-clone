# Planning Poker Application

A complete Planning Poker application with React frontend and Next.js backend using MySQL with phpMyAdmin for data persistence.

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
    ├── database/    # MySQL schema
    ├── models/      # MySQL data models
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
- **MySQL** with native mysql2 driver
- **TypeScript** throughout
- **RESTful API** endpoints
- **CORS** configured for frontend

### Core Functionality
- ✅ Create and join planning poker rooms with **6-character codes**
- ✅ User management (host/participant roles)
- ✅ Story management (CRUD operations)
- ✅ Voting with multiple card systems (Fibonacci, T-shirt, etc.)
- ✅ Vote reveal/hide functionality
- ✅ Real-time state synchronization
- ✅ Data persistence in MySQL
- ✅ Multi-user support across browsers
- ✅ phpMyAdmin for database management

## Quick Start

### 1. Set Up MySQL Database

#### Option A: Using XAMPP/MAMP (Recommended)
1. Download and install [XAMPP](https://www.apachefriends.org/index.html) or [MAMP](https://www.mamp.info/)
2. Start Apache and MySQL services
3. Open phpMyAdmin at `http://localhost/phpmyadmin`
4. Create a database named `planning_poker`
5. Import the schema from `server/database/schema.sql`

#### Option B: Local MySQL Installation
```bash
# Install MySQL (macOS)
brew install mysql

# Start MySQL
brew services start mysql

# Create database and import schema
mysql -u root -p
CREATE DATABASE planning_poker;
USE planning_poker;
source /path/to/server/database/schema.sql;
```

### 2. Start the Backend (Required)

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MySQL credentials

# Seed the database with voting systems
npm run db:seed

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000`

### 3. Start the Frontend

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
npm run db:seed     # Seed voting systems
```

## Environment Variables

### Client (.env)
```
VITE_API_URL=http://localhost:3000/api
```

### Server (.env)
```
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=planning_poker

# Development settings
NODE_ENV=development
```

## Database Schema

### Key Changes from Previous Version
- **Room codes are now 6 characters** (e.g., `ABC123`) instead of 24 characters
- **Relational MySQL structure** instead of document-based MongoDB
- **Foreign key constraints** for data integrity
- **Auto-incrementing IDs** instead of ObjectIds

### Tables

#### rooms
- `id` (Primary Key)
- `room_code` (6 characters, unique)
- `name`, `host_id`, `is_voting_revealed`
- `current_story_id`, `voting_system_name`
- `created_at`, `updated_at`

#### users
- `id` (Primary Key)
- `name`, `is_host`, `is_connected`
- `vote`, `has_voted`, `room_id` (Foreign Key)
- `created_at`, `updated_at`

#### stories
- `id` (Primary Key)
- `title`, `description`, `estimate`
- `is_active`, `room_id` (Foreign Key)
- `created_at`, `updated_at`

#### voting_systems
- `id` (Primary Key)
- `name` (unique), `values` (JSON)
- `created_at`, `updated_at`

## Database Management

### Using phpMyAdmin
- **URL**: `http://localhost/phpmyadmin`
- **Username**: `root`
- **Password**: Your MySQL root password

From phpMyAdmin you can:
- View and edit data in real-time
- Run SQL queries
- Monitor database performance
- Export/import data
- Manage users and permissions

### Useful SQL Queries
```sql
-- View all rooms with user counts
SELECT r.room_code, r.name, COUNT(u.id) as user_count
FROM rooms r
LEFT JOIN users u ON r.id = u.room_id
GROUP BY r.id;

-- View voting status for a room
SELECT u.name, u.vote, u.has_voted
FROM users u
JOIN rooms r ON u.room_id = r.id
WHERE r.room_code = 'ABC123';
```

## Architecture

The application uses a client-server architecture:

- **Frontend**: React SPA that communicates with the backend via REST APIs
- **Backend**: Next.js API server with MySQL database
- **State Management**: Zustand stores that sync with the API
- **Data Flow**: All operations go through API endpoints for persistence
- **Database**: MySQL with phpMyAdmin for management

## Deployment

### Frontend (Vercel/Netlify)
1. Build the client: `cd client && npm run build`
2. Deploy the `dist` folder
3. Set environment variable: `VITE_API_URL=https://your-api-domain.com/api`

### Backend (Vercel/Railway/Heroku)
1. Deploy the `server` directory
2. Set environment variables (DB_HOST, DB_USER, etc.)
3. Run database seeding: `npm run db:seed`

### MySQL Setup for Production
- Use services like PlanetScale, AWS RDS, or DigitalOcean Managed Databases
- Enable SSL connections for security
- Set up proper backup strategies
- Configure connection pooling for high traffic

## Migration from MongoDB

This application has been migrated from MongoDB to MySQL. Key changes include:

- **Room codes**: Reduced from 24 to 6 characters for better usability
- **Field naming**: Snake_case (MySQL) vs camelCase (MongoDB)
- **Data relationships**: Foreign keys vs document references
- **Queries**: SQL vs MongoDB query language

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with both frontend and backend running
5. Ensure MySQL database is properly set up
6. Submit a pull request

## License

MIT License - see LICENSE file for details

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
- Unique room code
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

```
docker run -d \
  --name mongo-rs \
  -p 27017:27017 \
  -v mongo-data:/data/db \
  mongo \
  --replSet rs0
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with both frontend and backend running
5. Submit a pull request

## License

MIT License - see LICENSE file for details