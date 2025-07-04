# MongoDB Setup for Planning Poker

## Transaction Error Fix

If you encounter the error:
```
Prisma needs to perform transactions, which requires your MongoDB server to be run as a replica set
```

This has been resolved by:

1. **Removed automatic seeding** - No more transaction-dependent operations during build
2. **Refactored room creation** - Uses separate create operations instead of nested transactions
3. **Added manual seeding script** - Run `npm run db:seed` when needed

## Database Setup

### Option 1: Simple MongoDB (Recommended for Development)
```bash
# Install MongoDB locally
brew install mongodb/brew/mongodb-community

# Start MongoDB
brew services start mongodb/brew/mongodb-community

# Your DATABASE_URL in .env should be:
DATABASE_URL="mongodb://localhost:27017/planning-poker"
```

### Option 2: MongoDB with Replica Set (For Production)
If you need full transaction support:

```bash
# Start MongoDB as replica set
mongod --replSet rs0 --port 27017 --dbpath /usr/local/var/mongodb

# In mongo shell:
rs.initiate()
```

## Seeding Data

To add voting systems to your database:
```bash
npm run db:seed
```

## Development Workflow

1. Start MongoDB: `brew services start mongodb/brew/mongodb-community`
2. Push database schema: `npm run db:push`
3. Seed voting systems: `npm run db:seed`
4. Start development server: `npm run dev`

## Production Notes

- The application now works with standard MongoDB installations
- No replica set required for basic functionality
- Room creation and all core features work without transactions
- Voting systems are provided as fallbacks if database seeding fails