import { useState, useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { RoomPage } from './pages/RoomPage';
import { useUserStore } from './stores/userStore';
import { useRoomStore } from './stores/roomStore';

type AppState = 'landing' | 'room';

function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const { currentUser } = useUserStore();
  const { currentRoom } = useRoomStore();

  // Restore session if user and room exist
  useEffect(() => {
    if (currentUser && currentRoom) {
      setAppState('room');
    } else {
      setAppState('landing');
    }
  }, [currentUser, currentRoom]);

  const handleRoomCreated = () => {
    setAppState('room');
  };

  const handleRoomJoined = () => {
    setAppState('room');
  };

  const handleLeaveRoom = () => {
    setAppState('landing');
  };

  return (
    <div className="App">
      {appState === 'landing' ? (
        <LandingPage 
          onRoomCreated={handleRoomCreated}
          onRoomJoined={handleRoomJoined}
        />
      ) : (
        <RoomPage 
          onLeaveRoom={handleLeaveRoom}
        />
      )}
    </div>
  );
}

export default App;