import React, { useState } from 'react';
import { Button } from '../components/Button';

// Import both store versions
import { useRoomStore as useRoomStoreLocal } from '../stores/roomStore';
import { useRoomStore as useRoomStoreApi } from '../stores/roomStoreApi';
import { useUserStore } from '../stores/userStore';

export const DemoPage: React.FC = () => {
  const [useApi, setUseApi] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [userName, setUserName] = useState('');
  const [roomName, setRoomName] = useState('');
  
  // Use the appropriate store based on toggle
  const roomStore = useApi ? useRoomStoreApi() : useRoomStoreLocal();
  const userStore = useUserStore();
  
  const handleCreateRoom = async () => {
    if (!roomName || !userName) return;
    
    const user = {
      id: Math.random().toString(36).substring(2, 9),
      name: userName,
      isHost: true,
      isConnected: true,
      hasVoted: false,
    };
    
    userStore.setCurrentUser(user);
    
    try {
      const room = await roomStore.createRoom(roomName, user);
      console.log('Room created:', room);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Error creating room: ' + (error as Error).message);
    }
  };
  
  const handleJoinRoom = async () => {
    if (!roomCode || !userName) return;
    
    const user = {
      id: Math.random().toString(36).substring(2, 9),
      name: userName,
      isHost: false,
      isConnected: true,
      hasVoted: false,
    };
    
    userStore.setCurrentUser(user);
    
    try {
      await roomStore.joinRoom(roomCode, user);
      console.log('Joined room successfully');
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Error joining room: ' + (error as Error).message);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Planning Poker Demo</h1>
      
      <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Storage Mode</h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={useApi}
            onChange={(e) => setUseApi(e.target.checked)}
          />
          Use API Backend (requires server running on port 3001)
        </label>
        <p style={{ fontSize: '0.9rem', color: '#666', margin: '0.5rem 0 0 0' }}>
          {useApi 
            ? '✅ Using API backend with MongoDB storage' 
            : '📱 Using localStorage (demo mode)'
          }
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>User Info</h3>
        <input
          type="text"
          placeholder="Your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '0.5rem', 
            marginBottom: '1rem',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h3>Create Room</h3>
          <input
            type="text"
            placeholder="Room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              marginBottom: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          <Button
            onClick={handleCreateRoom}
            disabled={!roomName || !userName}
            style={{ width: '100%' }}
          >
            Create Room
          </Button>
        </div>

        <div>
          <h3>Join Room</h3>
          <input
            type="text"
            placeholder="Room code (e.g., ABC123)"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              marginBottom: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          <Button
            onClick={handleJoinRoom}
            disabled={!roomCode || !userName}
            style={{ width: '100%' }}
          >
            Join Room
          </Button>
        </div>
      </div>

      {roomStore.currentRoom && (
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Current Room</h3>
          <p><strong>Room:</strong> {roomStore.currentRoom.name}</p>
          <p><strong>Code:</strong> {roomStore.currentRoom.roomCode || roomStore.currentRoom.id}</p>
          <p><strong>Users:</strong> {roomStore.currentRoom.users.length}</p>
          <p><strong>Stories:</strong> {roomStore.currentRoom.stories.length}</p>
          <p><strong>Status:</strong> {roomStore.roomStatus}</p>
          
          <Button
            onClick={() => roomStore.leaveRoom()}
            style={{ marginTop: '1rem' }}
          >
            Leave Room
          </Button>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#e8f4fd', borderRadius: '8px' }}>
        <h3>Instructions</h3>
        <ol>
          <li>
            <strong>For API mode:</strong> Start the server first:
            <pre style={{ background: '#f0f0f0', padding: '0.5rem', margin: '0.5rem 0' }}>
              cd server && npm run dev
            </pre>
          </li>
          <li>Enter your name</li>
          <li>Either create a new room or join an existing one with a room code</li>
          <li>The demo will show the difference between localStorage and API storage</li>
        </ol>
      </div>
    </div>
  );
};