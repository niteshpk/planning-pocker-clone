#!/bin/bash

echo "Testing persistence functionality..."

# Start the dev server in background
cd client && npm run dev &
DEV_PID=$!

# Wait for server to start
sleep 5

echo "Development server started with PID: $DEV_PID"
echo ""
echo "To test persistence:"
echo "1. Open http://localhost:5173 in your browser"
echo "2. Create or join a room"
echo "3. Refresh the page"
echo "4. You should automatically be reconnected to the room"
echo ""
echo "Press Ctrl+C to stop the development server"

# Wait for user to stop
wait $DEV_PID