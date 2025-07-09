import { useEffect, useRef } from 'react';
import { useRoomStore } from '../stores/roomStore';

export const useServerEvents = () => {
  const { currentRoom, refreshRoom } = useRoomStore();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!currentRoom?.roomCode) {
      return;
    }

    // Create EventSource connection to server
    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_URL}/rooms/${currentRoom.roomCode}/events`
    );
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('Connected to server events');
    };

    eventSource.addEventListener('connected', (event) => {
      console.log('Server connection confirmed:', JSON.parse(event.data));
    });

    eventSource.addEventListener('story.created', (event) => {
      const data = JSON.parse(event.data);
      console.log('Story created event received:', data);
      
      if (data.story) {
      // Refresh the entire room state to get the new story
      refreshRoom();
      }
    });

    eventSource.addEventListener('story.updated', (event) => {
      const data = JSON.parse(event.data);
      console.log('Story updated event received:', data);
      // Refresh the entire room state to get the updated story
      refreshRoom();
    });

    eventSource.addEventListener('heartbeat', (event) => {
      console.log('Heartbeat received:', JSON.parse(event.data));
    });

    eventSource.addEventListener('disconnect', (event) => {
      const data = JSON.parse(event.data);
      console.log('Server disconnect received:', data);
      // Close the connection cleanly when server sends disconnect
      eventSource.close();
    });

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
    };

    // Cleanup on unmount or room change
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [currentRoom?.roomCode, refreshRoom]);

  return {
    isConnected: !!eventSourceRef.current && eventSourceRef.current.readyState === EventSource.OPEN
  };
};