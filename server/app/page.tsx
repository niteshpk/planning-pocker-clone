export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Planning Poker API</h1>
      <p>Backend API server for the Planning Poker application.</p>
      
      <h2>Available Endpoints:</h2>
      <ul>
        <li><strong>GET /api/voting-systems</strong> - Get all voting systems</li>
        <li><strong>POST /api/rooms</strong> - Create a new room</li>
        <li><strong>GET /api/rooms/[roomCode]</strong> - Get room details</li>
        <li><strong>PUT /api/rooms/[roomCode]</strong> - Update room</li>
        <li><strong>DELETE /api/rooms/[roomCode]</strong> - Delete room</li>
        <li><strong>POST /api/rooms/[roomCode]/join</strong> - Join a room</li>
        <li><strong>POST /api/rooms/[roomCode]/stories</strong> - Create a story</li>
        <li><strong>PUT /api/stories/[storyId]</strong> - Update story</li>
        <li><strong>DELETE /api/stories/[storyId]</strong> - Delete story</li>
        <li><strong>PUT /api/users/[userId]</strong> - Update user</li>
        <li><strong>DELETE /api/users/[userId]</strong> - Remove user</li>
        <li><strong>POST /api/users/[userId]/vote</strong> - Cast vote</li>
        <li><strong>DELETE /api/users/[userId]/vote</strong> - Clear vote</li>
        <li><strong>POST /api/rooms/[roomCode]/reveal-votes</strong> - Reveal votes</li>
        <li><strong>POST /api/rooms/[roomCode]/clear-votes</strong> - Clear all votes</li>
      </ul>
      
      <h2>Database Status:</h2>
      <p>MongoDB connection configured. Use <code>npm run db:push</code> to sync schema.</p>
    </div>
  );
}