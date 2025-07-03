import { useEffect, useRef } from 'react';
import { useUserStore } from '../stores/userStore';
import { useRoomStore } from '../stores/roomStore';
import { getWebRTCManager, resetWebRTCManager } from '../utils/webrtc';
import { WebRTCMessage, Story } from '../types';

export const useWebRTC = () => {
  const { currentUser } = useUserStore();
  const { currentRoom, addUser, removeUser, castVote, revealVotes, addStoryFromWebRTC } = useRoomStore();
  const webRTCManagerRef = useRef<ReturnType<typeof getWebRTCManager> | null>(null);

  useEffect(() => {
    if (currentUser && currentRoom) {
      // Initialize WebRTC manager
      webRTCManagerRef.current = getWebRTCManager(currentUser.id, currentUser.isHost);
      
      // Set up message handler
      webRTCManagerRef.current.setMessageHandler((message: WebRTCMessage) => {
        handleWebRTCMessage(message);
      });

      // Set up peer connection handlers
      webRTCManagerRef.current.setPeerConnectedHandler((peerId: string) => {
        console.log(`Peer ${peerId} connected`);
        // You could update user connection status here
      });

      webRTCManagerRef.current.setPeerDisconnectedHandler((peerId: string) => {
        console.log(`Peer ${peerId} disconnected`);
        // You could remove user or mark as disconnected here
      });

      // Create or join room
      if (currentUser.isHost) {
        webRTCManagerRef.current.createRoom(currentRoom.id);
      }

      return () => {
        // Cleanup on unmount
        if (webRTCManagerRef.current) {
          webRTCManagerRef.current.disconnect();
        }
      };
    }

    return () => {
      resetWebRTCManager();
    };
  }, [currentUser, currentRoom]);

  const handleWebRTCMessage = (message: WebRTCMessage) => {
    switch (message.type) {
      case 'user-joined':
        addUser(message.payload.user);
        break;
      
      case 'user-left':
        removeUser(message.payload.userId);
        break;
      
      case 'vote-cast':
        castVote(message.payload.userId, message.payload.vote);
        break;
      
      case 'vote-revealed':
        revealVotes();
        break;
      
      case 'story-added':
        addStoryFromWebRTC(message.payload.story);
        break;
      
      case 'room-updated':
        // Handle room updates
        console.log('Room updated:', message.payload);
        break;
      
      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const sendMessage = (message: Omit<WebRTCMessage, 'timestamp' | 'senderId'>) => {
    if (webRTCManagerRef.current) {
      webRTCManagerRef.current.sendMessage(message);
    }
  };

  const broadcastVote = (vote: string) => {
    sendMessage({
      type: 'vote-cast',
      payload: { userId: currentUser?.id, vote }
    });
  };

  const broadcastRevealVotes = () => {
    sendMessage({
      type: 'vote-revealed',
      payload: {}
    });
  };

  const broadcastUserJoined = (user: any) => {
    sendMessage({
      type: 'user-joined',
      payload: { user }
    });
  };

  const broadcastStoryAdded = (story: Story) => {
    sendMessage({
      type: 'story-added',
      payload: { story }
    });
  };

  return {
    sendMessage,
    broadcastVote,
    broadcastRevealVotes,
    broadcastUserJoined,
    broadcastStoryAdded,
    isConnected: !!webRTCManagerRef.current,
  };
};