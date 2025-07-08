import { useState, useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { RoomPage } from './pages/RoomPage';
import { useRoomStore } from './stores/roomStore';

type AppState = 'landing' | 'room';

function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const { currentRoom, currentUser, reconnectToRoom } = useRoomStore();

  // Restore session if user and room exist
  useEffect(() => {
    const initializeApp = async () => {
      // If we have persisted room and user data, try to reconnect
      if (currentRoom && currentUser) {
        await reconnectToRoom();
        // After reconnection attempt, check if we still have valid data
        const updatedRoom = useRoomStore.getState().currentRoom;
        const updatedUser = useRoomStore.getState().currentUser;
        
        if (updatedRoom && updatedUser) {
          setAppState('room');
        } else {
          setAppState('landing');
        }
      } else {
        setAppState('landing');
      }
    };

    initializeApp();
  }, []); // Run only once on mount

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