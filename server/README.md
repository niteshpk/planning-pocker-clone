# Planning Poker Laravel Backend

This Laravel backend provides a complete API for the Planning Poker application, replacing the original Next.js server while maintaining the same API structure and request/response format.

## Features

- **Complete API Compatibility**: All endpoints match the original Next.js API structure
- **MySQL Database Support**: Full MySQL database integration with proper relationships
- **SQLite Fallback**: Can use SQLite for development/testing
- **Voting Systems**: Pre-seeded with Fibonacci, T-Shirt sizes, and other voting systems
- **Room Management**: Create, join, update, and delete planning poker rooms
- **User Management**: Handle user voting and room participation
- **Story Management**: Create and manage stories for estimation

## Database Schema

The application uses the following tables:
- `voting_systems`: Available voting systems (Fibonacci, T-Shirt sizes, etc.)
- `rooms`: Planning poker rooms with room codes and settings
- `planning_poker_users`: Users participating in rooms
- `stories`: Stories to be estimated in rooms

## API Endpoints

### Voting Systems
- `GET /api/voting-systems` - Get all available voting systems

### Rooms
- `POST /api/rooms` - Create a new room
- `GET /api/rooms/{roomCode}` - Get room details
- `PUT /api/rooms/{roomCode}` - Update room settings
- `DELETE /api/rooms/{roomCode}` - Delete a room
- `POST /api/rooms/{roomCode}/join` - Join a room

### Stories
- `GET /api/rooms/{roomCode}/stories` - Get all stories in a room
- `POST /api/rooms/{roomCode}/stories` - Create a new story
- `GET /api/stories/{storyId}` - Get story details
- `PUT /api/stories/{storyId}` - Update a story
- `DELETE /api/stories/{storyId}` - Delete a story

### Users & Voting
- `GET /api/users/{userId}` - Get user details
- `PUT /api/users/{userId}` - Update user information
- `POST /api/users/{userId}/vote` - Cast a vote
- `DELETE /api/users/{userId}/vote` - Clear a vote

## Setup Instructions

### Prerequisites
- PHP 8.1 or higher
- Composer
- MySQL (optional, SQLite is default)

### Installation

1. **Install Dependencies**
   ```bash
   composer install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Database Setup**
   
   For SQLite (default):
   ```bash
   touch database/database.sqlite
   ```
   
   For MySQL:
   ```bash
   # Update .env file:
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=planning_poker
   DB_USERNAME=root
   DB_PASSWORD=your_password
   
   # Create database
   mysql -u root -p -e "CREATE DATABASE planning_poker;"
   ```

4. **Run Migrations and Seed Data**
   ```bash
   php artisan migrate:fresh --seed
   ```

5. **Start the Server**
   ```bash
   # Using PHP built-in server (recommended)
   php -S localhost:3000 -t public
   
   # Or using Laravel's artisan serve
   php artisan serve --port=3000
   ```

## API Response Format

All API responses follow this consistent format:

```json
{
  "success": true,
  "data": {...},
  "message": "Optional success message"
}
```

For errors:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Example API Usage

### Create a Room
```bash
curl -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"name":"Sprint Planning","hostName":"John Doe","votingSystem":"Fibonacci"}'
```

### Join a Room
```bash
curl -X POST http://localhost:3000/api/rooms/ABC123/join \
  -H "Content-Type: application/json" \
  -d '{"userName":"Jane Smith"}'
```

### Cast a Vote
```bash
curl -X POST http://localhost:3000/api/users/1/vote \
  -H "Content-Type: application/json" \
  -d '{"vote":"5"}'
```

## Development

### Running Tests
```bash
php artisan test
```

### Code Style
```bash
./vendor/bin/pint
```

### Database Reset
```bash
php artisan migrate:fresh --seed
```

## Production Deployment

1. Set `APP_ENV=production` in `.env`
2. Set `APP_DEBUG=false` in `.env`
3. Configure MySQL database
4. Run `php artisan config:cache`
5. Run `php artisan route:cache`
6. Set up proper web server (Apache/Nginx)

## Differences from Original Next.js API

- Uses Laravel's Eloquent ORM instead of custom MySQL queries
- Improved error handling and validation
- Better database relationship management
- Consistent API response format
- Built-in Laravel features (middleware, validation, etc.)

The API maintains 100% compatibility with the original frontend client.

## Real-time Features

The Laravel backend now includes comprehensive real-time functionality using Server-Sent Events (SSE):

### Real-time Events

All users in a room receive instant updates when:
- **Stories are created** - New stories appear immediately for all participants
- **Stories are updated** - Changes to story details, estimates, or active status
- **Room settings change** - Voting reveals, active story selection, room name changes
- **Users join/leave** - Participant list updates in real-time
- **Voting occurs** - Vote casting and clearing notifications

### Event Streaming Endpoints

- `GET /api/rooms/{roomCode}/events` - Server-Sent Events stream for real-time updates
- `GET /api/rooms/{roomCode}/state` - Get current room state for initial load

### Event Types

The system broadcasts these event types:
- `story.created` - When a new story is added
- `story.updated` - When story details change
- `room.updated` - When room settings or participants change
- `user.voted` - When users cast or clear votes
- `heartbeat` - Keep-alive messages every 30 seconds

### Testing Real-time Functionality

1. **Start the server**:
   ```bash
   php -S localhost:3000 -t public
   ```

2. **Open the test page**:
   ```
   http://localhost:3000/realtime-test.html
   ```

3. **Test real-time updates**:
   - Open multiple browser tabs/windows
   - Add stories in one tab and watch them appear in others
   - Join users and see participant updates
   - Cast votes and observe real-time voting status

### Client Integration

To integrate real-time functionality in your frontend:

```javascript
// Connect to event stream
const eventSource = new EventSource('/api/rooms/ROOMCODE/events');

// Listen for story creation
eventSource.addEventListener('story.created', function(event) {
    const data = JSON.parse(event.data);
    // Update UI with new story: data.story
});

// Listen for voting updates
eventSource.addEventListener('user.voted', function(event) {
    const data = JSON.parse(event.data);
    // Update UI with user vote: data.user
});

// Handle connection events
eventSource.onopen = () => console.log('Connected');
eventSource.onerror = () => console.log('Connection error');
```

### Architecture

The real-time system uses:
- **File-based Event Storage**: Events stored in `storage/app/events/{roomCode}.json`
- **Server-Sent Events**: HTTP streaming for real-time delivery
- **Event Broadcasting Service**: Centralized event management
- **Automatic Cleanup**: Old events automatically pruned (keeps last 100 events)

This approach provides reliable real-time functionality without requiring external services like Redis or Pusher.