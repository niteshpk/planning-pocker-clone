# MySQL Setup for Planning Poker

## Database Setup

The application now uses **MySQL** with **phpMyAdmin** for database management, replacing the previous MongoDB implementation.

### MySQL Installation and Setup

#### Option 1: Local MySQL Installation
```bash
# Install MySQL locally (macOS)
brew install mysql

# Start MySQL
brew services start mysql

# Secure the installation (optional but recommended)
mysql_secure_installation
```

#### Option 2: Using XAMPP/MAMP (Includes phpMyAdmin)
1. Download and install [XAMPP](https://www.apachefriends.org/index.html) or [MAMP](https://www.mamp.info/)
2. Start Apache and MySQL services
3. Access phpMyAdmin at `http://localhost/phpmyadmin`

### Database Configuration

1. **Create the database:**
   - Open phpMyAdmin in your browser
   - Click "New" to create a new database
   - Name it `planning_poker`
   - Click "Create"

2. **Import the schema:**
   - Select the `planning_poker` database
   - Click "Import" tab
   - Choose the file `server/database/schema.sql`
   - Click "Go" to execute

### Environment Configuration

Create a `.env` file in the server directory:
```bash
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=planning_poker
```

**Note:** Replace `your_mysql_password` with your actual MySQL root password.

## Key Changes from MongoDB

### Room Code Length
- **Changed from 24 characters to 6 characters** for better usability
- Format: `ABC123` (uppercase letters and numbers)

### Database Structure
- **Relational structure** instead of document-based
- **Foreign key constraints** for data integrity
- **Auto-incrementing IDs** instead of ObjectIds
- **JSON fields** for voting system values

### Field Name Changes
- `roomCode` → `room_code`
- `isVotingRevealed` → `is_voting_revealed`
- `currentStoryId` → `current_story_id`
- `votingSystemName` → `voting_system_name`
- `isHost` → `is_host`
- `isConnected` → `is_connected`
- `hasVoted` → `has_voted`
- `roomId` → `room_id`
- `isActive` → `is_active`

## Development Workflow

1. **Start MySQL:** `brew services start mysql` (or start XAMPP/MAMP)
2. **Access phpMyAdmin:** Open `http://localhost/phpmyadmin`
3. **Install dependencies:** `npm install`
4. **Start development server:** `npm run dev`

## Production Notes

- Use environment variables for database credentials
- Enable SSL for production database connections
- Set up proper backup strategies
- Consider connection pooling for high traffic
- Monitor database performance and optimize queries as needed

## Accessing phpMyAdmin

- **URL:** `http://localhost/phpmyadmin`
- **Username:** `root`
- **Password:** Your MySQL root password

From phpMyAdmin you can:
- View and edit data
- Run SQL queries
- Monitor database performance
- Export/import data
- Manage users and permissions